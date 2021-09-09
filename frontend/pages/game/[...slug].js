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
    const f = async () => {
      try {
        if (gameId) {
          const val = await axios.get(
            publicRuntimeConfig.BACKEND_URL + `/game/${gameId}`
          );
          if (!val || val.data.id <= 0) return Router.push(`/member`);
          setLoad(true);
          setInfo(val.data);
          if (val.data.winner.length > 0) setEndGame(true);
        }
      } catch (error) {
        console.log(error.message);
        return Router.push(`/member`);
      }
    };
    f();
  }, [gameId, end_game]);
  if (gameId) {
    return (
      <div>
        {load && info ? (
          !end_game ? (
            <GameScreen
              data={info}
              gameId={gameId}
              endgame={setEndGame}
            ></GameScreen>
          ) : (
            <div>
              <h3 className="text-center" style={{ marginTop: "5rem" }}>
                Game Ended
              </h3>
              <Row className="text-center" style={{ marginTop: "8rem" }}>
                <div>({info.type})</div>
                <Col xs={4}>{info.player1} (P1)</Col>
                <Col xs={4}> VS </Col>
                <Col xs={4}>{info.player2} (P2)</Col>
                <br></br>
                <div style={{ color: "green", marginTop: "2.4rem" }}>
                  {" "}
                  Winner ({info.winner})
                </div>
              </Row>
            </div>
          )
        ) : null}
      </div>
    );
  }
  return <div></div>;
}
