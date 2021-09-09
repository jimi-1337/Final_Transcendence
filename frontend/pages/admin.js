import AdminScreen from "../src/screens/AdminScreen";
// import { userContext } from "../../context/AuthProvider";
import { useContext } from "react";
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";
import { userContext } from "../src/context/AuthProvider";

export default function admin()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <AdminScreen></AdminScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
    
}