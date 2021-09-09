import { useRouter } from "next/dist/client/router"
import { useContext } from "react";
import { userContext } from "../../src/context/AuthProvider";
import Router from 'next/router'
import UserProfileScreen from "../../src/screens/UserProfileScreen";
import UserNotLogged from "../../src/elements/UserNotLogged";
import FactorScreen from "../../src/screens/FactorScreen";

export default function Com ()
{
    const router = useRouter();
    const {user, setUser} = useContext(userContext)
    const slug = router.query.slug
    let username;
    if (slug)
        username = slug[0];
    if (slug?.length > 1 && user.user)
        Router.push(`/user/${user.user}`)
    if (username)
    return (!user.isLoading ? (
        user.isLoggedIn ? (
            <UserProfileScreen user={username}></UserProfileScreen>
        ) : !user.isLoggedIn && user.auth ? (
          <FactorScreen></FactorScreen>
        ) : !user.isLoggedIn ? (
          <UserNotLogged />
        ) : null
      ) : null);
        return <div></div>
}