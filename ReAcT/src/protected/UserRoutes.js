import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

const UserRoutes = () => {
  const {token, admin} = useAuth();
    
  if(token != "")
    return(admin ? <Navigate to="/"/> : <Outlet/>)
  return(<Navigate to="/login"/>)
}

export default UserRoutes