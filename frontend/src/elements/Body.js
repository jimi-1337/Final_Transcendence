import Footer from "./Footer";

import styles from "./../css_files/main.module.css";
import { userContext } from "../context/AuthProvider";
import { useContext, useEffect } from "react";
import Router from "next/router";

function Body() {
  const { user } = useContext(userContext);
  useEffect(() => {
    if (!user.isLoading && (user.isLoggedIn || user.auth))
      Router.push("/member");
  }, [user.isLoading]);

  return (
    <div>
      {!user.isLoading && !user.isLoggedIn && !user.auth ? (
        <div>
          <main
            className={
              "container-fluid px-3 " + styles.showcase + " " + styles.banner
            }
          >
            <div className="container">
              <h1 style={{color:"#f4f4f4"}} className={styles.over}>ft_transcendence.</h1>
              <p className="lead" style={{color:"#f4f4f4"}}>
                {" "}
                In this subject you will need to build a website for the mighty
                pong contest. Your website will help user run pong tournament
                and play against each other. There will be an admin view, chat
                with moderators, real time multiplayer online games. There will
                be guilds and wars!
              </p>
              <p className="lead">
                <a
                  href="#main-header"
                  className="btn btn-lg text-white btn-secondary fw-bold border-danger bg-danger"
                >
                  About_Project
                </a>
              </p>
            </div>
          </main>

          <div style={{backgroundColor:"#b4b4b4"}}>
            <header id="main-header">
              <div className={styles.contwrap}>
                <h1>
                  <i className="fas fa-brain"></i> About Project
                </h1>
                <h3>
                  <i className="fas fa-user"></i> M,A / Ayoub
                </h3>
              </div>
            </header>
            <div className="container py-5">
              <div className="row">
                <div className="col-md-12">
                  <div className={styles.maintimeline}>
                    <div className={styles.timeline}>
                      <a href="#" className={styles.timelinecontent}>
                        <div className={styles.timelineicon}>
                          <i className="fa fa-globe"></i>
                        </div>
                        <h3 className="title" style={{wordWrap: "break-word"}}>Client Side</h3>
                        <p className="description">
                          The frontend was coded using NextJS, Next.js is an open-source development framework built on top of Node.js enabling React based web applications functionalities such as server-side rendering and generating static websites. React documentation mentions Next.js among "Recommended Toolchains" advising it to developers as a solution when "building a server-rendered website with Node.js".[4] Traditional React apps render all their content in the client-side browser, Next.js is used to extend this functionality to include applications rendered on the server side.
                        </p>
                      </a>
                    </div>
                    <div className={styles.timeline}>
                      <a href="#" className={styles.timelinecontent}>
                        <div className={styles.timelineicon}>
                          <i className="fa fa-rocket"></i>
                        </div>
                        <h3 className="title" style={{wordWrap: "break-word"}}>Server Side</h3>
                        <p className="description">
                        The backend was coded using NestJS, Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

Under the hood, Nest makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well!
                        </p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      ) : null}
    </div>
  );
}

export default Body;
