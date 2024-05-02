import { useContext } from "react";
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

    async function check()
    {
        return axios.get(BASE_URL+"confirm")
        .then(function(response)
        {
            if(response.status === 200) setConfirmed(true);
        });
        
    }

    const login = async (which) =>
    {
        let response = await axios.get(BASE_URL + which ? "yt/generate" : "s/generate");
            
        if(response.status === 200)
        {
            console.log(response.data);
            window.open(response.data, "_blank");
            if(which)
            {
                setLoginYoutube(true);
                if(loginSpotify)
                    check();
            }
            else
            {
                setLoginSpotify(true);
                if(loginYoutube)
                    check();
            }

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