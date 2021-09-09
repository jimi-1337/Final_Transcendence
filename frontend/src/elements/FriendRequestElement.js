import axios from "axios";
import { useState } from "react";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


export default function FriendRequestElement(props) {
  const [avatar, setAvatar] = useState(false);
  let r;

  if (props.v === props.user.user1)
    r = {
      user: props.user.user2,
      avatar: props.user.avatar2,
      status: true,
    };
  else
    r = {
      user: props.user.user1,
      avatar: props.user.avatar1,
      status: false,
    };
  function get_av(s) {
    try {
      const p = s.split("/uploads/")[1];
      if (!p) {
        setAvatar(s);
        return s;
      }
      const path =publicRuntimeConfig.BACKEND_URL +  "/uploads/" + p;
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

  async function AcceptRequest()
  {
    try {
      const val = await axios.post(publicRuntimeConfig.BACKEND_URL+ "/accept_friend", {
        data:{
          id: props.user.id,
        }
      })
      if (!val || val.data.id <= 0)
        return ;
      props.fun();
    } catch (error) {
      console.log(error.message)
    }
  }

  async function DeleteRequest() {
    try {
      const val = await axios.delete(publicRuntimeConfig.BACKEND_URL+ "/delete_friends_request", {
        data:
        {
          id: props.user.id
        }
      });
      if (!val || val.data.id < 0)
        return ;
      props.fun();
    } catch (error) {
      console.log(error.message);
    }
  }
  if (!avatar) get_av(r.avatar);
  return (
    <div className="col-md-4">
      <div className="card text-center" style={{ width: "14rem" }}>
        <div className="user-heading-list round-list">
          <a href={`/user/${r.user}`}>
            <img src={avatar} className="card-img-top text-black" />
          </a>
        </div>
        <div className="card-body">
          <h5 className="card-title text-center text-black">{r.user}</h5>
          <div className="text-center">
            {!r.status ? (
              <div>
                <button className="btn btn-primary mx-1" onClick={AcceptRequest}>Accept</button>
                <button className="btn btn-primary mx-1" onClick={DeleteRequest}>Decline</button>
              </div>
            ) : (
              <button className="btn btn-primary mx-1"onClick={DeleteRequest}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
