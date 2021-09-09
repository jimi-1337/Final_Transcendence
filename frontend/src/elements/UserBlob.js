import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../../pages/_app";
import Router from "next/router";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export default function UserBlob(params) {
  const [avatar, setAvatar] = useState(false);
  let val = params.user.message_c;

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
  const v = window.location?.hash.substring(1);

  useEffect(() => {
    params.click(v);
  }, [v]);

  if (!avatar) get_av(params.user.avatar);
  return (
    <div>
      {
        <li
          className="person"
          data-chat="person1"
          id={params.user.username}
          onClick={() => {
            params.user.message_c = 0;
            params.click(params.user.username);
          }}
        >
          <div className="user" id={params.user.username}>
            <img
              src={avatar}
              alt={params.user.username}
              onClick={() => {
                if (params.user.status === "in_game")
                  Router.push(`/game_redirect/${params.user.gameId}`);
                else Router.push(`/user/${params.user.username}`);
              }}
            />
            <span className={`user-status ${params.user.status}`}></span>
          </div>
          <p className="name-time" style={{ width: "70%" }}>
            <span className="name">{params.user.username}</span>
            {params.user.message_c > 0 ? (
              <span className="badge badge-danger" style={{ float: "right" }}>
                {params.user.message_c}
              </span>
            ) : null}
          </p>
        </li>
      }
    </div>
  );
}
