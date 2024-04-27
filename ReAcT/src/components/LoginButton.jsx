import React, {Suspense} from 'react';
import { useState, useEffect } from 'react';

import { Button, Spinner } from '@radix-ui/themes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import axios from 'axios';

function LoginButton(props)
{
    const [insideButton, setInsideButton] = useState(<></>);
    const [loginState, setLoginState] = useState(0);

    async function handleLogin()
    {
        if(loginState === 0)
        {
            setLoginState(1);
            axios.get(props.which ? "localhost:3002/auth/yt/generate" : "localhost:3002/auth/s/generate")
            .then(async function(response)
            {
                console.log(response.data);
                if(response.status === 200) window.open(response.data, "_blank");
            });
        }
    }
    
    useEffect(function()
    {
        let interval;
        switch(loginState)
        {
            case 0:
                setInsideButton( <div><FontAwesomeIcon icon={"fa-brands " + (props.which ? "fa-youtube" : "fa-spotify")} /> {props.which ? "LOGIN YOUTUBE" : "LOGIN SPOTIFY"}</div> );
                break;
            case 1:
                if(props.which) interval = setInterval(async function()
                    {
                        const response = await axios.get("localhost:3002/auth/confirm");
                        if(response.status === 204) setLoginState(2);
                    },1000);
                setInsideButton(<Spinner/>);
                break;
            default:
                if(props.which) clearInterval(interval);
                setInsideButton(<FontAwesomeIcon icon="fa-solid fa-check" />);
        }
    },[loginState])

    return(
        <Suspense fallback={<Spinner />}>
            {
            props.which ?
                <Button onClick={handleLogin} disabled={loginState === 2} color='red'>
                    {insideButton}
                </Button>
            :
                <Button onClick={handleLogin} disabled={loginState === 2} color='green'>
                    {insideButton}
                </Button>
            }
        </Suspense>
    )
}

export default LoginButton;
