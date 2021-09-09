import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Container} from "react-bootstrap";
import LoginBar from "../elements/LoginBar";
import {userContext} from '../context/AuthProvider';
// import "./../css_files/ChangeName.css";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


export default function ChangeDisplayName() {
  const { user, setUser } = useContext(userContext);
  const [error, setError] = useState({
    type: null,
    message: null,
  });
  const NewName = useRef();

  async function SubmitName(e) {
    e.preventDefault();
    setError({
      type: null,
      message: null,
    });
    const displayname = NewName.current.value;

    if (!displayname || displayname.length < 5)
      return setError({
        type: "alert-danger",
        message: "Display Name Can't Be Empty or Less Than 5 Characters",
      });
    if (displayname === user.user)
      return setError({
        type: "alert-danger",
        message: "WTF, That's Your Display Name Already....",
      });
    try {
      const res = await axios.post(publicRuntimeConfig.BACKEND_URL + "/change_username", {
        data: {
          displayname: displayname,
          username: user.user,
        },
      });
      if (res.data.id <= 0) {
        if (res.data.error === "User Exist")
          return setError({
            type: "alert-danger",
            message: "Display Name Already Taken, Try Another One",
          });

        return setError({
          type: "alert-danger",
          message: "An Error Occurred Try Again Later",
        });
      }
      setUser({
        isLoading: user.isLoading,
        isLoggedIn: user.isLoggedIn,
        user: displayname,
        token: user.token,
        avatar:user.avatar
      })
      return setError({
        type: "alert-success",
        message: "Your Display Name Has Been Changed",
      });
    } catch (error) {
      return setError({
        type: "alert-danger",
        message: "An Error Occured Try Again Later",
      });
    }
  }

  return (
    <Container>
      <form onSubmit={SubmitName} className="ChangeName">
        {error.type ? (
          <LoginBar type={error.type} message={error.message}></LoginBar>
        ) : null}
        <div className="form-group">
          <label htmlFor="exampleInputEmail1"></label>
          <small id="emailHelp" className="form-text text-muted DisplayNameText">
            Your Curent Display Name Is : {user.user}
          </small>
          <input
            type="text"
            className="form-control DisplayNameInput"
            placeholder="Enter Display name"
            ref={NewName}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Change
        </button>
      </form>
    </Container>
  );
}
