import axios from "axios";
import { useEffect, useState } from "react";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import UserLadder from "./../elements/UserLadder";
import Head from "next/head";
function sort_by_key(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? 1 : x > y ? -1 : 0;
  });
}

export default function LadderScreen() {
  const [users, setUsers] = useState(false);
  useEffect(async () => {
    let v = [];
    try {
      const val = await axios.get(publicRuntimeConfig.BACKEND_URL + "/search");
      if (!val || val.data.id <= 0) return;
      v = val.data;
      v = sort_by_key(v, "xp");
      setUsers(v);
    } catch (error) {
      console.log(error.message);
    }
  }, []);
  let v = 0;
  return (
    <div className="text-center" style={{ width: "100%", margin: "auto" }}>
      <Head>
        <title>
          Ladder
        </title>
      </Head>
      {users ? (
        <div className="container mt-3 mb-4">
          <div className="mt-4 mt-lg-0">
            <div className="row">
              <div className="col-md-12">
                <div
                  className="user-dashboard-info-box table-responsive mb-0 bg-white p-4 shadow-sm"
                  style={{ overflowX: "hidden" }}
                >
                  <table className="table manage-candidates-top mb-0">
                    <thead>
                      <tr>
                        <th className="text-center"> Ranking</th>
                        <th className="text-center"> Player Name</th>
                        <th className="text-center">XP</th>
                        <th className="action text-right">Level</th>
                      </tr>
                    </thead>
                    {users.map((u) => {
                      v++;
                      if (u.name.search("User") >= 0)
                        return <UserLadder user={u} v={v}></UserLadder>;
                    })}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
