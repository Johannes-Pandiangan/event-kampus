import { Pool } from 'pg'; 
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const EVENTS_TABLE = 'events';
const USERS_TABLE = 'users';

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false 
});

// Data event awal
const initialEvents = [
    { id: nanoid(10), title: 'Seminar Ilmu Komputer', date: '2025-11-05', location: 'Aula Fakultas Ilmu Komputer', description: 'Seminar membahas tren terbaru dalam dunia IT dan AI.', organizer: 'IMILKOM', image: 'SeminarIlkom', image_public_id: null },
    { id: nanoid(10), title: 'Pelatihan Dasar Organisasi', date: '2025-10-25', location: 'Gedung D Fasilkom-TI', description: 'Pelatihan Dasar Organisasi untuk mahasiswa baru Fasilkom-TI.', organizer: 'IMILKOM', image: 'Pelatihan', image_public_id: null },
];

async function initializeDB() {
    let client;
    try {
        // Ambil koneksi dari pool untuk menjalankan query setup
        client = await pool.connect(); 
        console.log("✅ Connected to PostgreSQL Pool"); // Seperti contoh Anda

        // 1. Membuat tabel users
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL
            );
        `);
        
        // 2. Membuat tabel events
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${EVENTS_TABLE} (
                id VARCHAR(30) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                organizer VARCHAR(100) NOT NULL,
                image TEXT,
                image_public_id VARCHAR(255)
            );
        `);
        console.log('✅ PostgreSQL tables checked/created.');
        
        // 3. Memasukkan data event awal jika tabel events kosong
        const checkEvents = await client.query(`SELECT COUNT(*) FROM ${EVENTS_TABLE}`);
        if (checkEvents.rows[0].count == 0) {
            for (const event of initialEvents) {
                await client.query(`
                    INSERT INTO ${EVENTS_TABLE} (id, title, date, location, description, organizer, image, image_public_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [event.id, event.title, event.date, event.location, event.description, event.organizer, event.image, event.image_public_id]);
            }
            console.log("Initial events inserted.");
        }

    } catch (err) {
        console.error("❌ Database connection or initialization error:", err.stack);
        throw err;
    } finally {
        // Lepaskan koneksi kembali ke pool
        if (client) client.release(); 
    }
}

// Export Pool untuk menjalankan query di server.js tanpa perlu connect/release manual
export { pool, initializeDB, EVENTS_TABLE, USERS_TABLE };
