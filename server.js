const Hapi = require('@hapi/hapi');
const userRoutes = require('./routes/userRoutes'); 

const init = async () => {
    const server = Hapi.server({
        port: 3000, 
        host: 'localhost', 
    });

    
    server.route(userRoutes);

    await server.start(); 
    console.log(`Server running on ${server.info.uri}`);
};

// Menangani unhandled rejection
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Inisialisasi server
init();
