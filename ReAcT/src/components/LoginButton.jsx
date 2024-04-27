import React, {Suspense} from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { Button, Spinner } from '@radix-ui/themes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

function LoginButton(props)
{
    const {t} = useTranslation();
    const {sIdle} = t("loginSpotify");
    const {ytIdle} = t("loginYoutube");

    const [insideButton, setInsideButton] = useState(<></>);
    const [loginState, setLoginState] = useState(0);

    const trans = props.which ? ytIdle : sIdle,
            icon = "fa-brands " + (props.which ? "fa-youtube" : "fa-spotify");

    //TODO: make functions handleYoutubeLogin() and handleSpotifyLogin()

    useEffect(function()
    {
        switch(loginState)
        {
            case 0:
                setInsideButton( <div><FontAwesomeIcon icon={icon} /> {trans}</div> );
                break;
            case 1:
                setInsideButton(<Spinner/>);
                break;
            default:
                setInsideButton(<FontAwesomeIcon icon="fa-solid fa-check" />);
        }
    },[loginState])

    return(
        <Suspense fallback={<Spinner />}>
            {
            props.which ?
                <Button disabled={loginState === 2} color='red'>
                    {insideButton}
                </Button>
            :
                <Button disabled={loginState === 2} color='green'>
                    {insideButton}
                </Button>
            }
        </Suspense>
    )
}

export default LoginButton;
