var canvas = document.getElementById("canvas");

canvas.width = 800;
canvas.height = 600;

//Main Game Class
class BeamWars {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext("2d");

    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  //Load Game Config
  loadConfig(data) {
    console.log(data);
  }
}

//Player Class
class Beam {
  constructor(x, y, width, height) {
    this.pos = { X: x, Y: y };
    this.D = { width: width, height: height };
  }
}

const Game = new BeamWars(canvas);

//get data from Json file

var loadJSON = new XMLHttpRequest();
loadJSON.open("GET", "./json/config.json");
loadJSON.onload = function () {
  Game.loadConfig(JSON.parse(loadJSON.responseText));
};
loadJSON.send();
