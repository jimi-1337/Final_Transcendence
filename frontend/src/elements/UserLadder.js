import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const colors = {
  0: "#ebebff",
  1: "#c4c4ff",
  2: "#b0b0ff",
  3: "#8989ff",
  4: "#7575ff",
  5: "#3f51b5",
};
export default function UserLadder(params) {
  let level = 0;

  if (params.user.xp >= 200) level = 1;
  if (params.user.xp >= 300) level = 2;
  if (params.user.xp >= 500) level = 3;
  if (params.user.xp >= 700) level = 4;
  if (params.user.xp >= 1000) level = 5;
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
  useEffect(async () => {
    await get_av(params.user.avatar);
  }, []);
  return (
    <tr className="candidates-list" style={{ background: colors[level] }}>
      <td>#{params.v}</td>
      <td class={`${params.user.username}`}>
        <div className="thumb">
          <img
            className="img-fluid"
            src={avatar}
            alt=""
            style={{
              borderRadius: "2rem",
              maxHeight: "4rem",
              maxWidth: "4rem",
            }}
          />
        </div>
        <div className="candidate-list-details">
          <div className="candidate-list-info">
            <div className="candidate-list-title">
              <h5 className="mb-0 text-center">
                <a
                  href={`/user/${params.user.username}`}
                  style={{ fontSize: "1.05rem", color: "#270000" }}
                >
                  {params.user.username}
                </a>
              </h5>
            </div>
          </div>
        </div>
      </td>
      <td>{params.user.xp}</td>
      <td className="action text-right">{level}</td>
    </tr>
  );
}
