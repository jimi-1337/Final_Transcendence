import { useRouter } from "next/dist/client/router";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../src/context/AuthProvider";
import Router from "next/router";
import GameScreen from "../../src/screens/GameScreen";
import axios from "axios";
import getConfig from "next/config";
import { Col, Row } from "react-bootstrap";
const { publicRuntimeConfig } = getConfig();

export default function Com() {
  const router = useRouter();
  const { user, setUser } = useContext(userContext);
  const slug = router.query.slug;
  const [load, setLoad] = useState(false);
  const [info, setInfo] = useState(false);
  const [end_game, setEndGame] = useState(false);
  let gameId;
  if (slug) gameId = slug[0];
  if (slug?.length > 1 && user.user) Router.push(`/member`);

  useEffect(() => {
    if (gameId) Router.push(`/game/${gameId}`);
  }, [gameId]);
  return <div></div>;
}
