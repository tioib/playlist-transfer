import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner } from '@radix-ui/themes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faYoutube, faSpotify} from '@fortawesome/free-brands-svg-icons';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

function LoginButton(props)
{
    const [insideButton, setInsideButton] = useState(<></>);
    const [loginState, setLoginState] = useState(0);
    const {loginYoutube, loginSpotify, login} = useAuth();

    async function handleLogin()
    {
        if(loginState === 0)
        {
            setLoginState(1);
            const result = await login(props.which);
            if(result) console.log(result);
        }
    }
    
    useEffect(function()
    {
        if(loginState === 0) setInsideButton( <div><FontAwesomeIcon icon={props.which ? faYoutube : faSpotify} /> LOGIN</div> );
        else setInsideButton(<Spinner/>);

    },[loginState, props.which])

    return(
        <div>
            {
            props.which ?
                <Button onClick={handleLogin} color='red'>
                    {loginYoutube ? <FontAwesomeIcon icon={faCheck} /> : insideButton}
                </Button>
            :
                <Button onClick={handleLogin} color='green'>
                    {loginSpotify ? <FontAwesomeIcon icon={faCheck} /> : insideButton}
                </Button>
            }
        </div>
    )
}

export default LoginButton;
