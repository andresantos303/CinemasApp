const express = require("express");
const router = express.Router();
const userController = require("./users.controller");
const { verifyAdmin } = require("./auth.middleware");

// --- Rotas Públicas ---

router.post("/login", (req, res, next) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Autenticar utilizador e obter token'
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
    } 
  */
  userController.login(req, res, next);
});

// --- Rotas Protegidas (Requer Admin) ---
// NOTA: O POST /users passou para aqui (substituindo o register)

router.post("/", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Criar novo utilizador (Admin)'
  // #swagger.description = 'Cria um utilizador permitindo definir o role (admin/user). Requer token de Admin.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            name: "Novo Utilizador",
            email: "novo@example.com",
            password: "strongpassword",
            role: "user"
          }
        }
      }
    } 
  */
  userController.createUser(req, res, next);
});

router.get("/", (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Listar todos os utilizadores'
  // #swagger.parameters['role'] = { description: 'Filtrar por role', type: 'string' }
  // Podes manter esta pública ou proteger também, dependendo do requisito.
  userController.getAllUsers(req, res, next);
});

router.get("/:id", (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Obter perfil de utilizador'
  userController.getUserById(req, res, next);
});

router.put("/:id", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Atualizar utilizador (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
      content: {
        "application/json": {
          schema: {
            name: "Nome Editado",
            email: "editado@example.com",
            role: "user"
          }
        }
      }
    } 
  */
  userController.updateUser(req, res, next);
});

router.delete("/:id", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Remover utilizador (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  userController.deleteUser(req, res, next);
});

module.exports = router;