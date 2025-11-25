import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
// Import Pool, initializeDB, dan konstanta tabel dari db.js
import { pool, initializeDB, EVENTS_TABLE, USERS_TABLE } from './db.js'; 
import multer from 'multer';
import cloudinary from 'cloudinary'; 
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ------------------------------------
// --- CLOUDINARY SETUP ---
// ------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'event-kampus-uploads', 
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
  },
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });


// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


// ------------------------------------
// --- ROUTES API USERS ---
// ------------------------------------

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Semua field wajib diisi.' });
    try {
        // Query menggunakan pool
        const checkUser = await pool.query(`SELECT id FROM ${USERS_TABLE} WHERE email = $1`, [email]); 
        if (checkUser.rows.length > 0) return res.status(409).json({ message: 'Email sudah terdaftar.' });
        
        const result = await pool.query(`
            INSERT INTO ${USERS_TABLE} (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email
        `, [name, email, password]);
        res.status(201).json({ message: 'Registrasi berhasil!', user: result.rows[0] });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Query menggunakan pool
        const result = await pool.query(`
            SELECT id, name, email FROM ${USERS_TABLE} WHERE email = $1 AND password = $2
        `, [email, password]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Login berhasil!', user: result.rows[0] });
        } else {
            res.status(401).json({ message: 'Email atau password salah.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
    }
});


// ------------------------------------
// --- ROUTES API EVENTS ---
// ------------------------------------

app.get('/api/events', async (req, res) => {
  try {
    // Query menggunakan pool
    const result = await pool.query(`SELECT * FROM ${EVENTS_TABLE} ORDER BY date ASC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Events Error:', error);
    res.status(500).json({ message: 'Gagal memuat event dari database.' });
  }
});

app.post('/api/events', upload.single('imageFile'), async (req, res) => {
    const { title, date, location, description, organizer } = req.body; 
    if (!title || !date || !location || !description || !organizer) return res.status(400).json({ message: 'Semua field teks harus diisi.' });
    try {
        const id = nanoid(10);
        const imageUrl = req.file ? req.file.path : '';
        const imagePublicId = req.file ? req.file.filename : '';
        // Query menggunakan pool
        const result = await pool.query(`
            INSERT INTO ${EVENTS_TABLE} (id, title, date, location, description, organizer, image, image_public_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [id, title, date, location, description, organizer, imageUrl, imagePublicId]);
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Add Event Error:', error);
        res.status(500).json({ message: 'Gagal menambahkan event ke database.' });
    }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Query menggunakan pool
    const findEvent = await pool.query(`SELECT image_public_id FROM ${EVENTS_TABLE} WHERE id = $1`, [id]);
    const eventToDelete = findEvent.rows[0];

    if (!eventToDelete) return res.status(404).json({ message: `Event dengan ID ${id} tidak ditemukan.` });

    if (eventToDelete.image_public_id) {
        await cloudinary.v2.uploader.destroy(eventToDelete.image_public_id);
    }
    // Query menggunakan pool
    await pool.query(`DELETE FROM ${EVENTS_TABLE} WHERE id = $1`, [id]); 
    res.status(200).json({ message: `Event dengan ID ${id} berhasil dihapus.` });

  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ message: 'Gagal menghapus event dari database.' });
  }
});


// --- SERVER START ---
async function startServer() {
    try {
        // Panggil fungsi inisialisasi dan koneksi DB
        await initializeDB(); 
        app.listen(port, () => {
            console.log(`Server backend berjalan di http://localhost:${port}`);
            console.log('Backend siap di-deploy dengan PostgreSQL Pool dan Cloudinary.');
        });
    } catch (err) {
        console.error('Gagal menjalankan server karena kesalahan database. Pastikan koneksi PostgreSQL benar.');
        // Beri tahu pengguna cara menggunakan pgAdmin4
        console.log('\nHint: Gunakan pgAdmin4 untuk memastikan tabel "users" dan "events" telah terbuat di database cloud Anda.');
        process.exit(1);
    }
}

startServer();



