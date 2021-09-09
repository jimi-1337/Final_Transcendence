import  Router  from "next/router";
import { useContext, useEffect } from "react";
import { userContext } from "../src/context/AuthProvider";
import LoginScreen from "../src/screens/LoginScreen";

function Login()
{
  const {user} = useContext(userContext)
  useEffect(()=>{
    if (!user.isLoading && (user.isLoggedIn || user.auth))
      Router.push('/member')
  },[user.isLoading])
  return   <>
  {!user.isLoading && !user.isLoggedIn && !user.auth ? <LoginScreen></LoginScreen> : null}
  
</>
}

export default Login;
