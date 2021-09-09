import { useContext, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
// import "./../css_files/GameScreen.css";
import FactorScreen from "./FactorScreen";
import { socket } from "../../pages/_app";
import axios from "axios";
import battlePic from "./../css_files/img/battle.png";
import Image from "next/image";
import getConfig from "next/config";
import { setRef } from "@material-ui/core";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();

let username_val;
let ingame;
let gamesnum;
let gameId;
let user_xp;
let user_pay = 0;

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
    this._hit_power = 1.1;
  }
}

const bgs = {
  sb: "#000000",
  sw: "#12A0EF",
  w: "",
};

class Pong {
  constructor(elm, type, rounds, arena, gameId, u, socket) {
    this._gamesnum = 0;
    this._ingame = false;
    this._type = type;
    this._user = u;
    this._arena = arena;
    this._bg = bgs[arena];
    this._gameId = gameId;
    this._rounds = rounds;
    gameId = gameId;
    ingame = false;
    gamesnum = 0;
    this._canvas = elm;
    this._context = this._canvas.getContext("2d");
    this._ball = new Ball();
    this._players = [new Player(), new Player()];
    this.reset();
    this.socketOn();
    let lasttime, lasttimev1;
    this.socket = socket;
    let callback = (millis) => {
      if (lasttime) {
        this.update((millis - lasttime) / 3000);
      }
      lasttime = millis;
      requestAnimationFrame(callback);
    };
    callback();
  }

