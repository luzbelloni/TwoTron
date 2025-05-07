navigator.vibrate(200);

var canvas = document.getElementById("canvas");

canvas.width = 1000;
canvas.height = 800;

var pressedKey;
document.addEventListener("keydown", (e) => {
  pressedKey = e.key;
  //console.log(pressedKey);
});

//Main Game Class
class BeamWars {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.moveLastTime = null;
    this.disapearLastTime = null;
    this.started = false;
    this.player;
    this.pressedKey;
    this.role;

    this.ctx = this.canvas.getContext("2d");
  }
  //start game
  start() {
    if (this.role == "host") {
      this.player = new Beam(
        this.config.players.one.pos.x,
        this.config.players.one.pos.y - this.config.players.one.D.height,
        this.config.players.one.D.width,
        this.config.players.one.D.height,
        this.config.players.one.color,
        this.config.players.one.direction
      );
    } else if (this.role == "join") {
      this.player = new Beam(
        this.config.players.two.pos.x,
        this.config.players.two.pos.y - this.config.players.one.D.height,
        this.config.players.two.D.width,
        this.config.players.two.D.height,
        this.config.players.two.color,
        this.config.players.two.direction
      );
    }

    startButton.style.display = "none";
    this.started = true;
  }

  //create gameloop
  gameLoop(timestamp) {
    if (this.started) {
      this.updateCollisionState();
      this.updatePosition(timestamp);
      this.disapearLine(timestamp);
      this.handleKeyInput();
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
    this.drawBorder();
    this.drawPlayer();
    this.drawLines();
  }
  drawBackground() {
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawBorder() {
    this.ctx.save();
    this.ctx.fillStyle = "#4e4e4e";
    this.ctx.fillRect(0, 0, 10, this.canvas.height);
    this.ctx.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
    this.ctx.fillRect(0, 0, this.canvas.width, 10);
    this.ctx.fillRect(this.canvas.width - 10, 0, 10, this.canvas.height);

    this.ctx.restore();
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
  disapearLine(timestamp) {
    //if (this.disapearLastTime == null) {
    //this.disapearLastTime = timestamp;
    //}
    //if (timestamp - this.disapearLastTime >= this.config.game.disapearSpeed) {
    this.player.disapearLine();
    //console.log(this.player.tempPos);
    //this.disapearLastTime = timestamp;
    //}
  }
  handleKeyInput() {
    if (pressedKey) {
      if (pressedKey == "w" || pressedKey == "ArrowUp") {
        this.player.direction = "up";
      }
      if (pressedKey == "a" || pressedKey == "ArrowLeft") {
        this.player.direction = "left";
      }
      if (pressedKey == "s" || pressedKey == "ArrowDown") {
        this.player.direction = "down";
      }
      if (pressedKey == "d" || pressedKey == "ArrowRight") {
        this.player.direction = "right";
      }
    }
  }
  updateCollisionState() {
    if (
      this.player.tempPos.X <= 0 ||
      this.player.tempPos.X >= this.width - 10 ||
      this.player.tempPos.Y <= 0 ||
      this.player.tempPos.Y >= this.height - 10
    ) {
      this.over();
    }
  }

  erase() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  updatePosition(timestamp) {
    if (this.moveLastTime == null) {
      this.moveLastTime = timestamp;
    } else if (timestamp - this.moveLastTime >= this.config.game.movingSpeed) {
      this.player.move();

      //console.log(this.player.tempPos);
      this.moveLastTime = timestamp;
    }
  }
  over() {
    this.player.die();
  }
}

//Player Class
class Beam {
  constructor(x, y, width, height, color, direction) {
    this.pos = { X: x, Y: y };
    this.tempPos = { X: x, Y: y };
    this.usedFields = [];
    this.D = { width: width, height: height };
    this.stepSpeed = 10;
    this.dead = false;
    this.direction = direction;
    this.color = color;
    this.line = [];
    this.movingProcessActive = false;
  }
  draw(ctx) {
    if (this.line.length > 0) {
      ctx.save();

      ctx.fillStyle = this.color;
      ctx.fillRect(this.pos.X, this.pos.Y, this.D.width, this.D.height);

      ctx.restore();
    }
  }

  disapearLine() {
    if (this.dead == true) {
      this.line.pop();
      this.line.pop();
      this.line.pop();
      this.line.pop();
      this.line.pop();
      this.line.pop();
    }
  }
  move() {
    if (this.dead == false) {
      if (this.direction == "right") {
        this.tempPos.X += this.stepSpeed;
      }
      if (this.direction == "left") {
        this.tempPos.X -= this.stepSpeed;
      }
      if (this.direction == "down") {
        this.tempPos.Y += this.stepSpeed;
      }
      if (this.direction == "up") {
        this.tempPos.Y -= this.stepSpeed;
      }
      for (let i = 0; i < this.usedFields.length; i++) {
        if (
          (this.usedFields[i][0] == this.tempPos.X &&
            this.usedFields[i][1] == this.tempPos.Y) ||
          (this.usedFields[i][0] == this.pos.X &&
            this.usedFields[i][1] == this.pos.Y)
        ) {
          Game.over();
          return;
        }
      }

      this.usedFields.push([this.tempPos.X, this.tempPos.Y]);
      this.line.push(
        new LineSegment(
          this.tempPos.X,
          this.tempPos.Y,
          this.D.width,
          this.D.height,
          this.color
        )
      );
      //console.log(this.tempPos);
    }
  }
  initLine() {
    if (this.dead == false && !this.usedFields.includes(this.tempPos)) {
    }
  }
  die() {
    if (this.dead == false) {
      //window.setTimeout(()=>{}, 0.5 * 1000);
      this.dead = true;
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

class HitBox {
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

var startButton = document.getElementById("start");
var hostButton = document.getElementById("host");
var joinButton = document.getElementById("join");
var joinInterface = document.getElementById("joinInterface");
var buttonJoin = document.getElementById("joinButton");
var peerIdMenu = document.getElementById("peerIdMenu");
var peerId = document.getElementById("peerId");
var waitingScreen = document.getElementById("waitingScreen");

hostButton.addEventListener("click", () => {
  Game.role = "host";
  hostButton.style.display = "none";
  joinButton.style.display = "none";
  peerIdMenu.style.display = "initial";
  peerId.textContent = Game.peerId;
  peer.on("connection", function (con) {
    conn = con;

    conn.on("data", function (data) {
      return;
    });

    console.log("connection!");

    peerIdMenu.style.display = "none";
    startButton.style.display = "initial";
  });
});
joinButton.addEventListener("click", () => {
  Game.role = "join";
  hostButton.style.display = "none";
  joinButton.style.display = "none";

  document.getElementById("idTextField").value = "";
  joinInterface.style.display = "initial";
});

startButton.addEventListener("click", () => {
  conn.send("start");
  Game.start();
});

buttonJoin.addEventListener("click", () => {
  var conn = peer.connect(document.getElementById("idTextField").value);
  joinInterface.style.display = "none";
  waitingScreen.style.display = "initial";
  conn.on("data", (data) => {
    if (data == "start") {
      Game.start();
    }
  });
});

var peer = new Peer();
peer.on("open", (id) => {
  Game.peerId = id;
});
