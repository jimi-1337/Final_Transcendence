import axios from "axios";
import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";
import getConfig from "next/config";
import Router from "next/router";
import { userContext } from "../../context/AuthProvider";

const { publicRuntimeConfig } = getConfig();

export default function ModBar(params) {
  const { user } = useContext(userContext);
  const [avatar, setAvatar] = useState(false);
  function get_av(s) {
    try {
      const p = s.split("/uploads/")[1];
      if (!p) {
        setAvatar(s);
        return s;
      }
      const path = publicRuntimeConfig.BACKEND_URL + "/uploads/" + p;
      const val = fetch(path)
        .then(function (response) {
          return response.blob();
        })
        .then(function (res) {
          let imgObjectURL = URL.createObjectURL(res);
          if (imgObjectURL) {
            setAvatar(imgObjectURL);
            return imgObjectURL;
          }
        });
      return val;
    } catch (error) {}
  }
  if (!avatar) get_av(params.user.avatar);

  async function RemoveUser() {
    if (user.user === params.user.username) {
      return params.action({
        type: "alert-danger",
        message: "You Can't Remove Yourself...., Contact GOD",
      });
    }
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/admin/remove_mod",
        {
          data: {
            username: params.user.username,
          },
        }
      );
      if (!val || val.data.id < 0) {
        if (val.data.message == "owner")
          return params.action({
            type: "alert-danger",
            message: "Are You Dumb, That's The Owner ...",
          });
        return params.action({
          type: "alert-danger",
          message: "An Error Occured, Try Again Later",
        });
      }
      params.action({
        type: "alert-success",
        message: `${params.user.username} Removed Successfully`,
      });
      params.users(false);
    } catch (error) {
      console.log(error.mesasge);
    }
  }
  return (
    <li className="person" data-chat="person1">
      <Row>
        <Col>
          <div
            className="user"
            id={params.user.username}
            style={{ position: "absolute", left: "1rem", top: "-0.41rem" }}
          >
            <img src={avatar} alt={params.user.username} />
          </div>
          <p className="name-time">
            <span className="name">{params.user.username}</span>
          </p>
          <div
            style={{
              display: "inline-block",
              marginLeft: "1rem",
              position: "absolute",
              right: "1rem",
            }}
          >
            <i className="fas fa-user-times p-1 " onClick={RemoveUser}></i>
          </div>
        </Col>
      </Row>
    </li>
  );
}
