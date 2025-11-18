// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = '/api';

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));
        setIsLoggedIn(true);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saat login:", error);
      alert("Gagal terhubung ke server. Pastikan backend berjalan di port 5000.");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <h1 className="main-title">TUGAS EVENT KAMPUS JOHANNES</h1>
      <div className="auth-container card-shadow">
        <h2>Masuk ke Event Kampus</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* ==============================
              PASSWORD + IKON SVG PRO
             ============================== */}
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-btn"
            >
              {showPassword ? (
                // HIDE PASSWORD ICON (🔒🙈)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-7.94"></path>
                  <path d="M22.54 12.12A21.8 21.8 0 0 0 17.94 6.06"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                // SHOW PASSWORD ICON (👁️)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {/* ================================= */}
          
          <button type="submit" className="btn-primary">Masuk</button>
        </form>

        <p>
          Belum punya akun? <a href="/register">Daftar</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

