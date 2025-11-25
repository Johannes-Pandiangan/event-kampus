// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = '/api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`${data.message} Silakan login.`); 
            navigate("/login");
        } else {
            alert(data.message); // Tampilkan pesan error dari backend
        }

    } catch (error) {
        console.error("Error saat registrasi:", error);
        alert("Gagal terhubung ke server. Pastikan backend berjalan di port 5000.");
    }
  };

  return (
    <div className="auth-container card-shadow">
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nama Lengkap"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Daftar</button>
      </form>
      <p>
        Sudah punya akun? <a href="/login">Login</a>
      </p>
    </div>
  );
}


export default Register;


