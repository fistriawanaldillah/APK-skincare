const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');  

const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Gantilah dengan path ke kunci JSON Firebase 

// Inisialisasi Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Menyambungkan ke Firestore

// Gunakan environment variable untuk SECRET_KEY
const SECRET_KEY = process.env.SECRET_KEY || 'secret123'; // bisa di ganti dengan environment variable atau cara aman lainnya.

const UsersController = {

    // Register pengguna baru
    async register(request, h) {
        const { username, email, password } = request.payload;

        // Cek email di Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return h.response({ error: 'User already exists' }).code(400);
        }

        // Validasi panjang password
        if (password.length < 8) {
            return h.response({ error: true, message: 'Password must be at least 8 characters' }).code(400);
        }

        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat ID pengguna acak
        const userId = `user-${crypto.randomBytes(6).toString('base64url')}`;

        // Menyimpan pengguna baru di Firestore
        const newUser = {
            id: userId,
            username,
            email,
            password: hashedPassword
        };

        await db.collection('users').doc(userId).set(newUser);

        return h.response({ message: 'User registered successfully!' }).code(201);
    },

    // Login
    async login(request, h) {
        const { email, password } = request.payload;

        // Cari user di Firestore berdasarkan email
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return h.response({ error: true, message: 'User not found' }).code(404);
        }

        const user = userSnapshot.docs[0].data();

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ error: true, message: 'Invalid credentials' }).code(401);
        }

        // Buat token JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        const response = {
            error: false,
            message: 'success',
            loginResult: {
                userId: user.id,  
                name: user.username,  
                token: token  
            }
        };

        return h.response(response).code(200);
    },

    // Mendapatkan semua pengguna
    async getAllUsers(request, h) {
        const usersSnapshot = await db.collection('users').get();
        const usersList = usersSnapshot.docs.map(doc => doc.data());
        return h.response(usersList).code(200);
    },

    async getUserById(request, h) {
        const { userId } = request.params;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        return h.response(userDoc.data()).code(200);
    },

    // Update data pengguna
    async updateUser(request, h) {
        const { userId } = request.params;
        const { username, email, password } = request.payload;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        const updatedUser = {
            username: username || userDoc.data().username,
            email: email || userDoc.data().email,
        };

        if (password) {
            updatedUser.password = await bcrypt.hash(password, 10);
        }

        await db.collection('users').doc(userId).update(updatedUser);

        return h.response({ message: 'User updated successfully!' }).code(200);
    },

    // Menghapus pengguna
    async deleteUser(request, h) {
        const { userId } = request.params;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return h.response({ error: 'User not found' }).code(404);
        }

        await db.collection('users').doc(userId).delete();

        return h.response({ message: 'User deleted successfully!' }).code(200);
    },

    // Mendapatkan profil pengguna
    async getProfile(request, h) {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return h.response({ error: true, message: 'Authorization token missing' }).code(401);
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, SECRET_KEY);

            // Ambil pengguna dari Firestore berdasarkan ID
            const userDoc = await db.collection('users').doc(decoded.userId).get();

            if (!userDoc.exists) {
                return h.response({ error: true, message: 'User not found' }).code(404);
            }

            const user = userDoc.data();

            // Mengembalikan profil pengguna
            return h.response({
                error: false,
                message: 'success',
                profile: {
                    userId: user.id,
                    name: user.username,
                    email: user.email
                }
            }).code(200);
        } catch (err) {
            return h.response({ error: true, message: 'Invalid token' }).code(401);
        }
    }
};

module.exports = UsersController;
