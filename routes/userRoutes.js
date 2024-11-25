const UsersController = require('../controllers/UsersController');

const userRoutes = [
    {
        method: 'POST',
        path: '/register',
        handler: UsersController.register,
    },
    {
        method: 'POST',
        path: '/login',
        handler: UsersController.login,
    },
    {
        method: 'GET',
        path: '/users',
        handler: UsersController.getAllUsers,
    },
    {
        method: 'GET',
        path: '/users/{userId}',
        handler: UsersController.getUserById,
    },
    {
        method: 'PUT',
        path: '/users/{userId}',
        handler: UsersController.updateUser,
    },
    {
        method: 'DELETE',
        path: '/users/{userId}',
        handler: UsersController.deleteUser,
    },
    {
        method: 'GET',
        path: '/profile',
        handler: UsersController.getProfile,
    },

];

module.exports = userRoutes;
