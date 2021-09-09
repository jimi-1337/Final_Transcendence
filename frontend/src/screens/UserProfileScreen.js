// import "./../css_files/UserProfile.css";
import { useContext, useState } from "react";
import { Redirect, useHistory } from "react-router";
import { userContext } from "../context/AuthProvider";
import axios from "axios";
import MatchHistory from "../elements/MatchHistory";
import LoginBar from "../elements/LoginBar";
import UserNotLogged from "../elements/UserNotLogged";
import FactorScreen from "./FactorScreen";
import Router from "next/router";
import getConfig from "next/config";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();

function UserProfileScreen(param) {
  const [avatar, setAvatar] = useState(false);
  const [mHistory, setHist] = useState(false);
  const { user } = useContext(userContext);
  const history = useHistory();
  const [er, setError] = useState({
    error: false,
    message: false,
  });
  const [userdata, setUserdata] = useState({
    id: 0,
    loading: true,
  });
  const userprofile = param.user;
  if (userdata.data && userdata.data.username !== userprofile) userdata.id = 0;
  async function getUserInfo() {
    if (!userprofile)
      return setUserdata({
        id: -1,
      });
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/user", {
        data: {
          username: userprofile,
          me: user.user,
        },
      });
      if (!val || val.data.id === -1)
        return setUserdata({
          id: -1,
          loading: false,
        });
      setUserdata({
        id: val.data.id,
        data: val.data,
        loading: false,
      });
      get_av(val.data.avatar);
    } catch (error) {
      console.log(error.message);
      setUserdata({
        id: -1,
        loading: false,
      });
    }
  }

  function get_av(s) {
    try {
      const p = s.split("/uploads/")[1];
      if (!p) {
        setAvatar(s);
        return "";
      }
      const path = publicRuntimeConfig.BACKEND_URL + "/uploads/" + p;
      fetch(path)
        .then(function (response) {
          return response.blob();
        })
        .then(function (res) {
          let imgObjectURL = URL.createObjectURL(res);
          if (imgObjectURL) {
            setAvatar(imgObjectURL);
          }
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  function ChangeActive(e) {
    e.preventDefault();
    setHist(true);
  }

  async function AddFriend() {
    setError({
      error: false,
      message: false,
    });
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/friend_request",
        {
          data: {
            username: user.user,
            friend: userdata.data.id,
          },
        }
      );
      if (!val || val.data.id <= 0) {
        if (val.data.message === "user")
          return setError({
            error: true,
            message: "The User Already Sent You A Friend Request..",
          });
        return setError({
          error: true,
          message: "An Error Happen Try Again Later",
        });
      }
      setError({
        error: false,
        message: "Friend Request Sent Successfully",
      });
    } catch (error) {
      console.log(error.mesasge);
    }
  }

  function SendMessage() {
    setError({
      error: false,
      message: false,
    });
    Router.push(`/messages#${userdata.data.username}`);
  }

  async function BlockUser() {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + `/block/${userdata.data.username}`,
        {
          data: {
            username: user.user,
          },
        }
      );
      if (!val || val.data.id <= 0)
        return setError({
          error: true,
          message: "An Error Occured Try Again Later",
        });
      setError({
        error: false,
        message: `User ${userdata.data.username} Has Been Blocked`,
      });
      let v = val.data.type;
      setUserdata({
        ...userdata,
        id: 0,
        loading: false,
      });
    } catch (error) {
      console.log(error.message);
      setError({
        error: true,
        message: "An Error Occured Try Again Later",
      });
    }
  }
  if (userdata.id === 0 && !user.isLoading) getUserInfo();
  return (
    <div className="ProfileBody">
      {er.error && er.message ? (
        <LoginBar type="alert-danger" message={er.message}></LoginBar>
      ) : null}
      {!er.error && er.message ? (
        <LoginBar type="alert-success" message={er.message}></LoginBar>
      ) : null}
      {userdata.id > 0 && userprofile ? (
        <div className="container bootstrap snippets bootdey">
          <Head>
            <title>Profile {userdata.data.username} </title>
          </Head>
          <div className="row">
            <div className="profile-nav col-md-3">
              <div className="card">
                <div className="user-heading round">
                  <a href="#">
                    <img src={avatar} alt="" />
                  </a>
                  <h1>
                    {userdata.data.username}{" "}
                    {userdata.data.admin ? <div>(admin)</div> : null}
                  </h1>
                  <p>{userdata.data.email}</p>
                </div>
                <ul className="nav-pills nav-stacked Nav-M">
                  {userdata.data.me_blocked ? (
                    <li>
                      <a href="#" onClick={BlockUser}>
                        {" "}
                        <i className="fa fa-ban"></i> Unblock
                      </a>
                    </li>
                  ) : user.user === userdata.data.username ? null : !userdata
                      .data.fr && !userdata.data.bl ? (
                    <li>
                      <a href="#" onClick={AddFriend}>
                        {" "}
                        <i className="fa fa-plus"></i> Friends
                      </a>
                    </li>
                  ) : null}
                  {user.user === userdata.data.username ||
                  userdata.data.bl ? null : (
                    <li>
                      <a href="#" onClick={SendMessage}>
                        {" "}
                        <i className="fa fa-envelope"></i> Message{" "}
                      </a>
                    </li>
                  )}
                  {user.user === userdata.data.username ||
                  userdata.data.bl ||
                  userdata.data.me_blocked ||
                  userdata.data.admin ? null : (
                    <li>
                      <a href="#" onClick={BlockUser}>
                        {" "}
                        <i className="fa fa-ban"></i> Block
                      </a>
                    </li>
                  )}
                  {userdata.data.admin ? null : (
                    <li>
                      <a href="#" onClick={ChangeActive}>
                        {" "}
                        <i className="fas fa-history"></i> Match History
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="profile-info col-md-9">
              <div className="card">
                <div className="bio-graph-heading">{userdata.data.title}</div>
                <div className="card-body bio-graph-info">
                  {mHistory ? (
                    <MatchHistory
                      username={userdata.data.username}
                      hFunction={setHist}
                    ></MatchHistory>
                  ) : (
                    <div>
                      {" "}
                      <h1>Player Info</h1>
                      <div className="row">
                        <div className="bio-row">
                          <p>
                            <span>First Name </span>: {userdata.data.first_name}
                          </p>
                        </div>
                        <div className="bio-row">
                          <p>
                            <span>Last Name </span>: {userdata.data.last_name}
                          </p>
                        </div>
                        <div className="bio-row">
                          <p>
                            <span>Country </span>: {userdata.data.country}
                          </p>
                        </div>
                        <div className="bio-row">
                          <p>
                            <span>Joined Date</span>: {userdata.data.createdAt}
                          </p>
                        </div>
                        <div className="bio-row">
                          <p>
                            <span>Campus </span>: {userdata.data.campus}
                          </p>
                        </div>
                        <div className="bio-row">
                          <p>
                            <span>Time Zone </span>: {userdata.data.time_zone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                {!mHistory ? (
                  <div className="row my-2">
                    <div className="col-md-6">
                      <div className="card my-2">
                        <div className="card-body text-center">
                          <h5 className="CardTitle text-winrate">Win Rate</h5>
                          <p>{userdata.data.winrate}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card my-2">
                        <div className="card-body text-center">
                          <h5 className="CardTitle text-lastmatch">
                            Last Match
                          </h5>
                          <p>{userdata.data.lastmatch}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card my-2">
                        <div className="card-body text-center">
                          <h5 className="CardTitle text-ladderlevel">
                            Ladder Level
                          </h5>
                          <p>Level {userdata.data.level}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card my-2">
                        <div className="card-body text-center">
                          <h5 className="CardTitle text-playerxp">Player XP</h5>
                          <p>{userdata.data.xp}XP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : userdata.id === -1 && !user.isLoading && !userdata.loading ? (
        <div>kkkk</div>
      ) : null}
    </div>
  );
}

export default UserProfileScreen;
