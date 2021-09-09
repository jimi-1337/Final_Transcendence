import { useContext} from "react";
// import "../../pages/Main.css"
import MemberBar from "./MemberBar";
import { userContext } from "../context/AuthProvider";


function Navbar(params) {

  const {user} = useContext(userContext)
  return (
    <div>
      {(user &&!user?.isLoading && user?.isLoggedIn) ? <MemberBar />:  (!user?.isLoading) ? <nav className="navbar navbar-expand-lg navbar-dark bg-dark position">
        <div className="container">
          <a className="navbar-brand" href="/">
            1337
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#main-header">
                  Project
                </a>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  id="navbarDropdown"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </a>
                <ul className="dropdown-menu bg-dark">
                  <li>
                    <a className="dropdown-item text-light" href="/login">
                      Login
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item text-light" href="/register">
                      Register
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav> : null} 
     
    </div>
  );
}
export default Navbar;