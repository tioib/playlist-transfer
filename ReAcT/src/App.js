import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import HomePage from './pages/HomePage';
import PanelPage from "./pages/PanelPage";

import UserRoutes from "./protected/UserRoutes";
import NoUser from "./protected/NoUser";

import Header from "./components/Header";


function App() {
  return (
    <AuthProvider>
      <Header/>
      <Routes>
      <Route element={<NoUser/>}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<UserRoutes/>}>
          <Route path="/panel" element={<PanelPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
