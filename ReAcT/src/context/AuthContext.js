import { useContext } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from 'axios';

const AuthContext = createContext();
const BASE_URL = 'http://localhost:3001/api';

export const useAuth = () =>
{
    return useContext(AuthContext)
}

export const AuthProvider = ({children}) =>
{
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [admin, setAdmin] = useState(false);
    const [email, setEmail] = useState("");

    const login = async (email,pass) =>
    {
        axios.post(`${BASE_URL}/login`,{email: email, pass: pass}).then(function(response){
            if(response.status == 200)
            {
                console.log(response.data.token,response.data.admin)
            
                setToken(response.data.token);
                setAdmin(response.data.admin);
                setEmail(response.data.email);

                navigate("/");
                return false;
            }
            else return response.data.error;
        })
    }

    const register = async (email,pass,pass2) =>
    {
        axios.post(`${BASE_URL}/register`,{email: email, pass: pass, pass2: pass2}).then(function(response){
            if(response.status == 200)
            {
                console.log(response.data.token,response.data.admin)
            
                setToken(response.data.token);
                setAdmin(response.data.admin);
                setEmail(response.data.email);

                navigate("/");
                return false;
            }
            else return response.data.error;
        })
    }

    const logout = async ()=>
    {
        axios.post(`${BASE_URL}/logout`,{token: token}).then(function(response){
            if(response.status < 500)
            {
                setToken(""); setAdmin(false);
                navigate("/");
            }
            else console.log(response.data)
        })
        
    };

    return (
        <AuthContext.Provider value={{ token, admin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}