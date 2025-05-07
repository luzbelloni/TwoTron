var canvas = document.getElementById("canvas");

canvas.width = 800;
canvas.height = 600;

//Main Game Class
class BeamWars {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.started = false;
    this.player;

    this.ctx = this.canvas.getContext("2d");
  }
  //start game
  start() {
    this.player = new Beam(
      this.config.players.one.pos.x,
      this.config.players.one.pos.y - this.config.players.one.D.height,
      this.config.players.one.D.width,
      this.config.players.one.D.height,
      this.config.players.one.color
    );
    this.started = true;
  }

  //create gameloop
  gameLoop() {
    if(this.started){
    this.erase();
    this.draw();
  }
  }

  //Load Game Config
  loadConfig(data) {
    this.config = data;
  }
  draw() {
    this.drawBackground();
    this.drawPlayer();
  }
  drawBackground() {
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawPlayer() {
    this.player.draw(this.ctx);
  }

  erase() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

//Player Class
class Beam {
  constructor(x, y, width, height, color) {
    this.pos = { X: x, Y: y };
    this.D = { width: width, height: height };
    this.color = color;
    this.line = [];
  }
  draw(ctx) {
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.X, this.pos.Y, this.D.width, this.D.height);

    ctx.restore();
  }
}

class LineSegment {
  constructor(x, y, width, height, color){
    this.pos = {X: x, Y: y};
    this.D = { width: width, height: height}
    this.color = color;
  }
  draw(){
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.X, this.pos.Y, this.D.width, this.D.height);

    ctx.restore();
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
  Game.start();
};
loadJSON.send();
