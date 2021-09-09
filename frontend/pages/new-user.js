import { useContext } from 'react';
import { userContext } from '../src/context/AuthProvider';
import NewUserScreen from './../src/screens/NewUserScreen'
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";

export default function newuser()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <NewUserScreen></NewUserScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
}