import { useContext, useRef, useState } from "react";
import {userContext} from '../context/AuthProvider';
// import "../css_files/NewUser.css";
import axios from "axios";
import LoginBar from "../elements/LoginBar";
// import "../css_files/CenterForm.css";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


export default function ChangePassword() {
  const { user } = useContext(userContext);
  const [error, setError] = useState(false);
  const [sec, setSec] = useState(false);
  const pass = useRef();
  const passg = useRef();

  async function FormSubmit(e) {
    setSec(false)
    setError(false);
    e.preventDefault();
    if (pass.current.value !== passg.current.value)
      return setError("Password Didn't Match");
    if (passg.current.value.length < 5)
      return setError("Password Can't be Less Than 5 Characters");
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/change_password", {
        username: user.user,
        password: pass.current.value,
      });
      if (!val.data || val.data.id < 0)
        return setError("An Error Occured Try Again Later");
      else{
        setSec(true);
      }
    } catch (error) {
      console.log(error.message);
      setError("An Error Occured Try Again Later");
    }
  }
  return (
    <div className="text-black">
      <form onSubmit={FormSubmit}>
        <div className="card-body pb-2">
          {error ? (
            <div className="text-center">
              <LoginBar type="alert-danger" message={error}></LoginBar>
            </div>
          ) : sec ? (
            <div className="text-center">
              <LoginBar type="alert-success" message="Password Changed"></LoginBar>
            </div>
          ) : null}
          <div className="form-group">
            <label className="form-label">New password</label>
            <input ref={pass} type="password" className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Repeat new password</label>
            <input ref={passg} type="password" className="form-control" />
          </div>
        </div>

        <div className="text-right mt-3">
          <button type="submit" className="btn btn-primary m-2">
            Save changes
          </button>
          &nbsp;
          <input type="reset" value="Reset" className="btn btn-default m-3 " />
        </div>
      </form>
    </div>
  );
}
