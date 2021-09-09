import { useEffect, useState } from "react";
// import "./../css_files/LoginBar.css";

export default function LoginBar(props) {
  const [timeout, setT] = useState(false);

  useEffect(() => {
    setT(false);
    setTimeout(() => {
      setT(true);
    }, 5000);
  }, [props]);

  return (
    <div>
      {!timeout ? (
        <div
          className={`alert ` + props.type + " LoginBar text-center"}
          role="alert"
        >
          {props.message}
        </div>
      ) : null}
    </div>
  );
}
