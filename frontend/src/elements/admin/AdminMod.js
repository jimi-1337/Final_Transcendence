import axios from "axios";
import { useEffect, useState } from "react";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import UserBar from "./UserBar";
import LoginBar from "../LoginBar";
import ModBar from "./ModBar";

export default function AdminMod() {
  const [ale, setAle] = useState({
    type: "",
    message: "",
  });
  const [users, setUsers] = useState(false);
  useEffect(async () => {
    try {
      const val = await axios.get(publicRuntimeConfig.BACKEND_URL + "/search/mod");
      setUsers(val.data);
    } catch (error) {
      console.log(error.message);
    }
  }, [users]);
  return (
    <div className="content-wrapper">
      {ale.type.length ? (
        <LoginBar type={ale.type} message={ale.message}></LoginBar>
      ) : null}
      <div
        className="row"
        style={{
          border: "0.1rem solid",
          borderRadius: "1rem",
          background: "#f4f5fa !important",
        }}
      >
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
          <div className="card m-0" style={{ border: "none" }}>
            <div
              className="users-container"
              style={{ border: "none", background: "#f4f5fa !important" }}
            >
              <ul className="users">
                {users
                  ? users.map((u) => {
                      if (u.name.search("User") >= 0)
                        return <ModBar user={u} action={setAle} users={setUsers}></ModBar>;
                    })
                  : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
