import { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from 'axios';
axios.defaults.withCredentials = true;

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
    const [ytInterval, setYtInterval] = useState("");
    const [sInterval, setSInterval] = useState("");

    useEffect(function()
    {
        if(loginYoutube)
        {
            clearInterval(ytInterval);
            if(loginSpotify)
            {
                window.sessionStorage.setItem("login",1);
                navigate("/panel");
            }
        }

        if(loginSpotify)
        {
            clearInterval(sInterval);
            if(loginYoutube)
            {
                window.sessionStorage.setItem("login",1);
                navigate("/panel");
            }
        }
    },[loginYoutube,loginSpotify]);

    const login = async (which) =>
    {
        let response = await axios.get(BASE_URL + (which ? "yt/generate" : "s/generate"));
            
        if(response.data)
        {
            if(response.data !== true) window.open(response.data, "_blank");
            if(which) setYtInterval(setInterval(async () => 
            {
                axios.get(BASE_URL + "yt/confirm")
                .then(function(res)
                {
                    console.log(res);
                    if(res.data) //working only with status didn't work, it only returned status 204 even if configured on the server to return 200, this is the only thing that worked
                    {
                        setLoginYoutube(true);
                    }
                });
            }, 2000));
            else setSInterval(setInterval(async () => 
            {
                axios.get(BASE_URL + "s/confirm")
                .then(function(res)
                {
                    console.log(res);
                    if(res.data)
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
                setLoginSpotify(false);
                setLoginYoutube(false);
                window.sessionStorage.setItem("login",0);
                navigate("/");
            }
            else console.log(response.data)
        })
        
    };

    return (
        <AuthContext.Provider value={{ loginSpotify, loginYoutube, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}