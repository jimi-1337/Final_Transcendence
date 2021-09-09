import { useContext } from 'react';
import { userContext } from '../src/context/AuthProvider';
import FriendsRequestScreen from './../src/screens/FriendsRequestScreen'
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";

export default function friends_request()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <FriendsRequestScreen></FriendsRequestScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
}