import { Model } from "./model.js";
import { View } from "./view.js";

var model = new Model();
var view = new View(model);
view.render();
