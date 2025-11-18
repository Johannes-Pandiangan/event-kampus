import React, { useState, useEffect } from "react";
import EventList from "../components/EventList";
import SeminarIlkom from "../assets/SeminarIlkom.png"; 
import Pelatihan from "../assets/Pelatihan.png"; 

// Base URL untuk API backend
const BASE_URL = 'http://localhost:5000/api/events';
const BACKEND_BASE_URL = 'http://localhost:5000'; // Untuk prefix URL gambar permanen

// Mapping aset lokal untuk event awal yang diinisialisasi
const IMAGE_MAP = {
  "SeminarIlkom": SeminarIlkom,
  "Pelatihan": Pelatihan,
};

function Home() {
  const [events, setEvents] = useState([]);
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    organizer: "",
    image: "", // URL objek sementara untuk pratinjau
    imageFile: null, // Objek File untuk diupload
  });

  // --- LOGIC FETCH DATA ---
  const fetchEvents = async () => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error("Gagal memuat event dari server.");
      }
      const data = await response.json();
      
      const mappedEvents = data.map(event => {
        let finalImage = event.image;
        
        // 1. Jika image adalah nama file hardcoded (event awal)
        if (IMAGE_MAP[event.image]) {
            finalImage = IMAGE_MAP[event.image];
        } 
        // 2. Jika image adalah path permanen dari backend (/uploads/...)
        else if (event.image.startsWith('/uploads')) {
            finalImage = `${BACKEND_BASE_URL}${event.image}`; // URL Lengkap
        }
        
        return { ...event, image: finalImage };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      // Tampilkan pesan kesalahan jika backend tidak berjalan
      alert("Gagal terhubung ke server backend atau memuat data event. Pastikan server berjalan di port 5000.");
    }
  };

  useEffect(() => {
    document.title = "Daftar Event Kampus";
    fetchEvents();
  }, []);

  // --- LOGIC FORM INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setNewEvent({ ...newEvent, image: imageURL, imageFile: file });
    } else {
        // Reset jika user membatalkan pilihan file
        setNewEvent({ ...newEvent, image: "", imageFile: null });
    }
  }

  // --- LOGIC TAMBAH EVENT (POST) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.description || !newEvent.organizer) {
        alert("Semua field teks harus diisi!");
        return;
    }

    // Siapkan data untuk dikirim (menggunakan FormData karena ada file)
    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('date', newEvent.date);
    formData.append('location', newEvent.location);
    formData.append('description', newEvent.description);
    formData.append('organizer', newEvent.organizer);
    
    // Key 'imageFile' harus cocok dengan konfigurasi Multer di backend
    if (newEvent.imageFile) {
        formData.append('imageFile', newEvent.imageFile);
    }

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            throw new Error('Gagal menambah event baru.');
        }

        // Ambil data event baru (termasuk URL permanen)
        // const addedEvent = await response.json(); 
        
        // Refresh daftar event dari server untuk mendapatkan URL gambar permanen yang benar
        fetchEvents(); 

        // Bersihkan form
        setNewEvent({
            title: "",
            date: "",
            location: "",
            description: "",
            organizer: "",
            image: "",
            imageFile: null,
        });
        
    } catch (error) {
        console.error("Error submitting new event:", error);
        alert("Gagal menambah event. Pastikan server backend berjalan di port 5000.");
    }
  };

  // --- LOGIC HAPUS EVENT (DELETE) ---
  const handleDelete = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Gagal menghapus event ID ${id} di server.`);
        }
        
        // Perbarui state secara lokal
        setEvents(events.filter((event) => event.id !== id));
        
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("Gagal menghapus event. Pastikan server backend berjalan di port 5000.");
    }
  };

  return (
    <div className="container">
      <h1>Daftar Event Kampus</h1>

      <form onSubmit={handleSubmit} className="event-form">
        <h2>Tambah Event Baru</h2>
        <input 
            type="text" 
            name="title" 
            placeholder="Judul Event" 
            value={newEvent.title} 
            onChange={handleChange} 
            required 
        />
        <input 
            type="date" 
            name="date" 
            value={newEvent.date} 
            onChange={handleChange} 
            required 
        />
        <input 
            type="text" 
            name="location" 
            placeholder="Lokasi" 
            value={newEvent.location} 
            onChange={handleChange} 
            required 
        />
        <input 
            type="text" 
            name="organizer" 
            placeholder="Penyelenggara" 
            value={newEvent.organizer} 
            onChange={handleChange} 
            required 
        />
        <input 
            type="text" 
            name="description" 
            placeholder="Deskripsi singkat" 
            value={newEvent.description} 
            onChange={handleChange} 
            required 
        />
        <input
          type="file"
          accept="image/*"
          // Key digunakan untuk memaksa input file me-reset saat state newEvent di-reset
          key={newEvent.imageFile ? "file-input-filled" : "file-input-empty"} 
          onChange={handleImageChange}
        />
        {/* Pratinjau gambar yang dipilih sebelum di-upload */}
        {newEvent.imageFile && (
            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <p style={{ fontSize: '12px', color: 'green' }}>Gambar dipilih: {newEvent.imageFile.name}</p>
                <img src={newEvent.image} alt="Pratinjau" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }}/>
            </div>
        )}
        <button type="submit">Tambah Event</button>
      </form>

      <EventList events={events} onDelete={handleDelete} />
    </div>
  );
}

export default Home;