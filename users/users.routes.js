const express = require('express');
const router = express.Router();
const userController = require('./users.controller');

// --- Rotas Públicas ---
router.post('/login', (req, res, next) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Login de utilizador'
    /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        username: "admin",
                        password: "123"
                    }
                }
            }
    } */
    userController.login(req, res, next);
});

// --- Rotas Protegidas (Admin) ---

router.post('/', userController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Criar utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    userController.createUser(req, res, next);
});

router.put('/:id', userController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Alterar utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    userController.updateUser(req, res, next);
});

router.delete('/:id', userController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Remover utilizador (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    userController.deleteUser(req, res, next);
});

module.exports = router;