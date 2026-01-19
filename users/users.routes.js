const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const controller = require('./users.controller');
const auth = require('./auth.middleware'); 
const verifyAdmin = auth.verifyAdmin || auth; 


// --- Rotas Públicas ---
router.post('/register', (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Registar novo utilizador'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    username: "user1",
                    password: "123456",
                    name: "User Test"
                }
            }
        }
    } */
    usersController.register(req, res, next);
});

router.post('/login', (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Login de utilizador'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    username: "user1",
                    password: "123456"
                }
            }
        }
    } */
    usersController.login(req, res, next);
});

router.get('/health', (req, res) => {
  res.json({ status: 'users ok' });
});

// --- Rotas Protegidas (Admin) ---
router.post('/', verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Criar utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    usersController.createUser(req, res, next);
});

router.put('/:id', verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Atualizar utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    usersController.updateUser(req, res, next);
});

router.delete('/:id', verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Remover utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    usersController.deleteUser(req, res, next);
});

module.exports = router;