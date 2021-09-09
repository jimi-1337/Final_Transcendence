import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControlLabel,
  FormGroup,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useRef, useState } from "react";
import MuiAlert from "@material-ui/lab/Alert";
import { Button, Container, FormControl, PageItem, Row } from "react-bootstrap";
import AddIcon from "@material-ui/icons/Add";
import Switch from "@material-ui/core/Switch";
import axios from "axios";
import { userContext } from "../context/AuthProvider";
import { useHistory } from "react-router";
import Router from "next/router";
import getConfig from "next/config";
import LoginBar from "../elements/LoginBar";
import Head from "next/head";
const { publicRuntimeConfig } = getConfig();

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ChannelsScreen() {
  const classes = useStyles();

  const [prv, setPrv] = useState(false);
  const [open, setNewChannel] = useState(false);
  const [e_inside, setE_inside] = useState(false);
  const [s_inside, setS_inside] = useState(false);
  const [nm, setnm] = useState(false);
  const [p, setp] = useState(false);
  const [pg, setpg] = useState(false);
  const [g_channel, setgchannel] = useState(false);
  const [passError, setpassError] = useState({
    error: false,
    message: "",
  });
  const [newChannel, setChannelName] = useState({
    error: false,
    message: "",
  });
  const [channels, setChannels] = useState([]);

  const { user, setUser } = useContext(userContext);

  const ChannelName = useRef();
  const history = useHistory();

  function ChangePrv() {
    if (!prv) return setPrv(true);
    else return setPrv(false);
  }

  async function handleCreate() {
    setChannelName({
      error: false,
      message: "",
    });
    setpassError({
      error: false,
      message: "",
    });
    if (!nm || /\s/.test(nm) || nm.includes("*"))
      return setChannelName({
        error: true,
        message: "Incorrect entry.",
      });
    if (prv && (!p || p != pg || p.length < 5))
      return setpassError({
        error: true,
        message: "Password didn't match or short (less than 5 characters).",
      });
    try {
      const val = await axios.post(
        publicRuntimeConfig.BACKEND_URL + "/create_channel",
        {
          data: {
            username: user.user,
            channelname: nm,
            password: p,
            passwordg: pg,
            p_ex: prv,
          },
        }
      );
      if (val.data.id <= 0) {
        setE_inside(true);
      } else {
        setNewChannel(false);
        setE_inside(false);
        setS_inside(true);
        setChannels([]);
        get_channels();
      }
    } catch (error) {
      console.log(error.message);
      setE_inside(true);
    }
  }

  async function get_channels() {
    setgchannel(true);
    try {
      var o;
      const val = await axios.get(
        publicRuntimeConfig.BACKEND_URL + "/channels"
      );
      if (!val) return;
      o = val.data;
      var temparray, i, j;
      var valu = [];
      for (i = 0, j = o.length; i < j; i += 3) {
        temparray = o.slice(i, i + 3);
        valu.push(temparray);
      }
      setChannels(valu);
    } catch (error) {
      console.log(error.message);
    }
  }
  function FormRow(params) {
    return (
      <React.Fragment>
        {params.channel.map((c) => {
          return (
            <Grid item xs={4}>
              <div className="btn">
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    if (c.type === "public") Router.push(`/channel/${c.name}`);
                    else Router.push(`/channel/*${c.name}`);
                  }}
                >
                  {c.name + " - " + c.type}{" "}
                </Paper>
              </div>
            </Grid>
          );
        })}
      </React.Fragment>
    );
  }

  function handleClose() {
    setNewChannel(false);
  }

  function NewClick() {
    setNewChannel(true);
  }
  if (channels.length === 0 && !g_channel) get_channels();
  return (
    <Container>
      <Head>
        <title>
          Channels
        </title>
      </Head>
      {s_inside ? (
        <LoginBar
          type="alert-success"
          message={`Channel Created Successfully`}
        ></LoginBar>
      ) : null}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        {e_inside ? (
          <LoginBar
            type="alert-danger"
            message={`An Error Occured, Try Again Later`}
          ></LoginBar>
        ) : null}
        <DialogTitle id="form-dialog-title">New Channel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To Create A New Channel, Enter The Details Below And Hit Create:
          </DialogContentText>

          <div className="text-black text-center">
            <h7>Channel Name</h7>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              onChange={(e) => {
                setnm(e.target.value);
              }}
              error={newChannel.error}
              helperText={newChannel.message}
              ref={ChannelName}
            />
          </div>

          <div className="text-black text-center">
            <h6>
              Private Channel{" "}
              <Switch
                color="primary"
                onChange={ChangePrv}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
            </h6>
          </div>
          <div>
            {prv ? (
              <div className="text-black">
                <TextField
                  autoFocus
                  margin="dense"
                  id="pass"
                  label="Enter The Channel Password"
                  type="password"
                  fullWidth
                  onChange={(e) => {
                    setp(e.target.value);
                  }}
                  error={passError.error}
                  helperText={passError.message}
                />
                <TextField
                  margin="dense"
                  id="passg"
                  label="Re-Enter Your Password"
                  type="password"
                  fullWidth
                  onChange={(e) => {
                    setpg(e.target.value);
                  }}
                  error={passError.error}
                  helperText={passError.message}
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Row className="text-center text-black Body-Marg">
        <h3>Available Channels</h3>
      </Row>
      <Row>
        <Grid container spacing={1}>
          {channels.length ? (
            <Grid container item xs={12} spacing={3}>
              {channels.map((c) => {
                return <FormRow channel={c} />;
              })}
            </Grid>
          ) : null}
        </Grid>
      </Row>
      <div className="NewChannel">
        <Fab color="primary" aria-label="add" onClick={NewClick}>
          <AddIcon />
        </Fab>
      </div>
    </Container>
  );
}
