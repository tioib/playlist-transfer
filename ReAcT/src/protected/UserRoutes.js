import { Outlet, Navigate } from 'react-router-dom'

const UserRoutes = () => {
  if(parseInt(window.sessionStorage.getItem("login"))) return(<Outlet/>);
  return(<Navigate to="/"/>);
}

export default UserRoutes