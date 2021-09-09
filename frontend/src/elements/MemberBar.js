import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../context/AuthProvider";
// import "../css_files/MemberBar.css";
// import styles from "./../css_files/MemberBar.css"
import axios from "axios";
import { useHistory } from "react-router";

import React from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

import Badge from "@material-ui/core/Badge";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";

import AccountCircle from "@material-ui/icons/AccountCircle";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MoreIcon from "@material-ui/icons/MoreVert";
import UserNotLogged from "./UserNotLogged";
import MainMenu from "./MainMenu";
import Router from "next/router";
import getConfig from "next/config";
import { socket } from "../../pages/_app";
import NotifElm from "./NotifElm";
const { publicRuntimeConfig } = getConfig();

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

function MemberBar() {
  const [Draw, setDraw] = useState(false);
  const [items, SetItems] = useState([]);
  const history = useHistory();
  const { user, setUser } = useContext(userContext);
  const [notif, setNotif] = useState({
    num: 0,
    req: [],
  });
  const [notifelm, setNotifElm] = useState(false);

  useEffect(() => {
    socket.on("challenge", (r) => {
      if (r.data.player2 === user.user) {
        let req = notif.req;
        req.push(r.data);
        setNotif(false);
        setNotif({
          num: req.length,
          req,
        });
      }
    });
  }, []);

  function HandleSearch(string) {
  }

  function handleOnSelect(item) {
    let v = item;
    Router.push(`/${v.type}/${v.username}`);
  }

  async function ClickHandle() {
    try {
      const val = await axios.get(publicRuntimeConfig.BACKEND_URL + "/search");
      SetItems(val.data);
    } catch (error) {
      SetItems({
        id: -1,
        name: "error",
        type: "error",
      });
    }
  }

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = (e) => {
    setAnchorEl(null);
    handleMobileMenuClose();
    if (e.target.id && e.target.id === "#") Router.push(`/user/${user.user}`);
    if (e.target.id) Router.push(e.target.id);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem id="#" onClick={handleMenuClose}>
        {user.user}
      </MenuItem>
      <MenuItem id="/member" onClick={handleMenuClose}>
        Member Page
      </MenuItem>
      <MenuItem id="/friends" onClick={handleMenuClose}>
        Friends
      </MenuItem>
      <MenuItem id="/settings" onClick={handleMenuClose}>
        Settings
      </MenuItem>
      <MenuItem id="/logout" onClick={handleMenuClose}>
        Logout
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={0} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge
            badgeContent={notif.num}
            color="secondary"
            onClick={() => {
              setNotifElm(!notifelm);
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  function MenuShow(event) {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    if (!Draw) setDraw(true);
    else setDraw(false);
  }
  return (
    <div>
      {!user.isLoading && user.isLoggedIn ? (
        <div className={classes.grow}>
          {Draw ? <MainMenu fun={setDraw}></MainMenu> : null}
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="open drawer"
                onClick={MenuShow}
              >
                <MenuIcon />
              </IconButton>
              <Typography className={classes.title} variant="h6" noWrap>
                Transcendence
              </Typography>
              <div className={classes.search}>
                <div className="search" onClick={ClickHandle}>
                  <ReactSearchAutocomplete
                    className="SearchDrop"
                    items={items}
                    onSearch={HandleSearch}
                    onSelect={handleOnSelect}
                  />
                </div>
              </div>
              <div className={classes.grow} />
              <div className={classes.sectionDesktop}>
                <IconButton aria-label="show 4 new mails" color="inherit">
                  <Badge
                    badgeContent={0}
                    color="secondary"
                    onClick={() => {
                      Router.push("/messages");
                    }}
                  >
                    <MailIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  aria-label="show 17 new notifications"
                  color="inherit"
                >
                  <Badge
                    badgeContent={notif.num}
                    color="secondary"
                    onClick={() => {
                      setNotifElm(!notifelm);
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </div>
              <div className={classes.sectionMobile}>
                <IconButton
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          {renderMobileMenu}
          {renderMenu}
          {notifelm ? (
            <div
              className="card text-black text-center"
              style={{
                position: "absolute",
                top: "8%",
                left: "69%",
                background: "#CDCDCD",
                width: "30%",
                border: "round",
                borderRadius: "0.6rem",
                zIndex: "999",
              }}
            >
              <div>Notification</div>
              {notif.req
                ? notif.req.map((elm) => {
                    return (
                      <NotifElm
                        elm={elm}
                        notif={notif}
                        click={setNotifElm}
                        action={setNotif}
                        value={notif}
                      ></NotifElm>
                    );
                  })
                : null}
            </div>
          ) : null}
        </div>
      ) : !user.isLoading ? (
        <UserNotLogged />
      ) : null}
    </div>
  );
}

export default MemberBar;
