import { Card, Input, InputLabel, setRef } from "@material-ui/core";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Col } from "react-bootstrap";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
// import "./../css_files/MatchScreen.css";
import FactorScreen from "./FactorScreen";
import getConfig from "next/config";
import Router from "next/router";
import LoadingMatch from "../elements/LoadingMatch";
const { publicRuntimeConfig } = getConfig();
import { socket } from "./../../pages/_app";
import { useRouter } from "next/router";
import LoginBar from "../elements/LoginBar";
import Head from "next/head";

export default function MatchScreen() {
  const [title, setTitle] = useState(false);
  const [rounds, setRounds] = useState(true);
  const { user } = useContext(userContext);
  const [err, setEr] = useState({ type: "", message: "" });
  const [msg, setMsg] = useState({
    error: false,
    message: "",
  });
  const [loadingmatch, setLoading] = useState({
    id: false,
    username: "",
  });
  const [input_name, setInputName] = useState(null);

  const username_var = useRef();
  const arena_var = useRef();
  const gametype_var = useRef();
  const rounds_var = useRef();
  const title_var = useRef();
  const router = useRouter();

  const username_f = router.asPath.split("#")[1];
  useEffect(() => {
    setInputName(username_f);
  }, []);
  function HandleChange(e) {
    if (e.target.value === "Title") {
      setTitle(true);
      setRounds(true);
    } else if (e.target.value === "Rounds") {
      setRounds(true);
      setTitle(false);
    } else if (e.target.value === "Shot") {
      setTitle(false);
      setRounds(false);
    } else if (e.target.value === "Casual") {
      setTitle(false);
      setRounds(true);
    }
  }

  async function CreateMatch() {
    setMsg({
      error: false,
      message: "",
    });
    let p1, p2;
    p1 = user.user;
    p2 = username_var.current.value;
    if (
      !username_var ||
      !username_var.current.value ||
      (username_var.current.value.length < 5 &&
        username_var.current.value != "Rand")
    )
      return setMsg({
        error: true,
        message: "Enter A Valid Player Username",
      });
    if (
      !gametype_var ||
      (gametype_var.current.value === "Title" &&
        (!title_var.current.value || title_var.current.value.length < 5))
    )
      return setMsg({
        error: true,
        message:
          "Enter A Valid Title, The Title Can't Be Less Than 5 Characters",
      });
    try {
      let rw = 10;
      let rd = 1;
      let ti = "";
      if (rounds_var.current) rd = rounds_var.current.value;
      if (gametype_var.current.value === "Shot") rw = 20;
      if (gametype_var.current.value === "Casual") rw = 0;
      if (title_var.current) ti = title_var.current.value;
      let val;
      if (username_var.current.value != "Rand")
        val = await axios.post(
          publicRuntimeConfig.BACKEND_URL + "/create_match",
          {
            data: {
              player1: user.user,
              player2: username_var.current.value,
              type: gametype_var.current.value,
              arena: arena_var.current.value,
              reward: rw,
              rounds: rd,
              title: ti,
            },
          }
        );
      else {
        val = await axios.post(
          publicRuntimeConfig.BACKEND_URL + "/match/random",
          {
            data: {
              player1: user.user,
              player2: username_var.current.value,
              type: gametype_var.current.value,
              arena: arena_var.current.value,
              reward: rw,
              rounds: rd,
              title: ti,
            },
          }
        );
      }
      if (!val || val.data.id <= 0) {
        if (val.data.message && val.data.message === "user")
          return setMsg({
            error: true,
            message: "Enter A Valid Player Username",
          });
          if (val.data.message && val.data.message === "same")
          return setMsg({
            error: true,
            message: "Hmmm so you want to play with yourself, I believe you got the wrong website",
          });
          if (val.data.message && val.data.message === "match")
          return setMsg({
            error: true,
            message: "You Already Have A Pending Match, Chill...",
          });
          if (val.data.message && val.data.message === "xp")
          return setMsg({
            error: true,
            message: "On Of The Players Doen't Have Enough XP..",
          });
        return setMsg({
          error: true,
          message: "An Error Happen Try Again Later",
        });
      }
      setLoading({
        id: true,
        username: username_var.current.value,
      });
      if (val.data.on) return Router.push(`/game_redirect/${val.data.gameId}`);
      socket.emit("challenge", {
        data: {
          gameId: val.data.gameId,
          player1: p1,
          player2: p2,
          rounds: rd,
        },
      });
      socket.on("accept_game", (data) => {
        Router.push(`/game_redirect/${data.data.gameId}`);
      });
      socket.on("declined_game", (data) => {
        if (val.data.gameId === data.data.gameId) {
          setEr({
            type: "alert-danger",
            message: `${data.data.player2} Declined The Game`,
          });
          setLoading({
            id: false,
            username: "",
          });
        }
      });
    } catch (error) {
      console.log(error.message);
      setMsg({
        error: true,
        message: "An Error Happen Try Again Later",
      });
    }
  }

  return loadingmatch.id ? (
    <LoadingMatch user={loadingmatch.username}>
      <Head>
        <title>
          Loading Match
        </title>
      </Head>
    </LoadingMatch>
  ) : (
    <div className="text-black text-center MatchScreenitems">
      <Head>
        <title>
          New Game
        </title>
      </Head>
      {err.type && err.message ? (
        <LoginBar type={err.type} message={err.message}></LoginBar>
      ) : null}

      <h3 className="py-5">Create A New Match</h3>
      {msg.error ? (
        <div className="alert alert-danger" role="alert">
          {msg.message}
        </div>
      ) : null}
      <Card className="text-black">
        <div className="form-group MatchScreenelem">
          <label className="form-label">Player Username</label>
          <div style={{ fontSize: "0.7rem" }}>
            (For Random Pairing, Put "Rand" As A Player)
          </div>
          <input
            ref={username_var}
            value={input_name}
            type="text"
            className="form-control"
          />
        </div>

        <div className="form-group MatchScreenelem">
          <label className="form-label">Arena</label>
          <select ref={arena_var} className="custom-select">
            <option value="sb" selected>
              Simple Black
            </option>
            <option value="sw">Simple White</option>
            <option value="w">Wild</option>
          </select>
        </div>

        <div className="form-group MatchScreenelem">
          <label className="form-label">Game Type</label>
          <select
            ref={gametype_var}
            className="custom-select"
            onChange={HandleChange}
          >
            <option value="Rounds">Rounds (±10XP)</option>
            <option value="Title">Title (±10XP)</option>
            <option value="Shot">One Shot (±20XP)</option>
            <option value="Casual">Casual (0XP)</option>
          </select>
        </div>

        {rounds ? (
          <div className="form-group MatchScreenelem">
            <label className="form-label">Rounds</label>
            <select ref={rounds_var} className="custom-select">
              <option value="3" selected>
                3
              </option>
              <option value="5">5</option>
              <option value="7">7</option>
            </select>
          </div>
        ) : null}

        {title ? (
          <div>
            <div className="form-group MatchScreenelem">
              <label className="form-label">The Loser Title </label>
              <input ref={title_var} type="text" className="form-control" />
            </div>
          </div>
        ) : null}

        <button onClick={CreateMatch} className="btn btn-primary my-2">
          Challenge
        </button>
      </Card>
    </div>
  );
}
