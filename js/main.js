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
    this.connSuccess = false;
    if (sessionStorage.getItem("score") == null)
      sessionStorage.setItem("score", 0);

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
    pressedKey = undefined;
    gameOver.style.display = "none";
    startButton.style.display = "none";
    canvas.style.visibility = "initial";
    window.requestAnimationFrame(gameLoop);
    this.started = true;
  }

  //create gameloop
  gameLoop(timestamp) {
    if (this.started) {
      this.displayScores();
      this.updateCollisionState();
      this.updatePosition(timestamp);
      this.disapearLine(timestamp);
      this.sendData();
      this.handleKeyInput();
      this.erase();
      this.draw();
    }
  }

  //sending Data to other player
  sendData() {
    this.player.sendData();
  }

  //Load Game Config
  loadConfig(data) {
    this.config = data;
  }

  //drawing game
  draw() {
    this.drawBackground();
    this.drawBorder();
    this.drawPlayer();
    this.drawLines();
  }

  //drawing background
  drawBackground() {
    this.ctx.save();

    this.ctx.fillStyle = "#000500";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.restore();
  }

  //drawing border
  drawBorder() {
    this.ctx.save();
    this.ctx.fillStyle = "#697268";
    this.ctx.fillRect(0, 0, 10, this.canvas.height);
    this.ctx.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
    this.ctx.fillRect(0, 0, this.canvas.width, 10);
    this.ctx.fillRect(this.canvas.width - 10, 0, 10, this.canvas.height);

    this.ctx.restore();
  }

  //drawing player
  drawPlayer() {
    this.player.draw(this.ctx);
  }

  //drawing line
  drawLines() {
    for (let i = 0; i < this.player.line.length; i++) {
      this.player.line[i].draw(this.ctx);
    }

    if (this.player.two.line) {
      for (let i = 0; i < this.player.two.line.length; i++) {
        this.ctx.save();
        this.ctx.fillStyle = this.player.two.line[i].color;
        this.ctx.fillRect(
          this.player.two.line[i].pos.X,
          this.player.two.line[i].pos.Y,
          this.player.two.line[i].D.width,
          this.player.two.line[i].D.height
        );
        this.ctx.restore();

        //console.log(this.player.two.line);
      }
    }
  }

  //make lines appear
  initLine() {
    this.player.initLine();
  }

  displayScores() {
    this.player.updateScoreDisplay(this.role);
  }

  //removing lines
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

  //handle key inputs
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
      this.player.loser = true;
      conn.send("dead");
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

    /*if (this.player.loser == true && this.role == "host") {
      document.getElementById("gameOverWinner").textContent = "Player 2";
    }
    if (this.player.loser == true && this.role == "join") {
      document.getElementById("gameOverWinner").textContent = "Player 1";
    }
    if (this.player.loser == false && this.role == "host") {
      document.getElementById("gameOverWinner").textContent = "Player 1";
    }
    if (this.player.loser == false && this.role == "join") {
      document.getElementById("gameOverWinner").textContent = "Player 2";
    }

    gameOver.style.display = "initial";
    if (this.role == "join") restartButton.style.visibility = "hidden";
    canvas.style.visibility = "hidden";*/
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
    this.two = {};
    this.roundScore = 0;
    this.loser = false;
  }
  draw(ctx) {
    if (this.line.length > 0) {
      ctx.save();

      ctx.fillStyle = this.color;
      ctx.fillRect(this.pos.X, this.pos.Y, this.D.width, this.D.height);

      ctx.restore();
    }
    if (this.two.pos && this.two.color && this.two.line.length > 0) {
      ctx.save();

      ctx.fillStyle = this.two.color;
      ctx.fillRect(this.two.pos.X, this.two.pos.Y, 10, 10);

      ctx.restore();
    }
  }

  updateScoreDisplay(role) {
    if (role == "host") {
      document.getElementById("scoreP1").textContent =
        sessionStorage.getItem("score");
      document.getElementById("scoreP2").textContent = parseInt(
        this.two.roundScore
      );
      //console.log('display updated')
    } else if (role == "join") {
      document.getElementById("scoreP2").textContent =
        sessionStorage.getItem("score");
      document.getElementById("scoreP1").textContent = this.two.roundScore;
      //console.log('display updated')
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

      this.usedFields = [];
    }
  }
  sendData() {
    var sendingData = {
      usedFields: this.usedFields,
      pos: this.pos,
      line: this.line,
      color: this.color,
      score: sessionStorage.getItem("score"),
      roundScore: sessionStorage.getItem("score"),
    };
    conn.send(JSON.stringify(sendingData));
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

      var sendingData = { tempPos: this.tempPos };
      conn.send(JSON.stringify(sendingData));

      for (let i = 0; i < this.usedFields.length; i++) {
        if (
          (this.usedFields[i][0] == this.tempPos.X &&
            this.usedFields[i][1] == this.tempPos.Y) ||
          (this.usedFields[i][0] == this.pos.X &&
            this.usedFields[i][1] == this.pos.Y)
        ) {
          this.loser = true;
          Game.over();
          conn.send("dead");

          return;
        }
      }

      if (this.two.usedFields) {
        for (let i = 0; i < this.two.usedFields.length; i++) {
          if (
            (this.two.usedFields[i][0] == this.tempPos.X &&
              this.two.usedFields[i][1] == this.tempPos.Y) ||
            (this.two.usedFields[i][0] == this.pos.X &&
              this.two.usedFields[i][1] == this.pos.Y)
          ) {
            this.loser = true;
            Game.over();
            conn.send("dead");

            return;
          }
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

      this.roundScore += 10;
      sessionStorage.setItem(
        "score",
        parseInt(sessionStorage.getItem("score")) + 10
      );
    }
  }
  initLine() {
    if (this.dead == false && !this.usedFields.includes(this.tempPos)) {
    }
  }
  die() {
    if (this.dead == false) {
      /*sessionStorage.setItem(
        "score",
        parseInt(sessionStorage.getItem("score"))
      );*/
      //window.setTimeout(()=>{}, 0.5 * 1000);
      if (this.loser == true) {
        var sendingData = { addScore: this.roundScore };
        //console.log(sendingData);
        conn.send(JSON.stringify(sendingData));
        sessionStorage.setItem(
          "score",
          parseInt(sessionStorage.getItem("score")) - parseInt(this.roundScore)
        );
        this.updateScoreDisplay();
        this.roundScore = 0;
      }
      conn.send("dead");
      var sendingData = { score: sessionStorage.getItem("score") };
      conn.send(JSON.stringify(sendingData));
      this.dead = true;
      checkLineDisapeared();
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
var gameOver = document.getElementById("gameOver");
var restartButton = document.getElementById("restartButton");
var roundWinner = document.getElementById("roundWinner");
var instructions = document.getElementById("instructions");

hostButton.addEventListener("click", () => {
  Game.role = "host";
  hostButton.style.display = "none";
  joinButton.style.display = "none";
  peerIdMenu.style.display = "initial";
  peerId.textContent = Game.peerId;
  peer.on("connection", function (con) {
    conn = con;
    conn.send("connSuccess");
    conn.on("error", (err) => {
      console.error(err);
    });
    conn.on("data", function (data) {
      if (data == "dead") {
        Game.over();
      } else if (data == "connSuccess") {
        Game.connSuccess = true;
      } else {
        let recievedData = JSON.parse(data);
        if (recievedData.usedFields) {
          Game.player.two.usedFields = recievedData.usedFields;
          //console.log(Game.player.two.usedFields);
        }
        if (recievedData.line) {
          Game.player.two.line = recievedData.line;
          //console.log(Game.player.two.line);
        }
        if (recievedData.pos) {
          Game.player.two.pos = recievedData.pos;
          //console.log(Game.player.two.pos);
        }
        if (recievedData.color) {
          Game.player.two.color = recievedData.color;
          //console.log(Game.player.two.pos);
        }
        if (recievedData.score) {
          Game.player.two.score = recievedData.score;
          //console.log(Game.player.two.pos);
          Game.displayScores();
        }
        if (recievedData.roundScore) {
          Game.player.two.roundScore = recievedData.roundScore;
          //console.log(Game.player.two.pos);
        }
        if (recievedData.addScore) {
          //console.log(sessionStorage.getItem("score"));
          sessionStorage.setItem(
            "score",
            parseInt(sessionStorage.getItem("score")) +
              parseInt(recievedData.addScore)
          );
          //console.log(recievedData.addScore);
          //console.log(sessionStorage.getItem("score"));
          Game.displayScores();
          //console.log(Game.player.two.pos);
        }
      }
    });

    //console.log("connection!");

    instructions.style.display = "none";
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
  instructions.style.display = "none";
  conn = peer.connect(document.getElementById("idTextField").value);
  peer.on("error", (err) => {
    console.error(err.type);
    if (err.type == "peer-unavailable") {
      document.getElementById("waitingScreen").style.color = "red";
      document.getElementById("waitingScreen").style.fontSize = "medium";
      document.getElementById("waitingScreen").textContent =
        'Error: Id "' +
        document.getElementById("idTextField").value +
        "\" doesn't exist!";
    }
  });
  joinInterface.style.display = "none";
  waitingScreen.style.display = "initial";
  conn.on("data", (data) => {
    if (data == "start") {
      waitingScreen.style.display = "none";
      Game.start();
    }
    if (data == "connSuccess") {
      Game.connSuccess = true;
    } else if (data == "dead") {
      Game.over();
    } else {
      let recievedData = JSON.parse(data);
      if (recievedData.usedFields) {
        Game.player.two.usedFields = recievedData.usedFields;
        //console.log(Game.player.two.usedFields);
      }
      if (recievedData.line) {
        Game.player.two.line = recievedData.line;
        //console.log(Game.player.two.line);
      }
      if (recievedData.pos) {
        Game.player.two.pos = recievedData.pos;
        //console.log(Game.player.two.pos);
      }
      if (recievedData.color) {
        Game.player.two.color = recievedData.color;
        //console.log(Game.player.two.pos);
      }
      if (recievedData.score) {
        Game.player.two.score = recievedData.score;
        //console.log(Game.player.two.pos);
        Game.displayScores();
      }
      if (recievedData.roundScore) {
        Game.player.two.roundScore = recievedData.roundScore;
        //console.log(Game.player.two.pos);
      }
      if (recievedData.addScore) {
        //console.log(sessionStorage.getItem("score"));
        sessionStorage.setItem(
          "score",
          parseInt(sessionStorage.getItem("score")) +
            parseInt(recievedData.addScore)
        );
        //console.log(recievedData.addScore);
        //console.log(sessionStorage.getItem("score"));
        Game.displayScores();
        //console.log(Game.player.two.pos);
      }
    }
  });
});

function checkLineDisapeared() {
  if (Game.player.line.length <= 0 || Game.player.two.line.length <= 0) {
    window.setTimeout(() => {
      if (
        parseInt(sessionStorage.getItem("score")) >= 10000 ||
        parseInt(Game.player.two.score) >= 10000
      ) {
        if (
          parseInt(sessionStorage.getItem("score")) <
            parseInt(Game.player.two.roundScore) &&
          Game.role == "host"
        ) {
          document.getElementById("gameOverWinner").textContent = "Player 2";
        }
        if (
          parseInt(sessionStorage.getItem("score")) <
            parseInt(Game.player.two.roundScore) &&
          Game.role == "join"
        ) {
          document.getElementById("gameOverWinner").textContent = "Player 1";
        }
        if (
          parseInt(sessionStorage.getItem("score")) >
            parseInt(Game.player.two.roundScore) &&
          Game.role == "host"
        ) {
          document.getElementById("gameOverWinner").textContent = "Player 1";
        }
        if (
          parseInt(sessionStorage.getItem("score")) >
            parseInt(Game.player.two.roundScore) &&
          Game.role == "join"
        ) {
          document.getElementById("gameOverWinner").textContent = "Player 2";
        }

        document.getElementById("gameOverText2").textContent =
          "has won the entire round";

        restartButton.addEventListener("click", () => {
          location.reload("true");
        });
        gameOver.style.display = "initial";
        restartButton.style.visibility = "hidden";
        canvas.style.visibility = "hidden";
      } else {
        if (Game.player.loser == true && Game.role == "host") {
          document.getElementById("gameOverWinner").textContent = "Player 2";
        }
        if (Game.player.loser == true && Game.role == "join") {
          document.getElementById("gameOverWinner").textContent = "Player 1";
        }
        if (Game.player.loser == false && Game.role == "host") {
          document.getElementById("gameOverWinner").textContent = "Player 1";
        }
        if (Game.player.loser == false && Game.role == "join") {
          document.getElementById("gameOverWinner").textContent = "Player 2";
        }
        restartButton.addEventListener("click", () => {
          conn.send("start");
          Game.start();
        });
        if (Game.role == "join") restartButton.style.visibility = "hidden";
        gameOver.style.display = "initial";

        canvas.style.visibility = "hidden";
      }
    }, 1000 * 0.2);
    Game.started = false;
  } else {
    window.requestAnimationFrame(checkLineDisapeared);
  }
}

var peer = new Peer();
peer.on("open", (id) => {
  Game.peerId = id;
});
