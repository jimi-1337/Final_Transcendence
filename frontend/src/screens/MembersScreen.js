import { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router";
import UserNotLogged from "../elements/UserNotLogged";
import FactorScreen from "./FactorScreen";
import { userContext } from "../context/AuthProvider";
// import "../css_files/MemberScreen.css"
import axios from "axios";
import getConfig from "next/config";
import { Col, Row } from "react-bootstrap";
import Router from "next/router";
const { publicRuntimeConfig } = getConfig();
import Head from 'next/head'
// import style from './../css_files/LiveScreen.css'

export default function MembersScreen() {
  const { user } = useContext(userContext);
  const [games, setGames] = useState(false);
  const [currentgame, setCurrentGame] = useState(false);

  async function GetGames() {
    try {
      const val = await axios.get(
        publicRuntimeConfig.BACKEND_URL + "/live_game"
      );
      if (!val || val.data.id < 0) return;
      setGames(val.data.games);
      if (val.data.games.length >= 1)
        setCurrentGame(`/game/${val.data.games[0].gameId}`);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    GetGames();
  }, []);
  return (
    <>
    <Head>
      <title>Member Page</title>
    </Head>
      <div className="container text-black main-body text-center">
        <h3>Now Playing</h3>
        <div
          className="GameFrame text-center"
          style={{
            marginRight: "3rem",
            position: "relative",
            overflow: "hidden",
            height: "20rem",
            width: "30rem",
          }}
        >
          {currentgame ? (
            <p
              align="center"
              style={{
                position: "absolute",
                paddingRight: "1rem",
              }}
            >
              <Col>
                <i
                  className="fas fa-expand-arrows-alt"
                  style={{
                    position: "absolute",
                    left: "1.1rem",
                    top: "1rem",
                  }}
                  onClick={() => {
                    Router.push(currentgame);
                  }}
                ></i>
              </Col>
              <iframe
                src={currentgame}
                title="description"
                style={{
                  position: "absolute",
                  left: "2rem",
                  top: "-6rem",
                  width: "30rem",
                  height: "50rem",
                  display: "block",
                }}
              ></iframe>
            </p>
          ) : (
            <div style={{ width: "30rem", height: "50rem", margin: "auto" }}>
              {" "}
            </div>
          )}
        </div>
        <div className="SmallMessage">
          <p>Can't Display Game On This Screen Size</p>
        </div>
        {games ? (
          <div>
            Other Live Games
            <div>
              {games.map((g) => {
                return (
                  <Row>
                    <div
                      className="btn"
                      onClick={() => {
                        setCurrentGame(`/game/${g.gameId}`);
                      }}
                    >
                      <div className="card text-center my-2">
                        <p
                          style={{
                            margin: "0",
                            padding: "0.7rem",
                            fontSize: "1.5rem",
                          }}
                        >
                          <Row className="text-center">
                            <Col>{g.p1}</Col>
                            <Col
                              style={{ color: "#17a2b8", fontWeight: "bolder" }}
                            >
                              VS
                            </Col>
                            <Col>{g.p2}</Col>
                          </Row>
                        </p>
                      </div>
                    </div>
                  </Row>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
