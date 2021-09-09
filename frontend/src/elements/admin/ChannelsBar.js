import axios from "axios";
import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";
import getConfig from "next/config";
import Router from "next/router";
import { userContext } from "../../context/AuthProvider";

const { publicRuntimeConfig } = getConfig();

export default function UserBar(params) {
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
  async function RemoveChannel() {
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/admin/access_channel",
        {
          data: {
            channel: params.user.username,
            username:user.user
          },
        }
      );
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: "An Error Occured, Try Again Later",
        });
        if (val.data.status === 'private')
            Router.push(`/channel/*${params.user.username}`)
        else
            Router.push(`/channel/${params.user.username}`)
    } catch (error) {
      console.log(error.mesasge);
    }
  }
  return (
    <li className="person" data-chat="person1">
      <Row>
        <Col>
          <div
            className="user text-center"
            id={params.user.username}
            style={{ position: "relative", left: "1rem", top: "0rem" }}
          ></div>
          <p className="name-time text-center" style={{ marginLeft: "-8rem" }}>
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
            <i className="fas fa-columns" onClick={RemoveChannel}></i>
          </div>
        </Col>
      </Row>
    </li>
  );
}
