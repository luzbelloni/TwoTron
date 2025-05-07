var canvas = document.getElementById("canvas");

canvas.width = 800;
canvas.height = 600;

class BeamWars {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext("2d");

    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}


const Game = new BeamWars(canvas);