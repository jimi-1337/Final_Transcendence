import { useContext } from 'react';
import { userContext } from '../src/context/AuthProvider';
import MembersScreen from './../src/screens/MembersScreen'
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";

export default function member()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <MembersScreen></MembersScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
}