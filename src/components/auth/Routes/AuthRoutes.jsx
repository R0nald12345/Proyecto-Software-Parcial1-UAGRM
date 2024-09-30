import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "../Login";
import RegisterLogin from "../RegisterLogin";

const AuthRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/registro" element={<RegisterLogin/>} />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
};

export default AuthRoutes;
