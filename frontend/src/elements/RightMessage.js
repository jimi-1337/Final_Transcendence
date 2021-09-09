import { useEffect, useState } from "react";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export default function RightMessage(m) {
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
    await get_av(m.avatar);
  }, [m.user]);
  const d = new Date(m.msg.createdAt);
  return (
    <li className="chat-right">
      <div className="chat-hour" style={{ fontSize: "0.6rem" }}>
        {d.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        })}
      </div>
      <div
        className="chat-text"
        style={{
          maxWidth: "25rem",
          padding: " .4rem 1rem",
          borderRadius: "4px",
          background: "#ffffff",
          fontWeight: "300",
          lineHeight: "150%",
          position: "relative",
          wordWrap: "break-word",
        }}
      >
        {m.msg.message}
      </div>
      <div className="chat-avatar">
        <img src={avatar} alt={m.user} />
        <div className="chat-name">{m.user}</div>
      </div>
    </li>
  );
}
