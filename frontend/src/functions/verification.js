import { useHistory } from "react-router";
import { Redirect } from "react-router-dom";
import Router from "next/router";

export function VerificationScreen(props)
{
    const history = useHistory();
    if (props.location.state.data.message)
        Router.push("/member");
    else
        Router.push("/new-account");
    return (<div></div>)
}