import { section_heights } from "./const.js";

export class View {
  constructor(model) {
    this.model = model;
    this.model.onbook = this.onBook.bind(this);
    this.scoreboard = this.createScoreboard();
    this.diceboard = this.createDiceboard();
    this.rollbutton = this.createRollbutton();
  }

  createScoreboard() {
    var scoreboard = document.createElement("Table");
    scoreboard.setAttribute("id", "Scoreboard");

    var cum_section_height = 0;
    for (let section in section_heights) {
      var section_height = section_heights[section];
      for (let row = 0; row < section_height; row++) {
        var index = cum_section_height + row;
        var tr = scoreboard.insertRow();
        for (let col = 0; col < 3; col++) {
          var td = tr.insertCell();
          td.onclick = this.onClick.bind(this, index, col);
        }
        var td = tr.insertCell();
        td.onclick = this.onClick.bind(this, index, 3);
        td.className = "booking_cell";
      }
      var tr = scoreboard.insertRow();
      for (let col = 0; col < 3; col++) {
        var td = tr.insertCell();
        td.className = "section_subtotal";
      }
      var td = tr.insertCell();
      td.className = "booking_subtotal";
      cum_section_height += section_height + 1;
    }
    var tr = scoreboard.insertRow();
    for (let col = 0; col < 3; col++) {
      var td = tr.insertCell();
      td.className = "section_total";
    }
    var td = tr.insertCell();
    td.className = "booking_total";

    // tr = scoreboard.insertRow();
    // td = tr.insertCell();
    // td.className = "total";

    document.body.appendChild(scoreboard);

    return scoreboard;
  }

  createDiceboard() {
    var diceboard = document.createElement("Table");
    var tr = diceboard.insertRow();
    for (var d = 0; d < 5; d++) {
      var td = tr.insertCell();
      td.onclick = this.onPin.bind(this, d);
      td.className = "dice";
    }
    document.body.appendChild(diceboard);

    return diceboard;
  }

  createRollbutton() {
    var rollbutton = document.createElement("Table");
    var tr = rollbutton.insertRow();
    var td = tr.insertCell();
    td.onclick = this.roll.bind(this);
    document.body.appendChild(rollbutton);

    return rollbutton;
  }

  onClick(index, col) {
    if (this.model.onPick(index, col)) {
      this.render();
    }
  }

  onPin(d) {
    if (this.model.onPin(d)) {
      this.render();
    }
  }

  roll() {
    if (this.model.roll()) {
      this.render();
    }
  }

  render() {
    for (let col in this.model.scoreboard) {
      for (let index in this.model.scoreboard[col]) {
        var score = this.model.scoreboard[col][index];
        if (score != -1) {
          var td = this.scoreboard.rows[index].cells[col];
          if (td.childNodes.length == 0) {
            if (score > 0) {
              text = document.createTextNode(score);
            }
            else {
              text = document.createTextNode("--");
            }
            td.appendChild(text);
          }
        }
      }
    }
    for (let d = 0; d < 5; d++) {
      var td = this.diceboard.rows[0].cells[d];
      if (this.model.pinned[d]) {
        td.className = "pinned_dice";
      }
      else {
        td.className = "dice";
        var text = document.createTextNode(this.model.dice[d]);
        if (td.childNodes.length > 0) {
          var oldText = td.childNodes[0];
          td.replaceChild(text, oldText);
        }
        else {
          td.appendChild(text);
        }
      }
    }
  }

  onBook(index, is_booked) {
    var td = this.scoreboard.rows[index].cells[3];
    if (is_booked) {
      td.className = "booked_cell";
    }
    else {
      td.className = "booking_cell";
    }
  }
}
