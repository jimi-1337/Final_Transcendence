import { useRouter } from "next/dist/client/router";
import { useContext, useState } from "react";
import { userContext } from "../../src/context/AuthProvider";
import ChannelScreen from "../../src/screens/ChannelScreen";
import UserNotLogged from "../../src/elements/UserNotLogged";
import FactorScreen from "../../src/screens/FactorScreen";


export default function Com() {
  const router = useRouter();
  const { user, setUser } = useContext(userContext);
  const slug = router.query.slug;
  const [update, setUpdate] = useState(false);
  let username;
  async function reload(e) {
    setUpdate(!update);
  }
  if (slug) username = slug[0];
  if (slug?.length > 1 && user.user) Router.push(`/channels`);
  if (username) {
    return (!user.isLoading ? (
      user.isLoggedIn ? (
        <div>
        {update ? (
          <ChannelScreen
            user={username}
            reload={reload}
          ></ChannelScreen>
        ) : (
          <ChannelScreen user={username} reload={reload}></ChannelScreen>
        )}
      </div>
      ) : !user.isLoggedIn && user.auth ? (
        <FactorScreen></FactorScreen>
      ) : !user.isLoggedIn ? (
        <UserNotLogged />
      ) : null
    ) : null);
  }
  return <div></div>;
}
