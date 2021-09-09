import axios from "axios";
import { useState } from "react";
import { Col } from "react-bootstrap";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


function MatchHistory(params) {
  const [mts, setMts] = useState("No Matches To Show");
  const [run, setRun] = useState(false);
  async function get_matches() {
    setRun(true);
    try {
      const m = await axios.get(publicRuntimeConfig.BACKEND_URL + `/match/${params.username}`);
      if (!m) return;

      setMts(
        m.data.data.map((m) => {
          if (!m.player1) return;
          const p1 = m.winner == m.p1Id ? "text-winner" : null;
          const p2 = m.winner == m.p2Id ? "text-winner" : null;
          return (
            <div className="card text-center my-2">
              <h4 className="pt-1">
                Match Type: {m.type} ({m.round})
              </h4>
              <p style={{ margin: "0", padding: "0.7rem", fontSize: "1.5rem" }}>
                <Col className={p1}>{m.player1.length ? m.player1 : "USER"}</Col>
                <Col style={{ color: "#17a2b8", fontWeight: "bolder" }}>VS</Col>
                <Col className={p2}>{m.player2.length ? m.player2 : "USER"}</Col>
              </p>
              <div className="pb-1" style={{ fontSize: "0.7rem" }}>
                Reward: {m.reward}
              </div>
            </div>
          );
        })
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  if (!run) get_matches();
  return (
    <div>
      <div className="row">
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => {
            params.hFunction(false);
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div className="row">{mts}</div>
    </div>
  );
}

export default MatchHistory;
