var canvas = document.getElementById("canvas");

canvas.width = 800;
canvas.height = 600;

//Main Game Class
class BeamWars {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.moveLastTime = null;
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
  gameLoop(timestamp) {
    if (this.started) {
      this.move(timestamp);
      this.initLine();

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
    this.drawLines();
  }
  drawBackground() {
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawPlayer() {
    this.player.draw(this.ctx);
  }
  drawLines() {
    for (let i = 0; i < this.player.line.length; i++) {
      this.player.line[i].draw(this.ctx);
    }
  }
  initLine() {
    this.player.initLine();
  }

  erase() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  move(timestamp) {
    if (this.moveLastTime == null) {
      this.moveLastTime = timestamp;
    }
    if (timestamp - this.moveLastTime >= this.config.game.speed) {
      this.player.move();
      //console.log(this.player.tempPos);
      this.moveLastTime = timestamp;
    }
  }
}

//Player Class
class Beam {
  constructor(x, y, width, height, color) {
    this.pos = { X: x, Y: y };
    this.tempPos = { X: x, Y: y };
    this.D = { width: width, height: height };
    this.speed = 10;
    this.direction = "right";
    this.color = color;
    this.line = [];
  }
  draw(ctx) {
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.X, this.pos.Y, this.D.width, this.D.height);

    ctx.restore();
  }
  initLine() {
    this.line.push(
      new LineSegment(
        this.tempPos.X,
        this.tempPos.Y,
        this.D.width,
        this.D.height,
        this.color
      )
    );
  }
  move() {
    if (this.direction == "right") {
      this.tempPos.X += this.speed;
    }
    if (this.direction == "left") {
      this.tempPos.X -= this.speed;
    }
    if (this.direction == "down") {
      this.tempPos.Y += this.speed;
    }
    if (this.direction == "up") {
      this.tempPos.Y -= this.speed;
    }
  }
}

class LineSegment {
  constructor(x, y, width, height, color) {
    this.pos = { X: x, Y: y };
    this.D = { width: width, height: height };
    this.color = color;
  }
  draw(ctx) {
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
