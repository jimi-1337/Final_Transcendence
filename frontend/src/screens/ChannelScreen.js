import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useHistory } from "react-router";
import ChannelAdminPannel from "../elements/ChannelAdminPannel";
import LeftMessage from "../elements/LeftMessage";
import LoginBar from "../elements/LoginBar";
import MuteOrBan from "../elements/MuteOrBan";
import RightMessage from "../elements/RightMessage";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
import FactorScreen from "./FactorScreen";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import Router from "next/router";
import { socket } from "../../pages/_app";
import Head from "next/head";

let p = false;

export default function ChannelScreen(params) {
  const { user } = useContext(userContext);
  const [ret, setRet] = useState({ id: -1 });
  const [messages, setMessages] = useState(false);
  const msg = useRef();
  const g_pass = useRef();
  const [update, setUpdate] = useState(false);
  const [banned_u, setBan] = useState(false);
  const history = useHistory();
  const [joinroom, setJoinroom] = useState(false);
  const [listenroom, setListenroom] = useState(false);
  const [channelOwner, setChannelOwner] = useState(false);

  let c_name = document.location.pathname;
  let name = c_name.split("/channel/")[1];
  if (name[0] === "*") name = name.substring(1);
  const [err, setErr] = useState({
    type: "",
    message: "",
  });

  async function LeaveChannel() {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel/leave",
        {
          data: {
            name,
            username: user.user,
          },
        }
      );
      if (!val || val.data.id < 0) {
        let msg;

        if (val.data.message === "admin")
          msg = "Make An Admin, Before Leaving The Channel";
        else msg = "An Error Occured Try Again Later";
        return setErr({
          type: "alert-danger",
          message: msg,
        });
      }
      Router.push("/channels");
    } catch (error) {
      console.log(error.message);
      setErr({
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }

  async function get_mesasges() {
    let c_name = document.location.pathname;
    let name = c_name.split("/channel/")[1];
    let pv = false;
    setErr({
      type: "",
      message: "",
    });
    if (!user.user) return;
    if (name[0] === "*") {
      pv = true;
      p = true;
      name = name.substring(1);
    }
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/get_channel",
        {
          data: {
            username: user.user,
            channel: name,
            pv: pv,
          },
        }
      );
      if (!val || val.data.id < 0) {
        if (val.data.message === "banned") {
          setMessages(false);
          setBan(true);
        }
        return;
      }
      setMessages(val.data.messages);
      setRet(val.data.ret);
      setChannelOwner(val.data.owner);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(async () => {
    await get_mesasges();
  }, [user.user, update]);

  async function SubmitPass(e) {
    e.preventDefault();
    try {
      let c_name = document.location.pathname;
      let name = c_name.split("/channel/")[1];
      name = name.substring(1);

      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel_access",
        {
          data: {
            name,
            pass: g_pass.current.value,
            username: user.user,
          },
        }
      );
      if (!val || val.data.id < 0)
        return setErr({
          type: "alert-danger",
          message: "Wrong Password, Enter A Valid Password",
        });
      if (!update) setUpdate(true);
      else setUpdate(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function SendMessage(e) {
    e.preventDefault();
    setErr({
      type: "",
      message: "",
    });
    if (msg.current.value.length <= 0) return;
    let m = msg.current.value;
    let c_name = document.location.pathname;
    let name = c_name.split("/channel/")[1];
    if (name[0] === "*") name = name.substring(1);
    document.getElementById("message").value = "";
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel_send",
        {
          data: {
            message: m,
            username: user.user,
            name,
          },
        }
      );
      if (!val || val.data.id < 0) {
        if (val.data.message === "muted")
          return setErr({
            type: "alert-danger",
            message: "An Admin Muted You, Try Again Later",
          });
        if (val.data.message === "out") {
          if (!update) setUpdate(true);
          else setUpdate(false);
          return;
        }
        if (val.data.message === "ban") {
          if (!update) setUpdate(true);
          else setUpdate(false);
          return;
        }
        return setErr({
          type: "alert-danger",
          message: "Message Didn't Send, An Error Occured",
        });
      }
      if (!update) setUpdate(true);
      else setUpdate(false);
    } catch (error) {
      console.log(error.message);
    }
  }
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    setTimeout(function () {
      scrollToBottom();
      socket.off("recived_channel");
      socket.on("recived_channel", () => {
        if (!update) setUpdate(true);
        else setUpdate(false);
      });
    }, 50);
  }, [messages]);

  useEffect(async () => {
    if (!joinroom) {
      socket.emit("joinRoom", name);
      setJoinroom(true);
    }
  }, [name]);
  return (
    <div className="container text-black main-body">
      <Head>
        <title>
          Channel {name}
        </title>
      </Head>
      <h1>Channel Screen</h1>
      {banned_u ? (
        <h1>You Can't Access This Channel</h1>
      ) : err.type.length > 0 ? (
        <LoginBar type={err.type} message={err.message}></LoginBar>
      ) : null}
      <div
        className="chat-container"
        style={{
          height: "40rem",
          overflow: "scroll",
          overflowY: "scroll",
          overflowX: "hidden",
          width: "80%",
          background: "#f4f5fb",
        }}
      >
        <ul className="chat-box chatContainerScroll">
          {ret.id > 0 && !ret.allowed ? (
            <form className="text-center" onSubmit={SubmitPass}>
              <h3></h3>
              <Col className="mt-5">
                <input
                  id="message"
                  type="password"
                  style={{ width: "60%" }}
                  placeholder="Enter The Channel Password"
                  ref={g_pass}
                ></input>
              </Col>
              <button
                className="btn btn-primary m-2"
                style={{
                  width: "15%",
                  textAlign: "center",
                  fontSize: "0.75rem",
                }}
              >
                {" "}
                Submit
              </button>
            </form>
          ) : messages.id > 0 ? (
            <div>
              {messages.messages.map((m) => {
                if (m.sender === user.user)
                  return (
                    <RightMessage
                      user={m.sender}
                      avatar={m.sender_avatar}
                      msg={{
                        createdAt: m.date,
                        message: m.message,
                      }}
                    ></RightMessage>
                  );
                else
                  return (
                    <div>
                      <Row>
                        <Col sm={10}>
                          {" "}
                          <LeftMessage
                            user={m.sender}
                            avatar={m.sender_avatar}
                            msg={{
                              createdAt: m.date,
                              message: m.message,
                            }}
                          ></LeftMessage>
                        </Col>
                        {ret.admin && m.sender != channelOwner && !m.admin ? (
                          <MuteOrBan
                            channel={name}
                            user={m.sender}
                            action={setErr}
                          ></MuteOrBan>
                        ) : null}
                      </Row>
                    </div>
                  );
              })}
              <div className="form-group mt-3 mb-0">
                <form className="text-center" onSubmit={SendMessage}>
                  <Row>
                    <Col className="text-center" sm={10}>
                      <input
                        type="text"
                        className="form-control"
                        ref={msg}
                        id="message"
                      ></input>
                    </Col>
                    <Col sm={1}>
                      <button className="btn btn-primary"> Send</button>
                      <div ref={messagesEndRef}></div>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          ) : null}
        </ul>
      </div>
      <br></br>
      {ret.id > 0 &&
      ((ret.allowed && ret.admin && user.user === channelOwner) ||
        ret.siteadmin) ? (
        <ChannelAdminPannel private={p} action={setErr}></ChannelAdminPannel>
      ) : !ret.admin && ret.allowed && p ? (
        <div>
          <button className="btn btn-info" onClick={LeaveChannel}>
            Leave The Channel
          </button>
        </div>
      ) : null}
    </div>
  );
}
