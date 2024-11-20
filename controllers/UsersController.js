const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');  

// Array sementara untuk menyimpan pengguna Blm pake GCP masi sementara jadi pake local
const users = [];
const SECRET_KEY = 'secret123';  

const UsersController = {

    // Register pengguna baru
    async register(request, h) {
        const { username, email, password } = request.payload;

        // Cek email 
        const userExists = users.find((user) => user.email === email);
        if (userExists) {
            return h.response({ error: 'User already exists' }).code(400);
        }

         if (password.length < 8) {
        return h.response({ error: true, message: 'Password must be at least 8 characters' }).code(400);
         }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = `user-${crypto.randomBytes(6).toString('base64url')}`;  // ID acak dengan panjang lebih pendek

        // Simpan pengguna baru
        const newUser = { id: userId, username, email, password: hashedPassword };
        users.push(newUser);

        return h.response({ message: 'User registered successfully!' }).code(201);
    },

    // Login 
    async login(request, h) {
        const { email, password } = request.payload;

        const user = users.find((user) => user.email === email);
        if (!user) {
            return h.response({ error: true, message: 'User not found' }).code(404);
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ error: true, message: 'Invalid credentials' }).code(401);
        }

        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });

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
        return h.response(users).code(200);
    },

    async getUserById(request, h) {
        const { userId } = request.params;
        const user = users.find(u => u.id === userId);

        if (!user) {
            return h.response({ error: 'User not found' }).code(404);
        }

        return h.response(user).code(200);
    },

    async updateUser(request, h) {
        const { userId } = request.params;
        const { username, email, password } = request.payload;

        const user = users.find(u => u.id === userId);

        if (!user) {
            return h.response({ error: 'User not found' }).code(404);
        }

        user.username = username || user.username;
        user.email = email || user.email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        return h.response({ message: 'User updated successfully!' }).code(200);
    },

    async deleteUser(request, h) {
        const { userId } = request.params;
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return h.response({ error: 'User not found' }).code(404);
        }

        users.splice(userIndex, 1);

        return h.response({ message: 'User deleted successfully!' }).code(200);
    }
};

module.exports = UsersController;
