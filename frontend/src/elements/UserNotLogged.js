import  Router  from "next/router";
import { useEffect } from "react";
import { Redirect } from "react-router";


function UserNotLogged() {
      useEffect(() => {
    Router.push("/login");
  }, []);
    return (
        <div/>
    )    
}

export default UserNotLogged;