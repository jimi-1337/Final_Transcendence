import { useEffect } from "react"
import { Router } from "react-router"

export default function GameRedirect(params)
{
    useEffect(()=>{
        Router.push(`game/${params.gameId}`)
    }, [])
    return (<div>
    </div>)
}