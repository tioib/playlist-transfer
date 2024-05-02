import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner } from '@radix-ui/themes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";

function LoginButton(props)
{
    const [insideButton, setInsideButton] = useState(<></>);
    const [loginState, setLoginState] = useState(0);
    const {loginYoutube, loginSpotify, confirmed, login} = useAuth();
    const navigate = useNavigate();

    async function handleLogin()
    {
        if(loginState === 0)
        {
            setLoginState(1);
            const result = await login(props.which);
            if(result) console.log(result);
            else setLoginState(0);
        }
    }
    
    useEffect(function()
    {
        if(loginState === 0) setInsideButton( <div><FontAwesomeIcon icon={"fa-brands " + (props.which ? "fa-youtube" : "fa-spotify")} /> {props.which ? "LOGIN YOUTUBE" : "LOGIN SPOTIFY"}</div> );
        else setInsideButton(<Spinner/>);
        
        if((props.which && loginYoutube) || (!props.which && loginSpotify)) setInsideButton(<FontAwesomeIcon icon="fa-solid fa-check" />);
        
        if(confirmed) navigate("/panel");
        
    },[loginState, loginSpotify, loginYoutube, confirmed, props.which])

    return(
        <div>
            {
            props.which ?
                <Button onClick={handleLogin} disabled={loginState !== 0} color='red'>
                    {insideButton}
                </Button>
            :
                <Button onClick={handleLogin} disabled={loginState !== 0} color='green'>
                    {insideButton}
                </Button>
            }
        </div>
    )
}

export default LoginButton;
