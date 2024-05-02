import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

const UserRoutes = () => {
  const {confirmed} = useAuth();
    
  if(confirmed) return(<Outlet/>);
  return(<Navigate to="/"/>);
}

export default UserRoutes