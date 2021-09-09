import { useContext, useRef, useState } from "react";
import { userContext } from "../context/AuthProvider";
// import "../css_files/NewUser.css";
import axios from "axios";
import LoginBar from "../elements/LoginBar";
import { useHistory } from "react-router";
import UserNotLogged from "../elements/UserNotLogged";
import FactorScreen from "./FactorScreen";
import Router from "next/router";
import getConfig from "next/config";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();

export default function NewUserScreen() {
  const { user } = useContext(userContext);
  const [error, setError] = useState(false);
  const name = user.user || "User";
  const pass = useRef();
  const passg = useRef();
  const history = useHistory();

  async function FormSubmit(e) {
    e.preventDefault();
    try {
      if (pass.current.value != passg.current.value)
        return setError("Password Didn't Match");
      if (passg.current.value.length < 5)
        return setError("Password Can't be Less Than 5 Characters");
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/change_password",
        {
          username: user.user,
          password: pass.current.value,
        }
      );
      if (!val.data || val.data.id < 0)
        return setError("An Error Occured Try Again Later");
      else Router.push("/member");
    } catch (error) {
      console.log(error.message);
      setError("An Error Occured Try Again Later");
    }
  }
  return (
    <main className="my-form UserForm">
      <Head>
        <title>
          New User
        </title>
      </Head>
      <div className="cotainer">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {error ? (
              <LoginBar type="alert-danger" message={error}></LoginBar>
            ) : null}
            <div className="card">
              <div className="card-header">
                Hey {name}, please set a password for your account
              </div>
              <div className="card-body">
                <form onSubmit={FormSubmit} name="my-form">
                  <div className="form-group row">
                    <label
                      for="full_name"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Password
                    </label>
                    <div className="col-md-6">
                      <input
                        type="password"
                        id="display_name"
                        className="form-control"
                        name="display-name"
                        ref={pass}
                      />
                    </div>
                  </div>
                  <div className="form-group row">
                    <label
                      for="phone_number"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Verify Password
                    </label>
                    <div className="col-md-6">
                      <input
                        type="password"
                        id="phone_number"
                        className="form-control"
                        ref={passg}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 offset-md-4">
                    <button type="submit" className="btn btn-primary">
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
