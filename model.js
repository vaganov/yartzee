import { section_heights } from "./const.js";

export class Model {
  constructor() {
    this.scoreboard = new Array(4).fill().map(() => new Array(16).fill(-1));
    this.cells_to_fill = 48;
    this.dice = new Array(5).fill();
    this.pinned = new Array(5).fill(false);
    this.gotta_roll = false;
    this.rolls_available = 3;
    this.pinned_last = 0;
    this.booked = -1;
    this.roll();
  }

  onPick(index, col) {
    if (this.gotta_roll) {
      return false;
    }
    if (this.scoreboard[col][index] >= 0) {
      return false;
    }
    switch (col) {
      case 0:
        if ((index > 0) && (this.scoreboard[col][index - 1] < 0)) {
          return false;
        }
        break;
      case 2:
        switch (index) {
          case section_heights[0] + section_heights[1] + section_heights[2] + 1:
            break;
          case section_heights[0] + section_heights[1]:
          case section_heights[0] - 1:
            if (this.scoreboard[col][index + 2] < 0) {
              return false;
            }
            break;
          default:
            if (this.scoreboard[col][index + 1] < 0) {
              return false;
            }
        }
        break;
      case 3:
        if (this.booked == index) {
          () => {};
        }
        else if ((this.pinned_last > 0) && (this.cells_to_fill > 1)) {
          return false;
        }
        else if (this.rolls_available == 0) {
          () => {};
        }
        else if (this.booked == -1) {
          this.booked = index;
          this.onbook(index, true);
          return true;
        }
        else {
          return false;
        }
        break;
      default:
        break;
    }
    this.fill_cell(index, col);
    return true;
  }

  fill_cell(index, col) {
    var row = index;
    var section = 0;
    while (row >= section_heights[section]) {
      row -= section_heights[section] + 1;
      section++;
    }
    var section_height = section_heights[section];
    switch (section) {
      case 0:
        var target = row + 1;
        var count = 0;
        for (let die of this.dice) {
          if (die == target) {
            count++;
          }
        }
        this.scoreboard[col][index] = count * target;
        break;
      case 1:
        var sum = 0;
        for (let die of this.dice) {
          sum += die;
        }
        this.scoreboard[col][index] = sum;
        break;
      case 2:
        var freq = new Map();
        for (let d = 1; d <= 6; d++) { // XXX
          freq.set(d, 0);
        }
        for (let die of this.dice) {
          freq.set(die, freq.get(die) + 1); // XXX
        }
        var freq_sorted = new Map([...freq.entries()].sort((x, y) => y[1] - x[1]));
        var i = freq_sorted.entries();
        switch (row) {
          case 0:
            var pair = i.next().value;
            if (pair[1] == 1) {
              var sum = pair[0];
              for (let _ = 0; _ < 4; _++) {
                pair = i.next().value;
                sum += pair[0];
              }
              pair = i.next().value;
              var missing_value = pair[0];
              if ((missing_value == 1) || (missing_value == 6)) {
                this.scoreboard[col][index] = sum + 25;
              }
              else {
                this.scoreboard[col][index] = sum + 20;
              }
            }
            else {
              this.scoreboard[col][index] = 0;
            }
            break;
          case 1:
            var pair1 = i.next().value;
            if (pair1[1] == 5) {
              this.scoreboard[col][index] = 5 * pair1[0] + 30;
            }
            else if (pair1[1] == 3) {
              var pair2 = i.next().value;
              if (pair2[1] == 2) {
                this.scoreboard[col][index] = 3 * pair1[0] + 2 * pair2[0] + 30;
              }
              else {
                this.scoreboard[col][index] = 0;
              }
            }
            else {
              this.scoreboard[col][index] = 0;
            }
            break;
          case 2:
            var pair = i.next().value;
            if (pair[1] >= 4) {
              this.scoreboard[col][index] = 4 * pair[0] + 40;
            }
            else {
              this.scoreboard[col][index] = 0;
            }
            break;
          case 3:
            var pair = i.next().value;
            if (pair[1] == 5) {
              this.scoreboard[col][index] = 5 * pair[0] + 50;
            }
            else {
              this.scoreboard[col][index] = 0;
            }
            break;
        }
    }

    this.fill_totals(col);

    this.cells_to_fill--;
    for (let d in this.pinned) {
      this.pinned[d] = false;
    }
    this.gotta_roll = true;
    if (this.cells_to_fill > 1) {
      this.rolls_available = 3;
    }
    else {
      this.rolls_available = 4;
    }
    if (this.booked != -1) {
      this.onbook(this.booked, false);
      this.booked = -1;
    }
  }

