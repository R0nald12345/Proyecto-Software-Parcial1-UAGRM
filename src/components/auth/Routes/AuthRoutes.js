import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Login";
import RegisterLogin from "../RegisterLogin";
import PrivateRoute from "./PrivateRoute"; // Importa el componente de ruta privada
// import Dashboard from "../Dashboard"; // Supongamos que esta es una ruta protegida
import { AuthProvider } from "../../../Context/AuthContext";
import App from "../../App";

const AuthRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<RegisterLogin />} />
          <Route
            path="/graficador"
            element={
              <PrivateRoute>
                <App/>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AuthRoutes;