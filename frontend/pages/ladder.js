import { useContext } from "react";
import { userContext } from "../src/context/AuthProvider";
import LadderScreen from "../src/screens/LadderScreen";
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";
export default function ladder()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <LadderScreen></LadderScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
} 