  fill_totals(col) {
    const section1_subtotal_index = section_heights[0];
    if (this.scoreboard[col][section1_subtotal_index] < 0) {
      var section_filled = true;
      var section_total = 0;
      for (let row = 0; row < section_heights[0]; row++) {
        var cell_score = this.scoreboard[col][row];
        if (cell_score >= 0) {
          section_total += cell_score;
        }
        else {
          section_filled = false;
          break;
        }
      }
      if (section_filled) {
        if (section_total >= 60) {
          this.scoreboard[col][section_heights[0]] = section_total + 30;
        }
        else {
          this.scoreboard[col][section_heights[0]] = section_total;
        }
      }
    }

    const section2_subtotal_index = section1_subtotal_index + 1 + section_heights[1];
    if (this.scoreboard[col][section2_subtotal_index] < 0) {
      var ace_count = this.scoreboard[col][0];
      var max = this.scoreboard[col][section_heights[0] + 1];
      var min = this.scoreboard[col][section_heights[0] + 2];
      if ((ace_count >= 0) && (max >= 0) && (min >= 0)) {
        this.scoreboard[col][section2_subtotal_index] = ace_count * (max - min);
      }
    }

    const section3_subtotal_index = section2_subtotal_index + 1 + section_heights[2];
    if (this.scoreboard[col][section3_subtotal_index] < 0) {
      var section_filled = true;
      var section_total = 0;
      for (let row = 0; row < section_heights[2]; row++) {
        var index = section_heights[0] + 1 + section_heights[1] + 1 + row;
        var cell_score = this.scoreboard[col][index];
        if (cell_score >= 0) {
          section_total += cell_score;
        }
        else {
          section_filled = false;
          break;
        }
      }
      if (section_filled) {
        this.scoreboard[col][section3_subtotal_index] = section_total;
      }
    }

    const section_total_index = section3_subtotal_index + 1;
    var section1_subtotal = this.scoreboard[col][section1_subtotal_index];
    var section2_subtotal = this.scoreboard[col][section2_subtotal_index];
    var section3_subtotal = this.scoreboard[col][section3_subtotal_index];
    if ((section1_subtotal >= 0) && (section2_subtotal >= 0) && (section3_subtotal >= 0)) {
      this.scoreboard[col][section_total_index] = section1_subtotal + section2_subtotal + section3_subtotal;
    }

    var all_totals_filled = true;
    var total = 0;
    for (let c = 0; c < 4; c++) {
      var section_total = this.scoreboard[c][section_total_index];
      if (section_total >= 0) {
        total += section_total;
      }
      else {
        all_totals_filled = false;
        break;
      }
    }
    if (all_totals_filled) {
      console.log("total", total); // XXX
    }
  }

  onPin(d) {
    if (!this.gotta_roll) {
      this.pinned[d] = !this.pinned[d];
      return true;
    }
    else {
      return false;
    }
  }

  roll(all = false) {
    if (this.rolls_available > 0) {
      var pinned_last = 0;
      for (let d in this.dice) {
        if (all || !this.pinned[d]) {
          this.dice[d] = 1 + Math.floor(6 * Math.random());
        }
        else {
          pinned_last++;
        }
      }
      this.gotta_roll = false;
      this.rolls_available--;
      this.pinned_last = pinned_last;
      if (pinned_last < 5) {
        if ((this.rolls_available == 0) && (this.booked != -1)) {
          this.fill_cell(this.booked, 3);
        }
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
}
