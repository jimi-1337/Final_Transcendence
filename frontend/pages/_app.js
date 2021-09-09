
/* CSS Files */
import "./App.css";
import "./../src/css_files/CenterForm.css";
import "./../src/css_files/GameScreen.css";
import "./../src/css_files/MatchScreen.css";
import "./../src/css_files/ChangeName.css";
import "./../src/css_files/ImageCanvas.css";
import "./../src/css_files/MemberBar.css";
import "./../src/css_files/UserProfile.css";
import "./../src/css_files/ChannlesScreen.css";
import "./../src/css_files/Login.css";
import "./../src/css_files/MemberScreen.css";
import "./../src/css_files/DeleteAccount.css";
import "./../src/css_files/LoginBar.css";
import "./../src/css_files/FriendsScreen.css";
import "./../src/css_files/MainMenu.css";
import "./../src/css_files/SettingsScreen.css";
import "./../src/css_files/NewUser.css";
import "./../src/css_files/MessagesScreen.css";

import Head from "next/head";
import Navbar from "../src/elements/navbar";
import { createMemoryHistory } from "history";
import { useEffect, useState } from "react";
import { userContext } from "../src/context/AuthProvider";
import { auth } from "../src/functions/auth";
import io from "socket.io-client";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export const socket = io(publicRuntimeConfig.BACKEND_URL);

const history = createMemoryHistory();

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({
    isLoading: true,
    isLoggedIn: false,
    user: undefined,
    token: undefined,
    avatar: undefined,
    auth: false,
    socket,
  });

  useEffect(async () => {
    setUser(await auth());
  }, []);
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
          integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
          crossorigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
          integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU"
          crossorigin="anonymous"
        />
        <link
          href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css"
          rel="stylesheet"
        />
        <script
          src="https://kit.fontawesome.com/4614c527da.js"
          crossorigin="anonymous"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4"
          crossorigin="anonymous"
        ></script>
      </Head>
      <userContext.Provider value={{ user, setUser }}>
        <div>
          <Navbar />
          <Component {...pageProps} />
        </div>
      </userContext.Provider>
    </>
  );
}

export default MyApp;
