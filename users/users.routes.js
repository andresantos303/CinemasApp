const express = require("express");
const router = express.Router();
const userController = require("./users.controller");

// --- Rotas Públicas ---

router.post("/auth/login", (req, res, next) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login de utilizador'
  /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        email: "user@example.com",
                        password: "123"
                    }
                }
            }
    } */
  userController.login(req, res, next);
});

router.post("/users", (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Registar novo utilizador'
  /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        name: "User Name",
                        email: "user@example.com",
                        password: "123"
                    }
                }
            }
    } */
  userController.register(req, res, next);
});

// --- Rotas Protegidas ---

// Listar todos (pode ser público ou protegido, API não especifica, mas geralmente é protegido ou público.
// Spec diz: GET /users. Sem Auth especificado? Vamos assumir público por enquanto ou verificar se user list deve ser auth.
// O texto não menciona autenticação para GET /users, mas GET /users/:id também não.
// Pelo padrão, PUT/DELETE costumam ser auth.
// Vou deixar GET público por enquanto, mas com filtro.

router.get("/users", (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Listar todos os utilizadores'
  // #swagger.parameters['role'] = { description: 'Filtrar por role (admin/user)', type: 'string' }
  userController.getAllUsers(req, res, next);
});

router.get("/users/:id", (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Obter perfil de utilizador'
  userController.getUserById(req, res, next);
});

router.put("/users/:id", userController.verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Alterar utilizador (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
            content: {
                "application/json": {
                    schema: {
                        name: "New Name",
                        email: "newemail@example.com",
                        role: "user"
                    }
                }
            }
    } */
  userController.updateUser(req, res, next);
});

router.delete("/users/:id", userController.verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Remover utilizador (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  userController.deleteUser(req, res, next);
});

module.exports = router;
