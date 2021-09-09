import Head from "next/head";
import Router from "next/router";
import { useContext, useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import { userContext } from "../context/AuthProvider";

export default function LogoutScreen() {
  const { user, setUser } = useContext(userContext);
  useEffect(() => {
    localStorage.removeItem("auth_key");
    setUser({
      isLoading: false,
      isLoggedIn: false,
      user: undefined,
      token: undefined,
      avatar: undefined,
    });
    Router.push("/");
  }, []);
  return <div>
    <Head>
      <title>
        Logout
      </title>
    </Head>
  </div>;
}
