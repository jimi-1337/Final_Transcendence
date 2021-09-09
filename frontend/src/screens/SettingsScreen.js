import { useContext, useState, useRef } from "react";
import UserNotLogged from "../elements/UserNotLogged";
import { userContext } from "../context/AuthProvider";
import ChangePhoto from "../settings/ChangePhoto";
import ChangePassword from "../settings/ChangePassword";
import ChangeDisplayName from "../settings/ChangeDisplayName";
import DeleteAccount from "../settings/DeleteAccount";
import ChangeTitle from "../settings/ChangeTitle";
import FactorAuth from "../settings/FactorAuth";
import FactorScreen from "./FactorScreen";
import Head from "next/head";



export default function SettignsScreen() {
  const { user } = useContext(userContext);
  const { click } = useRef(false);

  const [sel, setSel] = useState({
    first: "active",
    second: "",
    third: "",
    forth: "",
    fifth: "",
    sixth: "",
    seventh: "",
  });

  function ChangeActive(e) {
    if (e.target.id === "1") setSel({ first: "active" });
    if (e.target.id === "2") setSel({ second: "active" });
    if (e.target.id === "3") setSel({ third: "active" });
    if (e.target.id === "4") setSel({ forth: "active" });
    if (e.target.id === "5") setSel({ fifth: "active" });
    if (e.target.id === "6") setSel({ sixth: "active" });
    if (e.target.id === "7") setSel({ seventh: "active" });
  }
  return (
    <div className="container light-style flex-grow-1 container-p-y">
     <Head>
       <title>
         Settings
       </title>
       </Head>
      <h4 className="font-weight-bold py-3 mb-4 text-black">Account settings</h4>

      <div className="card overflow-hidden">
        <div className="row no-gutters row-bordered row-border-light">
          <div className="col-md-3 pt-0">
            <div className="list-group list-group-flush account-settings-links">
              <a
                className={`list-group-item list-group-item-action ${sel.first}`}
                data-toggle="list"
                href="#ChangeAvatar"
                onClick={ChangeActive}
                ref={click}
                id="1"
              >
                Change Avatar
              </a>
              <a
                className={`list-group-item list-group-item-action ${sel.second}`}
                data-toggle="list"
                href="#ChangePassword"
                onClick={ChangeActive}
                ref={click}
                id="2"
              >
                Change password
              </a>
              <a
                className={`list-group-item list-group-item-action ${sel.third}`}
                data-toggle="list"
                href="#DisplayName"
                onClick={ChangeActive}
                ref={click}
                id="3"
              >
                Change Display Name
              </a>

              <a
                className={`list-group-item list-group-item-action ${sel.seventh}`}
                data-toggle="list"
                href="#DisplayName"
                onClick={ChangeActive}
                ref={click}
                id="7"
              >
                Change My Title
              </a>

              <a
                className={`list-group-item list-group-item-action ${sel.forth}`}
                data-toggle="list"
                href="#FatcoyAuthentication"
                onClick={ChangeActive}
                ref={click}
                id="4"
              >
                Factor Authentication
              </a>
              <a
                className={`list-group-item list-group-item-action DeleteButton`}
                data-toggle="list"
                href="#delete"
                onClick={ChangeActive}
                ref={click}
                id="6"
              >
                Delete My Account
              </a>
            </div>
          </div>
          <div className="col-md-9">
            <div className="tab-content">
              {sel.first ? <ChangePhoto /> : null}
              {sel.second ? <ChangePassword /> : null}
              {sel.third ? <ChangeDisplayName /> : null}
              {sel.forth ? <FactorAuth /> : null}
              {sel.sixth ? <DeleteAccount /> : null}
              {sel.seventh ? <ChangeTitle /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