  collide_p1(player, ball) {
    if (
      this._ball.pos.y >= player.pos.y &&
      this._ball.pos.y <= player.pos.y + player.size.y &&
      this._ball.left <= player.right
    ) {
      this._ball.vel.x = -ball.vel.x;
      if (this._ball.vel.x >= -1800 && this._ball.vel.x <= 1800 )
        this._ball.vel.x *= player._hit_power;
      if (this._ball.vel.y >= -1800 && this._ball.vel.y <= 1800 )
        this._ball.vel.y *= player._hit_power;
    }
  }
  collide_p2(player, ball) {
    if (
      this._ball.pos.y >= player.pos.y &&
      this._ball.pos.y <= player.pos.y + player.size.y &&
      this._ball.right >= player.left
    ) {
      this._ball.vel.x = -ball.vel.x;
      if (this._ball.vel.x >= -1800 && this._ball.vel.x <= 1800 )
        this._ball.vel.x *= player._hit_power;
      if (this._ball.vel.y >= -1800 && this._ball.vel.y <= 1800 )
        this._ball.vel.y *= player._hit_power;
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
    if (this._arena != "w") {
      this._context.fillStyle = this._bg;
      this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      this._context.fillStyle = "#000000";
      this._context.fillRect(
        0,
        0,
        this._canvas.width / 10,
        this._canvas.height
      );

      this._context.fillStyle = "white";
      this._context.fillRect(
        this._canvas.width / 10,
        0,
        this._canvas.width - this._canvas.width / 10,
        this._canvas.height
      );

      this._context.fillStyle = "#000000";
      this._context.fillRect(
        this._canvas.width - this._canvas.width / 10,
        0,
        this._canvas.width,
        this._canvas.height
      );
    }
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
    this._context.stroke();
  }
  socketOn() {
    if (socket)
      this.socket?.emit("GetCurrentGame", {
        data: {
          gameId: this._gameId,
        },
      });
  }
  reset() {
    const BallVelX = this._ball.vel.x;
    const BallVelY = this._ball.vel.y;
    this._players[0].pos.x = 1;
    this._players[1].pos.x = this._canvas.width - 6;
    this._players.forEach((player) => {
      player.pos.y = this._canvas.height / 2 - player.size.y / 2;
      player._hit_power = 1.1;
    });

    this._ball.pos.x = this._canvas.width / 2 - this._ball.size.x / 2;
    this._ball.pos.y = this._canvas.height / 2 - this._ball.size.y / 2;
    this._ball.vel.x = 0;
    this._ball.vel.y = 0;
    this._ingame = false;
    ingame = false;
    if (BallVelX || BallVelY)
      socket.emit("PlayerScored", {
        data: {
          p1X: this._players[0].pos.x,
          p1Y: this._players[0].pos.y,
          p2X: this._players[1].pos.x,
          p2Y: this._players[1].pos.y,
          p1S: this._players[0]._score,
          p2S: this._players[1]._score,
          BallPosX: this._ball.pos.x,
          BallPosY: this._ball.pos.y,
          BallVelX: this._ball.vel.x,
          BallVelY: this._ball.vel.y,
          gameId: this._gameId,
        },
      });
    socket.on("update_powers", (data) => {
      if (data.data.gameId === this._gameId) {
        if (this._players[0].size.y < 200)
          this._players[0].size.y = 25 * data.data.player1.size + 100;
        if (this._players[1].size.y < 200)
          this._players[1].size.y = 25 * data.data.player2.size + 100;
      }
    });
  }
  start() {
    if (this._ball.vel.x === 0 && this._ball.vel.y === 0) {
      this._ball.vel.x = 300 * (Math.random() > 0.5 ? 1 : -1);
      this._ball.vel.y = 300 * (Math.random() > 0.5 ? 1 : -1);
    }
  }

  update(dt) {
    const b = this._ball.pos;
    this._ball.pos.x += this._ball.vel.x * dt;
    this._ball.pos.y += this._ball.vel.y * dt;

    if (this._ball.pos.x < 0 || this._ball.pos.x > this._canvas.width) {
      const userId = this._ball.pos.x < 0 ? 1 : 0;
      this._players[userId]._score++;
      this.reset();
    }
    if (this._ball.top <= 0 || this._ball.bottom >= this._canvas.height - 10) {
      this._ball.vel.y = -this._ball.vel.y;
    }
    this.collide_p1(this._players[0], this._ball);
    this.collide_p2(this._players[1], this._ball);
    this.v_time += dt;
    this.draw();
  }
}

export default function GameScreen(params) {
  const { user } = useContext(userContext);
  const [el, setEl] = useState(false);
  const [end, setEnd] = useState(false);
  const [userssize, setUsersSize] = useState([100, 100]);
  const [ready, setReady] = useState(false);
  const [turn, setTurn] = useState({
    ingame: false,
    gamesnum: 0,
    u: -1,
  });
  let pong;
  let u = -1;
  user_xp = 0;
  socket.emit("in game", {
    data: { username: user.user, gameId: params.gameId },
  });
  if (process.browser) {
    window.onbeforeunload = () => {
      socket.emit("leave game", {
        data: { username: user.user, gameId: params.gameId },
      });
    };
  }

  useEffect(() => {
    if (user_xp === 0) user_xp = user.xp;
    username_val = user.user;
    const elm = document.getElementById("pong");
    if (user.user === params.data?.player1) u = 0;
    else if (user.user === params.data?.player2) u = 1;
    if (user.user)
      if (elm) {
        setTimeout(() => {
          pong = new Pong(
            elm,
            params.data.type,
            params.data.round,
            params.data.arena,
            params.gameId,
            u
          );

          setTurn({
            ingame: false,
            gamesnum: 0,
            u,
          });

          setReady(true);
          if (u >= 0) {
            elm.addEventListener("mousemove", (event) => {
              const scale =
                event.offsetY / event.target.getBoundingClientRect().height;
              pong._players[u].pos.y =
                elm.height * scale - pong._players[u].size.y / 2;
              socket.emit("PlayerPos", {
                data: {
                  p1Y: pong._players[0].pos.y,
                  p2Y: pong._players[1].pos.y,
                  gameId: params.gameId,
                },
              });
              if (
                pong._players[0]._score + pong._players[1]._score >=
                pong._rounds
              ) {
                setEnd(true);
                params.endgame(true);
              }
            });

            elm.addEventListener("click", (event) => {
              if (pong._gamesnum % 2 === u && !pong._ingame) {
                pong.start();
                pong._ingame = true;
                pong._gamesnum++;
                ingame = true;
                gamesnum = pong._gamesnum;
                socket.emit("StartGame", {
                  data: {
                    BallPosX: pong._ball.pos.x,
                    BallPosY: pong._ball.pos.y,
                    BallVelX: pong._ball.vel.x,
                    BallVelY: pong._ball.vel.y,
                    gameId: params.gameId,
                  },
                });
                setTurn({
                  ingame: true,
                  gamesnum: pong._gamesnum,
                  u,
                });
              }
            });
          }
          socket.off("WantCurrentGame");
          socket.on("WantCurrentGame", (data) => {
            socket.emit("CurrentGameState", {
              data: {
                /* Game Info */
                gameId: params.gameId,

                /* Ball Info */
                BallPosX: pong._ball.pos.x,
                BallPosY: pong._ball.pos.y,
                BallVelX: pong._ball.vel.x,
                BallVelY: pong._ball.vel.y,

                /* Players Info */
                p1X: pong._players[0].pos.x,
                p1Y: pong._players[0].pos.y,
                p2X: pong._players[1].pos.x,
                p2Y: pong._players[1].pos.y,
                p1S: pong._players[0]._score,
                p2S: pong._players[1]._score,
                p1Size: pong._players[0].size.y,
                p1Hit: pong._players[0]._hit_power,
                p2Size: pong._players[1].size.y,
                p2Hit: pong._players[1]._hit_power,

                /* Game State */
                ingame: pong._ingame,
                gamesnum: pong._players[0]._score + pong._players[1]._score,
              },
            });
          });
          /* Listen */
          socket.off("PlayersPos");
          socket.on("PlayersPos", (data) => {
            pong._players[0].pos.y = data.data.p1Y;
            pong._players[1].pos.y = data.data.p2Y;
          });
          socket.off("StartsGame");
          socket.on("StartsGame", (data) => {
            pong._ball.pos.x = data.data.BallPosX;
            pong._ball.pos.y = data.data.BallPosY;
            pong._ball.vel.x = data.data.BallVelX;
            pong._ball.vel.y = data.data.BallVelY;
            pong._ingame = true;
            setTurn({
              gamesnum: pong.gamesnum,
              ingame: true,
              u,
            });
          });
          socket.off("PlayersScored");
          socket.on("PlayersScored", (data) => {
            /* Reseting The Ball */
            pong._ball.pos.x = data.data.BallPosX;
            pong._ball.pos.y = data.data.BallPosY;
            pong._ball.vel.x = data.data.BallVelX;
            pong._ball.vel.y = data.data.BallVelY;

            /* Reseting The Players */
            pong._players[0].pos.x = data.data.p1X;
            pong._players[0].pos.y = data.data.p1Y;

            pong._players[1].pos.x = data.data.p2X;
            pong._players[1].pos.y = data.data.p2Y;

            /* Updating The Score */
            pong._players[0]._score = data.data.p1S;
            pong._players[1]._score = data.data.p2S;

            /* Game Number And Game State */
            pong._gamesnum = data.data.p1S + data.data.p2S;
            pong._ingame = false;
            setTurn({
              gamesnum: pong._gamesnum,
              ingame: false,
              u,
            });
          });
          socket.off("FullCurrentGame");
          socket.on("FullCurrentGame", (data) => {
            /* Reseting The Ball */
            pong._ball.pos.x = data.data.BallPosX;
            pong._ball.pos.y = data.data.BallPosY;
            pong._ball.vel.x = data.data.BallVelX;
            pong._ball.vel.y = data.data.BallVelY;

            /* Reseting The Players */
            pong._players[0].pos.x = data.data.p1X;
            pong._players[0].pos.y = data.data.p1Y;

            pong._players[1].pos.x = data.data.p2X;
            pong._players[1].pos.y = data.data.p2Y;

            pong._players[0].size.y = data.data.p1Size;
            pong._players[0]._hit_power = data.data.p1Hit;

            pong._players[1].size.y = data.data.p2Size;
            pong._players[1]._hit_power = data.data.p2Hit;

            /* Updating The Score */
            pong._players[0]._score = data.data.p1S;
            pong._players[1]._score = data.data.p2S;

            /* Game Number And Game State */
            pong._gamesnum = data.data.p1S + data.data.p2S;
            pong._ingame = data.data.ingame;

            setTurn({
              gamesnum: pong._gamesnum,
              ingame: pong._ingame,
              u: pong._user,
            });
          });
          socket.emit("GetCurrentGame", {
            data: {
              gameId: params.gameId,
            },
          });
        }, [1000]);
      }
  }, [user.user]);

  async function ClickMe(e) {
    let base_xp = 10;
    let other = 0;

    if (turn.u === 0) other = 1;
    if (user_xp === 0) user_xp = user.xp;

    if (params.type === "Title") base_xp += 10;
    if (e.target.id === "s+" || e.target.id === "p+" || e.target.id === "s-") {
      if (e.target.id === "s+") user_pay = 2;
      else if (e.target.id === "p+") user_pay = 1;
      else if (e.target.id === "s-") user_pay = 5;
      if (user_pay === 2 && userssize[turn.u] >= 200) return;
      if (user_pay === 5 && userssize[other] <= 25) return;
      try {
        const val = await axios.post(
          publicRuntimeConfig.BACKEND_URL + "/game/powerups",
          {
            data: {
              username: user.user,
              xp: user_pay,
              base_xp,
            },
          }
        );
        if (!val || val.data.id <= 0) return;
        if (user_pay === 2) {
          if (turn.u === 0)
            setUsersSize([userssize[turn.u] + 25, userssize[other]]);
          else setUsersSize([userssize[other], userssize[turn.u] + 25]);
        }
        if (user_pay === 5) {
          if (turn.u === 0)
            setUsersSize([userssize[turn.u], userssize[other] - 25]);
          else setUsersSize([userssize[other] - 25, userssize[turn.u]]);
        }
        socket.emit("change_game_power_ups", {
          data: { gameId: params.gameId, user: user.user, val: e.target.id },
        });
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  return user.user ? (
    <div className="container text-center text-black">
      <Head>
        <title>
          {params.data.player1} VS {params.data.player2}
        </title>
      </Head>
      <Col style={{ marginLeft: "-1.7rem" }}>
        <h3 className="m-2">
          <div className="mr-3" style={{ display: "inline-block" }}>
            {params.data?.player1}
          </div>
          <Image src={battlePic} width="25" height="25"></Image>
          <div className="ml-3" style={{ display: "inline-block" }}>
            {params.data?.player2}
          </div>
        </h3>
      </Col>
      <Col className="py-3">
        <canvas
          id="pong"
          className="pongcanvas"
          width="600rem"
          height="400rem"
        ></canvas>
      </Col>
      {!turn.ingame && turn.u >= 0 ? (
        turn.gamesnum % 2 === turn.u ? (
          <div className="text-black">
            {" "}
            {user.user} Turn To Start The Game, click inside the game
          </div>
        ) : (
          <div>
            <div>
              {user.user != params.data.player1
                ? params.data.player1
                : params.data.player2}{" "}
              Turn To Start The Game, click inside the game
            </div>
          </div>
        )
      ) : null}
      {(user.user === params.data.player1 ||
        user.user === params.data.player2) &&
      !turn.ingame ? (
        <div>
          <Col className="my-2">Power Ups</Col>
          <Col className="text-center">
            <div
              className="btn btn-primary m-2 pongcanvas"
              id="s+"
              onClick={ClickMe}
            >
              Increase My Size (-2XP)
            </div>
            <div
              className="btn btn-primary m-2 pongcanvas"
              id="p+"
              onClick={ClickMe}
            >
              Increase My Hit Power (-1XP)
            </div>
            <div
              className="btn btn-primary m-2 pongcanvas"
              id="s-"
              onClick={ClickMe}
            >
              Decrease My Opponent Size (-5XP)
            </div>
          </Col>
        </div>
      ) : null}
    </div>
  ) : null;
}
