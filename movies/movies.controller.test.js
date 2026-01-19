const request = require('supertest');
const express = require('express');
const { getMovieById } = require('./movies.controller');
const Movie = require('./movies.model');

jest.mock('./movies.model');

const app = express();
app.use(express.json());
app.get('/movies/:id', getMovieById);

describe('GET /movies/:id', () => {
    
    it('should return a movie if it exists', async () => {
        // --- ARRANGE --- (Set up data and mocks)
        const testID = '123';
        const mockMovie = { _id: testID, title: 'Inception', director: 'Nolan' };
        Movie.findById.mockResolvedValue(mockMovie);

        // --- ACT --- (Execute the code being tested)
        const response = await request(app).get(`/movies/${testID}`);

        // --- ASSERT --- (Check the results)
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockMovie);
    });

    it('should return 404 if movie is not found', async () => {
        // --- ARRANGE ---
        Movie.findById.mockResolvedValue(null);

        // --- ACT ---
        const response = await request(app).get('/movies/fake-id');

        // --- ASSERT ---
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Filme não encontrado');
    });

    it('should return 500 if there is a database error', async () => {
        // --- ARRANGE ---
        const errorMessage = 'Database connection failed';
        Movie.findById.mockRejectedValue(new Error(errorMessage));

        // --- ACT ---
        const response = await request(app).get('/movies/123');

        // --- ASSERT ---
        expect(response.status).toBe(500);
        expect(response.body.error).toBe(errorMessage);
    });
});