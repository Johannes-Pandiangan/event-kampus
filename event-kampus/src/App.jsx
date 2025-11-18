import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek apakah user sudah login (dari localStorage)
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) setIsLoggedIn(true);
  }, []);

  return (
    <div>
      {isLoggedIn && <Navbar />} 
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Home /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/event/:id"
          element={
            isLoggedIn ? <EventDetail /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </div>
  );
}

export default App;
