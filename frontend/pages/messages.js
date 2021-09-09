import { useContext } from 'react';
import { userContext } from '../src/context/AuthProvider';
import MessagesScreen from './../src/screens/MessagesScreen'
import UserNotLogged from "./../src/elements/UserNotLogged";
import FactorScreen from "./../src/screens/FactorScreen";

export default function messages()
{
    const { user } = useContext(userContext);
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <MessagesScreen></MessagesScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
    return (<>
   
    </>);
}