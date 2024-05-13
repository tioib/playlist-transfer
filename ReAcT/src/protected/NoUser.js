import { Outlet, Navigate } from 'react-router-dom'

const NoUser = () => {
  if(!(parseInt(window.sessionStorage.getItem("login")))) return(<Outlet/>);
  return(<Navigate to="/panel"/>);
}

export default NoUser