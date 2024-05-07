import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

const NoUser = () => {
  const {loginSpotify, loginYoutube} = useAuth();
    
  if(!(loginSpotify && loginYoutube)) return(<Outlet/>);
  return(<Navigate to="/panel"/>);
}

export default NoUser