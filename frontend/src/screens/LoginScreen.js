import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { useHistory } from "react-router";
import { userContext } from "../context/AuthProvider";
import LoginBar from "../elements/LoginBar";
import Router from "next/router";
import getConfig from "next/config";
import Head from 'next/head'
const { publicRuntimeConfig } = getConfig();

export default function LoginScreen() {
  const history = useHistory();
  const username = useRef();
  const password = useRef();
  const [LoginError, SetLoginError] = useState(false);
  const { user, setUser } = useContext(userContext);

  
  async function SubmitForm(e) {
    e.preventDefault();
    SetLoginError(false);
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/login", {
        username: username.current.value,
        password: password.current.value,
      });
      if (val.data.username !== username.current.value) {
        SetLoginError(true);
      } else {
        localStorage.setItem("auth_key", val.data.token);
        if (val.data.auth) {
          const v = await axios.post(publicRuntimeConfig.BACKEND_URL + "/send/auth", {
            data: {
              username: val.data.username,
            },
          });
          setUser({
            isLoading: false,
            isLoggedIn: false,
            user: val.data.username,
            token: val.data.token,
            avatar: val.data.avatar,
            xp: val.data.xp,
            auth: true,
          });
        } else
          setUser({
            isLoading: false,
            isLoggedIn: true,
            user: val.data.username,
            token: val.data.token,
            avatar: val.data.avatar,
            xp: val.data.xp,
            auth: false,
          });
        Router.push("/member");
      }
    } catch (error) {
      console.log(error.message);
      SetLoginError(true);
    }
  }

  async function IntraClick(e) {
    e.preventDefault();
    try {
      const val = await axios.get(publicRuntimeConfig.BACKEND_URL + "/auth_link");
      const authlink = val.data;
      setTimeout(function () {
        document.location.href = authlink;
      }, 2000);
    } catch (error) {
      Router.push("/error");
    }
  }

  return (
    <Container fluid className="Color_Div">
      <Head>
        <title>
          Login
        </title>
      </Head>
      <div className="LoginBox">
        {LoginError ? (
          <LoginBar type="alert-danger" message="Bad Login Info" />
        ) : (
          <div></div>
        )}
        <form>
          <h3 className="text-center">Sign In</h3>

          <div className="form-group mar text-white">
            <label>Username</label>
            <input
              type="text"
              className="form-control our-form-control"
              placeholder="Enter Username"
              ref={username}
            />
          </div>

          <div className="form-group mar text-white">
            <label>Password</label>
            <input
              type="password"
              className="form-control our-form-control"
              placeholder="Enter password"
              ref={password}
            />
          </div>

          <div className="form-group mar">
            <div className="custom-control custom-checkbox"></div>
          </div>

          <div className="Bottun_log">
            <button
              onClick={SubmitForm}
              type="submit"
              className="btn btn-primary"
            >
              Login
            </button>
            <button
              onClick={IntraClick}
              type="submit"
              className="btn btn-primary intra-btn"
            >
              Intra42
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}
