import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

const UserRoutes = () => {
  const {loginSpotify, loginYoutube} = useAuth();
    
  if(loginSpotify && loginYoutube) return(<Outlet/>);
  return(<Navigate to="/"/>);
}

export default UserRoutes