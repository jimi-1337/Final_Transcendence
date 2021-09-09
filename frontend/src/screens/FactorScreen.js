import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Container, Form } from "react-bootstrap";
import LoginBar from "../elements/LoginBar";
import {userContext} from '../context/AuthProvider';
import getConfig from "next/config";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();


export default function FactorScreen() {
  const { user, setUser } = useContext(userContext);
  const code = useRef();
  const [er, setErr] = useState({
    id: false,
    type: "",
    message: "",
  });

  useEffect(async () => {
    if (user.user && !user.auth && !user.set) {
      try {
        const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/send/auth", {
          data: {
            username: user.user,
          },
        });
        if (!val || val.data.id < 0)
          setErr({
            id: true,
            type: "alert-danger",
            message: "An Error Occured Try Again Later",
          });
      } catch (error) {
        console.log(error.message);
        setErr({
          id: true,
          type: "alert-danger",
          message: "An Error Occured Try Again Later",
        });
      }
    }
  }, [user.user]);

  async function SubmitCode(e) {
    e.preventDefault();
    setErr({
      id: false,
      type: "",
      message: "",
    });
    try {
      const g_code = code.current.value;
      if (!g_code)
        return setErr({
          id: true,
          type: "alert-danger",
          message: "Authentication Code Can't Be Empty",
        });
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/user/2-auth", {
        data: {
          username: user.user,
          code: g_code,
        },
      });
      if (!val || val.data.id < 0)
        return setErr({
          id: true,
          type: "alert-danger",
          message: "Authentication Code Is Wrong",
        });
      setUser({
        ...user,
        auth: false,
        isLoggedIn:true
      });
    } catch (error) {
      console.log(error.message);
      setErr({
        id: true,
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }
  return (
    <div>
      <Head>
        <title>
        Factor Authentication
        </title>
      </Head>
      <div className="text-center p-2">
        {er.id ? (
          <LoginBar type={er.type} message={er.message}></LoginBar>
        ) : null}
        <label for="exampleInputEmail1 text-center"></label>
        <small id="emailHelp" className="form-text text-muted DisplayNameText">
          We Sent An Authentication Code To Your Email Address, Enter It Below
          To Continue
        </small>
      </div>

      <form className="ChangeName text-center" onSubmit={SubmitCode}>
        <div className="form-group text-center">
          <div className="text-center">
            <input
              type="text"
              className="form-control DisplayNameInput text-center"
              placeholder="Authentication Code"
              style={{ minWidth: "25rem" }}
              ref={code}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" onClick={SubmitCode}>
          Submit
        </button>
      </form>
    </div>
  );
}
