const moviesController = require('./movies.controller');
const Movie = require('./movies.model');
const mongoose = require('mongoose');

// Mocks
jest.mock('./movies.model');

describe('Movies Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      userId: 'admin123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('deve retornar uma lista de filmes com sucesso', async () => {
      const mockMovies = [{ title: 'Matrix', year: 1999 }];
      // Simular a corrente de chamadas: find().limit()
      const mockLimit = jest.fn().mockResolvedValue(mockMovies);
      Movie.find.mockReturnValue({ limit: mockLimit });

      await moviesController.getAllMovies(req, res);

      expect(Movie.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    it('deve lidar com erros do servidor', async () => {
      const errorMsg = 'Erro de DB';
      Movie.find.mockImplementation(() => { throw new Error(errorMsg) });

      await moviesController.getAllMovies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe('createMovie', () => {
    it('deve criar um filme com sucesso', async () => {
      req.body = { 
        title: 'Inception', 
        director: 'Nolan', 
        year: 2010, 
        duration: 148 
      };
      
      Movie.findOne.mockResolvedValue(null); // Não existe duplicado
      // Mock do construtor e do método save
      const saveMock = jest.fn().mockResolvedValue(req.body);
      Movie.mockImplementation(() => ({
        save: saveMock
      }));

      await moviesController.createMovie(req, res);

      expect(Movie.findOne).toHaveBeenCalledWith({ title: 'Inception' });
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 se faltarem campos obrigatórios', async () => {
      req.body = { title: 'Inception' }; // Faltam campos

      await moviesController.createMovie(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      
      expect(Movie).not.toHaveBeenCalled();
    });
  });
});