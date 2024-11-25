require('dotenv').config();// Memuat variabel lingkungan dari file .env

const Hapi = require('@hapi/hapi');
const userRoutes = require('./routes/userRoutes'); // pastiin file routes bener

const init = async () => {
    // Membuat server dengan konfigurasi dari .env atau default
    const server = Hapi.server({
        port: process.env.PORT || 3000, 
        host: process.env.HOST || 'localhost', // masi localhost blm di deploy
    });

    // Menyambungkan route ke server
    server.route(userRoutes);

    // Mulai server
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

// Menangani unhandled rejection untuk menjaga server tetap berjalan
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Menjalankan server
init();
