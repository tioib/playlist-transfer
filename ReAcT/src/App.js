import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from './pages/HomePage';
import UserRoutes from "./protected/UserRoutes";


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<UserRoutes/>}>
          <Route path="/panel" /*element={<PanelPage />}*/ />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
