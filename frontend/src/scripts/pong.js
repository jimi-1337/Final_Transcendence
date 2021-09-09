class Vec {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    get len() {
      return Math.sqrt(this.x * this.x + this.y + this.y);
    }
  
    set len(value) {
      const fact = value / this.len;
    }
  }
  
  class Rect {
    constructor(w, h) {
      this.pos = new Vec();
      this.size = new Vec(w, h);
    }
    get left() {
      return this.pos.x - this.size.x / 2;
    }
    get right() {
      return this.pos.x + this.size.x / 2;
    }
    get top() {
      return this.pos.y + this.size.y / 2;
    }
    get bottom() {
      return this.pos.y - this.size.y / 2;
    }
  }
  
  class Ball extends Rect {
    constructor() {
      super(10, 10);
      this.vel = new Vec();
    }
  }
  
  class Player extends Rect {
    constructor() {
      super(5, 100);
      this._score = 0;
    }
  }
  
  class Pong {
    constructor(elm) {
      this._canvas = elm;
      this._context = this._canvas.getContext("2d");
      this._ball = new Ball();
      this._players = [new Player(), new Player()];
      this.reset();
      let lasttime;
      let callback = (millis) => {
        if (lasttime) {
          this.update((millis - lasttime) / 1000);
        }
        lasttime = millis;
        requestAnimationFrame(callback);
      };
      callback();
    }
    collide_p1(player, ball) {
      if (ball.left <= player.right) {
        if (
          ball.pos.y >= player.pos.y &&
          ball.pos.y <= player.pos.y + player.size.y
        ) {
          ball.vel.x = -ball.vel.x;
          ball.vel.x *= 1.1;
          ball.vel.y *= 1.1;
        }
      }
    }
    collide_p2(player, ball) {
      if (
        ball.right >= player.left &&
        ball.pos.y >= player.pos.y &&
        ball.pos.y <= player.pos.y + player.size.y
      ) {
        ball.vel.x = -ball.vel.x;
      }
    }
    drawScore() {
      this._context.font = "20px Arial";
      this._context.fillStyle = "#0095DD";
      this._context.fillText(
        this._players[0]._score,
        this._canvas.width / 4 - this._canvas.width / 8,
        40
      );
  
      this._context.font = "20px Arial";
      this._context.fillStyle = "#0095DD";
      this._context.fillText(
        this._players[1]._score,
        (3 * this._canvas.width) / 4 + this._canvas.width / 8,
        40
      );
    }
    draw() {
      this._context.fillStyle = "#12A0EF";
      this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
      this.drawLine();
      this.drawRect(this._ball);
      this._players.forEach((player) => this.drawRect(player));
      this.drawScore();
    }
    drawRect(rect) {
      this._context.fillStyle = "#fff";
      this._context.fillRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
    }
    drawLine() {
      this._context.beginPath();
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2, this._canvas.height);
      this._context.lineWidth = 2;
      // this._context.strokestyle = 'rgb(255, 165, 0)';
      this._context.stroke();
    }
    reset() {
      this._players[0].pos.x = 20;
      this._players[1].pos.x = this._canvas.width - 20;
      this._players.forEach((player) => {
        player.pos.y = this._canvas.height / 2 - player.size.y / 2;
      });
  
      this._ball.pos.x = this._canvas.width / 2 - this._ball.size.x / 2;
      this._ball.pos.y = this._canvas.height / 2 - this._ball.size.y / 2;
      this._ball.vel.x = 0;
      this._ball.vel.y = 0;
    }
    start() {
      if (this._ball.vel.x === 0 && this._ball.vel.y === 0) {
        this._ball.vel.x = 300 * (Math.random() > 0.5 ? 1 : -1);
        this._ball.vel.y = 300 * (Math.random() > 0.5 ? 1 : -1);
      }
    }
    update(dt) {
      this._ball.pos.x += this._ball.vel.x * dt;
      this._ball.pos.y += this._ball.vel.y * dt;
  
      if (this._ball.left <= 0 || this._ball.right > this._canvas.width) {
        const userId = this._ball.left <= 0 ? 1 : 0;
        this._players[userId]._score++;
        this.reset();
      }
      if (this._ball.top <= 0 || this._ball.bottom >= this._canvas.height) {
        this._ball.vel.y = -this._ball.vel.y;
      }
      this.collide_p1(this._players[0], this._ball);
      this.collide_p2(this._players[1], this._ball);
      this._players[1].pos.y = -this._players[1].size.y / 2 + this._ball.pos.y;
      this.draw();
    }
  }
  
  const elm = document.getElementById("pong");
  const pong = new Pong(elm);
  
  elm.addEventListener("mousemove", (event) => {
    pong._players[0].pos.y = event.offsetY - pong._players[0].size.y / 2;
  });
  
  elm.addEventListener("click", (event) => {
    pong.start();
  });