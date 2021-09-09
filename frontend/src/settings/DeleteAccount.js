import { useContext, useRef, useState } from "react";
// import "./../css_files/DeleteAccount.css";
import {useHistory } from "react-router-dom";
import axios from "axios";
import {userContext} from '../context/AuthProvider';
import LoginBar from "../elements/LoginBar";
import Router from "next/router";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


export default function DeleteAccount(props) {
  const [error, setError] = useState(false);
  const history = useHistory();
  const { user, setUser } = useContext(userContext);
  const pass = useRef();
  async function ClickHandle(e) {
    e.preventDefault();

    setError(false);
    const pas = pass.current.value;
    if (!pas) return setError(true);
    try {
      const val = await axios.delete(publicRuntimeConfig.BACKEND_URL + "/delete_user", {
        data: {
          username: user.user,
          password: pas,
        },
      });
      if (val.data.id <= 0) return setError(true);
      localStorage.removeItem("auth_key");
      setUser({
        isLoading: false,
        isLoggedIn: false,
        user: undefined,
        token: undefined,
        avatar: undefined,
      });
      Router.push("/login");
    } catch (error) {
      setError(true);
    }
  }

  function RestError() {
    setError(false);
  }
  return (
    <div className="text-black">
      <form onSubmit={ClickHandle}>
        <div className="card-body pb-2">
          {error ? (
            <div className="text-center">
              <LoginBar
                type="alert-danger"
                message="Incorrect Password"
              ></LoginBar>
            </div>
          ) : null}
          <div className="form-group">
            <label className="form-label">
              Are you sure you want to delete your account ?
            </label>
            <input
              ref={pass}
              type="password"
              className="form-control"
              placeholder="Enter Your Password"
            />
          </div>
        </div>

        <div className="text-center mt-3">
          <button type="submit" className="btn btn-primary m-2">
            Delete
          </button>
          &nbsp;
          <input
            onClick={RestError}
            type="reset"
            value="Reset"
            className="btn btn-default m-3 "
          />
        </div>
      </form>
    </div>
  );
}
