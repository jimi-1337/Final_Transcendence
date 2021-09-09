import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { userContext } from "../context/AuthProvider";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import Router from "next/router";

export default function ChannelAdminPannel(params) {
  const [ban, setBan] = useState({
    id: false,
    users: [],
  });
  const pass = useRef();
  const { user } = useContext(userContext);
  const g_pass = useRef();
  const [st, setSt] = useState(false);
  const [A_admin, setAdmin] = useState(false);
  const g_admin = useRef();
  let c_name = document.location.pathname;
  let name = c_name.split("/channel/")[1];
  if (name[0] == "*") name = name.substring(1);
  const history = useHistory();
  async function ShowBanned() {
    if (ban.id)
      return setBan({
        id: false,
        users: [],
      });
    setBan({
      id: false,
      users: [],
    });
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel/banned",
        {
          data: {
            name,
          },
        }
      );
      if (!val || val.data.id < 0) return;
      setBan({
        id: true,
        users: val.data.users,
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  async function UnBanUser(username) {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel/unban",
        {
          data: {
            name,
            username,
          },
        }
      );
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: "An Error Occured Try Again Later",
        });
      params.action({
        type: "alert-success",
        message: `user ${username} is now unbanned from the channel`,
      });
      setBan({
        id: false,
      });
    } catch (error) {
      console.log(error.message);
      return params.action({
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }

  async function DeleteChannel() {
    try {
      const val = await axios.delete(
        publicRuntimeConfig.BACKEND_URL + "/channel/delete",
        {
          data: {
            name,
            username: user.user,
          },
        }
      );
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: "An Error Occured Try Again Later",
        });
      Router.push("/channels");
    } catch (error) {
      console.log(error.message);
    }
  }
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
        return params.action({
          type: "alert-danger",
          message: msg,
        });
      }
      Router.push("/channels");
    } catch (error) {
      console.log(error.message);
      params.action({
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }
  async function MakeAnAdmin() {
    let u = g_admin.current.value;
    if (!u)
      return params.action({
        type: "alert-danger",
        message: "Enter A Valid Username",
      });
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel/admin",
        {
          data: {
            name,
            username: u,
          },
        }
      );
      if (!val || val.data.id < 0) {
        let msg;

        if (val.data.message === "admin") msg = "User Is already An Admin";
        else if (val.data.message === "banned")
          msg =
            "User Is Banned From This Channel, Remove Him/Her From The Banned Users";
        else if (val.data.message === "user") msg = `User ${u} Does Not Exist`;
        else msg = "An Error Occured Try Again Later";
        return params.action({
          type: "alert-danger",
          message: msg,
        });
      }
      params.action({
        type: "alert-success",
        message: `${u} Is Now An Admin`,
      });
    } catch (error) {
      console.log(error.message);
      params.action({
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }
  async function ChangeChannelStatus(status) {
    if (status === "Private") {
      let p = pass.current.value;
      let g_p = g_pass.current.value;
      if (p != g_p)
        return params.action({
          type: "alert-danger",
          message: "Password Didn't Match",
        });
      if (!p || !g_p || p.length < 5) {
        return params.action({
          type: "alert-danger",
          message: "Enter A Valid Password",
        });
      }
    }
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/channel/status",
        {
          data: {
            name,
            status,
            password: pass.current.value,
          },
        }
      );
      document.getElementById("n_pass").value = "";
      document.getElementById("o_pass").value = "";
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: "Changing Channel Status Failed, Try Again Later",
        });
      params.action({
        type: "alert-success",
        message: `Your Channel Is Now ${status}`,
      });
      setTimeout(() => {
        setSt(false);
        if (status == "Public") Router.push(`/channel/${name}`);
        else Router.push(`/channel/*${name}`);
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.log(error.message);
      params.action({
        type: "alert-danger",
        message: "Changing Channel Status Failed, Try Again Later",
      });
    }
  }

  async function ChangePassword(e) {
    e.preventDefault();
    if (st) setSt(false);
    if (
      !pass.current.value ||
      !g_pass.current.value ||
      pass.current.value.length < 5 ||
      g_pass.current.value.length < 5
    )
      return params.action({
        type: "alert-danger",
        message: "Enter A Valid Password",
      });
    try {
      const val = await axios.put(
        publicRuntimeConfig.BACKEND_URL + "/channel/password",
        {
          data: {
            name,
            old_p: pass.current.value,
            pass: g_pass.current.value,
          },
        }
      );
      if ( document.getElementById("n_pass"))
        document.getElementById("n_pass").value = "";
      if ( document.getElementById("o_pass"))
        document.getElementById("o_pass").value = "";
      if (!val || val.data.id < 0) {
        if (val.data.message === "wrong")
          return params.action({
            type: "alert-danger",
            message: "Old Password Didn't Match.",
          });
        return params.action({
          type: "alert-danger",
          message: "An Error Occured, The Channel Password Didn't Change",
        });
      }
      return params.action({
        type: "alert-success",
        message: "Channel Password Changed Successfully",
      });
    } catch (error) {
      console.log(error.message);
      return params.action({
        type: "alert-danger",
        message: "An Error Occured, The Channel Password Didn't Change",
      });
    }
  }
  return (
    <div>
      <div className="text-center">Owner Panel</div>

      <button
        className="btn btn-primary m-2"
        onClick={() => {
          if (st) setSt(false);
          else setSt(true);
        }}
      >
        {" "}
        Change Channel Status
      </button>
      <button
        className="btn btn-primary m-2"
        onClick={() => {
          if (A_admin) setAdmin(false);
          else setAdmin(true);
        }}
      >
        Add Admin
      </button>
      <button className="btn btn-primary m-2" onClick={LeaveChannel}>
        Leave The Channel
      </button>
      <button className="btn btn-primary m-2" onClick={DeleteChannel}>
        Delete The Channel
      </button>
      <button className="btn btn-primary m-2" onClick={ShowBanned}>
        Banned Users
      </button>
      {A_admin ? (
        <div className="text-center m-5">
          <input placeholder="Username" ref={g_admin}></input>
          <button className="btn btn-info m-2" onClick={MakeAnAdmin}>
            Make An Admin
          </button>
        </div>
      ) : null}
      {st ? (
        <div
          className="card w-2 text-center"
          style={{
            width: "100%",
            minHeight: "25rem",
            borderWidth: "2px",
            borderStyle: "dashed",
          }}
        >
          {params.private ? (
            <div className="mt-5">
              <form style={{ minHeight: "15rem" }}>
                <h6>Change Channel Password</h6>
                <input
                  placeholder="Old Password"
                  ref={pass}
                  type="password"
                  className="m-1"
                  id="o_pass"
                ></input>
                <input
                  placeholder="New Password"
                  type="password"
                  ref={g_pass}
                  className="m-1"
                  id="n_pass"
                ></input>
                <button
                  className="btn btn-secondary m-1"
                  onClick={ChangePassword}
                >
                  {" "}
                  Change Password
                </button>
              </form>
              <button
                className="btn btn-info m-4"
                onClick={() => {
                  ChangeChannelStatus("Public");
                }}
              >
                Make Channel Public
              </button>
            </div>
          ) : (
            <div className="m-5">
              {" "}
              <div style={{ minHeight: "15rem", marginTop: "10rem" }}>
                <input
                  placeholder="Password"
                  ref={pass}
                  type="password"
                  className="m-1"
                  id="o_pass"
                ></input>
                <input
                  placeholder="ReEnter Password"
                  type="password"
                  ref={g_pass}
                  className="m-1"
                  id="n_pass"
                ></input>
                <button
                  className="btn btn-info m-1"
                  onClick={() => {
                    ChangeChannelStatus("Private");
                  }}
                >
                  {" "}
                  Make Channel Private
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
      {ban.id && ban.users.length ? (
        ban.users.map((b) => {
          return (
            <div
              className="card w-2"
              style={{
                width: "100%",
                minHeight: "25rem",
                borderWidth: "2px",
                borderStyle: "dashed",
              }}
            >
              <div className="text-center m-3">
                <h6 style={{}}>Banned Users</h6>
                <Row>
                  <Col xs={8}>
                    <div
                      className="btn"
                      onClick={() => {
                        Router.push(`/user/${b.username}`);
                      }}
                    >
                      {b.username}
                    </div>
                  </Col>
                  <Col
                    className="btn btn-primary"
                    style={{ maxWidth: "5rem" }}
                    onClick={() => {
                      UnBanUser(b.username);
                    }}
                  >
                    (unban)
                  </Col>
                </Row>
              </div>
            </div>
          );
        })
      ) : ban.id ? (
        <div className="text-center m-5">No User Is Currently Banned</div>
      ) : null}
    </div>
  );
}
