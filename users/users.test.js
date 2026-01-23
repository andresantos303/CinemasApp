const usersController = require('./users.controller');
const User = require('./users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('./users.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Users Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, userId: 'adminId' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve autenticar utilizador com sucesso e retornar token', async () => {
      req.body = { email: 'test@mail.com', password: '123' };
      const mockUser = { _id: 'u1', email: 'test@mail.com', password: 'hash', type: 'user' };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Senha correta
      jwt.sign.mockReturnValue('fake-token');

      await usersController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'fake-token'
      }));
    });

    it('deve falhar com senha incorreta', async () => {
      req.body = { email: 'test@mail.com', password: 'wrong' };
      const mockUser = { password: 'hash' };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Senha errada

      await usersController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect password' });
    });
  });

  describe('createUser (Admin)', () => {
    it('deve criar utilizador se email não existir', async () => {
      req.body = { name: 'Novo', email: 'novo@mail.com', password: '123' };
      
      User.findOne.mockResolvedValue(null); // Email livre
      bcrypt.hash.mockResolvedValue('hashed123');
      
      const saveMock = jest.fn();
      User.mockImplementation(() => ({ save: saveMock }));

      await usersController.createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});