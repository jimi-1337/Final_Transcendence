import axios from "axios";
import getConfig from "next/config";
import { socket } from "../../pages/_app";
const { publicRuntimeConfig } = getConfig();

export async function auth(props) {
  const token = await localStorage.getItem("auth_key");
  if (!token)
    return {
      isLoading: false,
      isLoggedIn: false,
      user: undefined,
      token: undefined,
    };
  try {
    const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/access", {
      data: {
        token,
        red: props,
      },
    });
    if (val.data.id === -1)
      return {
        isLoading: false,
        isLoggedIn: false,
        user: undefined,
        token: undefined,
      };
    socket.emit("init_user", { data: { username: val.data.user } });
    return {
      isLoading: false,
      isLoggedIn: val.data.user_logged,
      user: val.data.user,
      token: token,
      avatar: val.data.avatar,
      xp: val.data.xp,
      auth: val.data.auth,
    };
  } catch (error) {
    console.log(error.message)
    return {
      isLoading: false,
      isLoggedIn: false,
      user: undefined,
      token: undefined,
    };
  }
}
