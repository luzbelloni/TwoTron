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
  }

  //create gameloop
  gameLoop() {
    this.erase();
    this.draw();
  }

  //Load Game Config
  loadConfig(data) {
    return;
  }
  draw() {
    this.drawBackground();
  }
  drawBackground() {
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  erase() {
    this.ctx.clearRect(0, 0, this.width, this.height);
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

// run gameloop
function gameLoop(timestamp) {
  Game.gameLoop(timestamp);
  window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop);

//get data from Json file

var loadJSON = new XMLHttpRequest();
loadJSON.open("GET", "./json/config.json");
loadJSON.onload = function () {
  Game.loadConfig(JSON.parse(loadJSON.responseText));
};
loadJSON.send();
