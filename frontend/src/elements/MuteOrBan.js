import axios from "axios";
import { useState } from "react";
import { Col } from "react-bootstrap";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export default function MuteOrBan(params) {
  const [mute, setMute] = useState(false);
  async function BanUser() {
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/channel/ban", {
        data: {
          username: params.user,
          name: params.channel,
        },
      });
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: `User Didn't Get Banned, Try Again Later`,
        });
        return params.action({
          type: "alert-success",
          message: `User Is Banned Successfully`,
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  async function MuteUser(value) {
    var ts = Math.round(new Date().getTime() / 1000) + value * 60;
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/channel/mute", {
        data: {
          name: params.channel,
          username: params.user,
          release: ts,
        },
      });
      if (!val || val.data.id < 0)
        return params.action({
          type: "alert-danger",
          message: `User Didn't Get Muted, Try Again Later(${value} M)`,
        });
      return params.action({
        type: "alert-success",
        message: `User ${params.user} is muted for ${value} minutes`,
      });
    } catch (error) {
      console.log(error.message);
      return params.action({
        type: "alert-danger",
        message: `User Didn't Get Muted, Try Again Later(${value} M)`,
      });
    }
  }

  return (
    <Col>
      {" "}
      <i className="fas fa-ban fa-xs" onClick={BanUser}></i>
      <br></br>
      <div>
        <div style={{ display: "inline" }}>
          <i className="fas fa-volume-mute fa-xs"></i>

          <div
            className="ml-1"
            style={{ fontSize: "0.7rem", display: "inline", cursor: "pointer" }}
            onClick={() => {
              MuteUser(1);
            }}
          >
            {" "}
            1 -{" "}
          </div>
          <div
            style={{ fontSize: "0.7rem", display: "inline", cursor: "pointer" }}
            onClick={() => {
              MuteUser(5);
            }}
          >
            5 -{" "}
          </div>
          <div
            style={{ fontSize: "0.7rem", display: "inline", cursor: "pointer" }}
            onClick={() => {
              MuteUser(10);
            }}
          >
            10
          </div>
        </div>
      </div>
    </Col>
  );
}
