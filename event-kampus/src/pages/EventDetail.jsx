import React from "react";
import { useParams, Link } from "react-router-dom";

function EventDetail() {
  const { id } = useParams();

  return (
    <div className="container">
      <h2>Detail Event #{id}</h2>
      <p>Halaman ini nanti bisa menampilkan detail lengkap event berdasarkan ID.</p>
      <Link to="/">← Kembali ke Daftar Event</Link>
    </div>
  );
}

export default EventDetail;
