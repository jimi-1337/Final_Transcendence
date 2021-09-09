// import "./../css_files/MainMenu.css";
import React, { useContext } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import { useHistory } from "react-router";
import {userContext} from '../context/AuthProvider';
import Router from "next/router";


const useStyles = makeStyles({
  list: {
    width: 250,
    paddingTop: "0.2rem",
  },
});

export default function MainMenu(params) {
  let anchor = "left";
  const { user } = useContext(userContext);
  const history = useHistory();
  const classes = useStyles();
  const [state, setState] = React.useState({
    left: true,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
    if (!open) params.fun(false);
  };

  const paths = {
    ["New Match"]: { path: `/match`, icon: `fas fa-table-tennis` },
    ["My Profile"]: { path: `/user/${user.user}`, icon: "fas fa-user" },
    ["Channels"]: { path: `/channels`, icon: "fas fa-mail-bulk" },
    ["Ladder"]: { path: `/ladder`, icon: "fas fa-medal" },
    ["Friends Request"]: { path: `/friends_request`, icon: "fas fa-user-friends" },
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list)}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {["New Match",  "My Profile", "Channels", "Ladder", "Friends Request"].map(
          (text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                <i className={paths[text].icon}></i>
              </ListItemIcon>
              <ListItemText
                primary={text}
                onClick={() => {
                  Router.push(paths[text].path);
                }}
              />
            </ListItem>
          )
        )}
      </List>
    </div>
  );

  return (
    <div>
      {
        <React.Fragment key={anchor}>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      }
    </div>
  );
}
