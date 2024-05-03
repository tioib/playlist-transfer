import { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from 'axios';

const AuthContext = createContext();
const BASE_URL = 'http://localhost:3002/auth/';

export const useAuth = () =>
{
    return useContext(AuthContext)
}

export const AuthProvider = ({children}) =>
{
    const navigate = useNavigate();
    const [loginYoutube, setLoginYoutube] = useState(false);
    const [loginSpotify, setLoginSpotify] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [ytInterval, setYtInterval] = useState("");
    const [sInterval, setSInterval] = useState("");

    useEffect(function()
    {
        if(loginYoutube)
        {
            clearInterval(ytInterval);
            if(loginSpotify) navigate("/panel");
        }

        if(loginSpotify)
        {
            clearInterval(sInterval);
            if(loginYoutube) navigate("/panel");
        }
    },[loginYoutube,loginSpotify]);

    const login = async (which) =>
    {
        let response = await axios.get(BASE_URL + (which ? "yt/generate" : "s/generate"));
            
        if(response.data)
        {
            window.open(response.data, "_blank");
            if(which) setYtInterval(setInterval(async () => 
            {
                axios.get(BASE_URL + "yt/confirm")
                .then(function(res)
                {
                    if(res.status === 200)
                    {
                        console.log(res);
                        setLoginYoutube(true);
                    }
                });
            }, 2000));
            else setSInterval(setInterval(async () => 
            {
                axios.get(BASE_URL + (which ? "yt/confirm" : "s/confirm"))
                .then(function(res)
                {
                    if(res.status === 200)
                    {
                        setLoginSpotify(true);
                    }
                });
            }, 2000));

            return false;
        }
        else return response.data;
    }

    const logout = async ()=>
    {
        axios.post(`${BASE_URL}/logout`).then(function(response){
            if(response.status=== 200)
            {
                setLoginSpotify(false); setLoginYoutube(false);
                setConfirmed(false);
                navigate("/");
            }
            else console.log(response.data)
        })
        
    };

    return (
        <AuthContext.Provider value={{ confirmed,loginSpotify, loginYoutube, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}