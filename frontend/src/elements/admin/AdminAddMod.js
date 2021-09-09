import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Row } from "react-bootstrap";
import LoginBar from "../LoginBar";
import getConfig from "next/config";
import { userContext } from "../../context/AuthProvider";
const { publicRuntimeConfig } = getConfig();

export default function AdminAddMod() {
  const us_name = useRef();
  const { user } = useContext(userContext);
  const [msg, setMsg] = useState({ id: false, type: "", message: "" });
  async function AddMod(e) {
    e.preventDefault();
    try {
      if (us_name.current.value == user.user)
        return setMsg({
          id: true,
          type: "alert-danger",
          message: "That's You !!!!, What Are You Smoking",
        });
    
      if (us_name.current.value.length < 5)
        return setMsg({
          id: true,
          type: "alert-danger",
          message: "User Don't Exist, Enter A Valid Name",
        });
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/admin/mod",
        {
          data: {
            username: us_name.current.value,
          },
        }
      );
      if (!val || val.data.id <= 0) {
        if (val.data.message === "user")
          return setMsg({
            id: true,
            type: "alert-danger",
            message: "User Don't Exist, Enter A Valid Name",
          });
        else if (val.data.message === "mod")
          return setMsg({
            id: true,
            type: "alert-danger",
            message: "User Already A Moderator",
          });
      }
      setMsg({
        id: true,
        type: "alert-success",
        message: `${us_name.current.value} Is Now A Moderator`,
      });
    } catch (error) {
      console.log(error.message);
      return setMsg({
        id: true,
        type: "alert-danger",
        message: "An Error Occured, Try Again Later",
      });
    }
  }
  return (
    <div className="text-center">
      {msg.id ? (
        <LoginBar type={msg.type} message={msg.message}></LoginBar>
      ) : null}
      <form onSubmit={AddMod}>
        <Row>
          <label className="mr-4">Username: </label>
          <input ref={us_name} style={{ display: "inline-block" }}></input>
        </Row>
        <button
          className="btn btn-info mt-3"
          style={{ display: "inline-block" }}
        >
          {" "}
          Make Moderator
        </button>
      </form>
    </div>
  );
}
