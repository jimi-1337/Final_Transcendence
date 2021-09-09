import { useState } from "react";
import Router from "next/router";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export default function FriendElement(props) {
  const [avatar, setAvatar] = useState(false);
  function get_av(s) {
    try {
      const p = s.split("/uploads/")[1];
      if (!p) {
        setAvatar(s);
        return "";
      }
      const path = publicRuntimeConfig.BACKEND_URL + "/uploads/" + p;
      fetch(path)
        .then(function (response) {
          return response.blob();
        })
        .then(function (res) {
          let imgObjectURL = URL.createObjectURL(res);
          if (imgObjectURL) {
            setAvatar(imgObjectURL);
          }
        });
    } catch (error) {
      console.log(error.message);
    }
  }
  if (!avatar) get_av(props.user.avatar);
  return (
    <div className="col-md-4">
      <div className="card text-center" style={{ width: "14rem" }}>
        <div className="user-heading-list round-list">
          <a href={`/user/${props.user.username}`}>
            <img src={avatar} className="card-img-top text-black" />
          </a>
        </div>
        <div className="card-body">
          <h5 className="card-title text-center text-black">
            {props.user.username}
          </h5>

          <p className="card-text text-color" style={{ fontSize: "small" }}>
            {props.user.title.length > 20
              ? props.user.title.substr(0, 20) + "..."
              : props.user.title}
          </p>
          <div className="text-center">
            <p
              className="status"
              onClick={() => {
                if (props.user.status === "in_game")
                  Router.push(`/game_redirect/${props.user.gameId}`);
              }}
            >
              {props.user.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
