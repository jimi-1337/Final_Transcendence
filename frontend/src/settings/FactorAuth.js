import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import LoginBar from "../elements/LoginBar";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export default function FactorAuth() {
  const { user } = useContext(userContext);
  const [authUser, setAuthUser] = useState(false);
  const em = useRef();
  const [er, setErr] = useState({
    id: false,
    type: "",
    message: "",
  });
  const pass = useRef();

  async function AddAuth(e) {
    const email = em.current.value;
    const password = pass.current.value;
    e.preventDefault();
    setErr({
      id: false,
      type: "",
      message: "",
    });
    if (!email)
      return setErr({
        id: true,
        type: "alert-danger",
        message: "Email Address Is Not Valid",
      });

    if (!password || password.length < 5)
      return setErr({
        id: true,
        type: "alert-danger",
        message: "Password Is Not Valid",
      });
    const val = await axios.post(
      publicRuntimeConfig.BACKEND_URL + "/user/auth",
      {
        data: {
          username: user.user,
          email,
          password,
        },
      }
    );
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    if (!val || val.data.id < 0)
      return setErr({
        id: true,
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    setErr({
      id: true,
      type: "alert-success",
      message: `Email 2-Factor Authentication Has Been Activated With ${email} As Email Address`,
    });
    try {
    } catch (error) {
      console.log(error.message);
      return setErr({
        id: true,
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }
  useEffect(async () => {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/user/validauth",
        {
          data: {
            username: user.user,
          },
        }
      );
      if (!val || val.data.id <= 0)
        return setErr({
          id: true,
          type: "alert-danger",
          message: "An Error Occured Try Again Later",
        });
      if (val.data.auth)
        setAuthUser({
          id: true,
          email: val.data.email,
        });
    } catch (error) {
      console.log(error.message);
    }
  }, [authUser]);

  async function DeactivateAuth() {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/user/deactivateauth",
        {
          data: {
            username: user.user,
          },
        }
      );
      if (!val || val.data.id <= 0)
        return setErr({
          id: true,
          type: "alert-danger",
          message: "An Error Occured Try Again Later",
        });
      setErr({
        id: true,
        type: "alert-success",
        message: `Email 2-Factor Authentication Has Been Deactivate`,
      });
      setAuthUser(false);
    } catch (error) {
      console.log(error.message);
      return setErr({
        id: true,
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }
  return (
    <div>
      {!user.isLoading && user.isLoggedIn ? (
        <div className="ChangeName">
          {er.id ? (
            <LoginBar type={er.type} message={er.message}></LoginBar>
          ) : null}

          <form onSubmit={AddAuth}>
            <div className="form-group text-center">
              <label for="exampleInputEmail1"></label>
              <small
                id="emailHelp"
                className="form-text text-muted DisplayNameText"
              >
                Email 2-Factor Authentication
              </small>
              <input
                id="email"
                type="email"
                className="form-control DisplayNameInput"
                placeholder="Enter Your New Email Address"
                ref={em}
                style={{ width: "17rem" }}
              />
            </div>
            <div className="form-group text-center">
              <label for="exampleInputEmail1"></label>
              <small
                id="emailHelp"
                className="form-text text-muted DisplayNameText"
              >
                Account Password
              </small>
              <input
                id="password"
                type="password"
                className="form-control DisplayNameInput"
                placeholder="Enter Your Account Password"
                ref={pass}
              />
              <button type="submit" className="btn btn-primary m-5">
                Change
              </button>
            </div>
          </form>
          {authUser.id ? (
            <div className="text-center">
              Current 2-Factor Authentication Email: {authUser.email}
              <br></br>
              <button
                className="btn btn-danger mt-3 mb-3"
                onClick={DeactivateAuth}
              >
                {" "}
                Deactivate
              </button>
            </div>
          ) : null}
        </div>
      ) : !user.isLoading ? (
        <UserNotLogged />
      ) : null}
    </div>
  );
}
