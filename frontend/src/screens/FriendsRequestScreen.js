import axios from "axios";
import { useContext, useState } from "react";
import FriendRequestElement from "../elements/FriendRequestElement";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
// import "./../css_files/FriendsScreen.css";
import FactorScreen from "./FactorScreen";
import getConfig from "next/config";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();

export default function FriendsRequestScreen() {
  const { user } = useContext(userContext);
  const [friends, setFriends] = useState(false);

  async function GetFriendsRequest() {
    try {
      const val = await axios.get(
        publicRuntimeConfig.BACKEND_URL + `/${user.user}/friendsrequest`
      );
      if (!val || val.data.id <= 0) return;
      if (!val.data) return;
      setFriends(val.data);
    } catch (error) {
      console.log(error.message);
    }
  }

  function Reload() {
    setFriends(false);
  }

  if (!friends) GetFriendsRequest();
  return (
    <div className="container py-4">
      <Head>
        <title>
          Friends Requests
        </title>
      </Head>
      <div className="row my-2">
        {!friends || friends.length == 0
          ? <div className="text-center"> No friend requests at the moment (try to go out more)</div>
          : friends.map((f) => {
              return (
                <FriendRequestElement
                  user={f}
                  v={user.user}
                  fun={Reload}
                ></FriendRequestElement>
              );
            })}
      </div>
    </div>
  );
}
