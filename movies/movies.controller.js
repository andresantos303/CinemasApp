const Movie = require("./movies.model");
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const mongoose = require("mongoose");

// --- Public CRUD ---

exports.getAllMovies = async (req, res) => {
  try {
    const { genre, year, limit } = req.query;
    let query = {};

    if (genre) query.genre = genre;
    if (year) {
      const yearInt = parseInt(year);
      if (isNaN(yearInt)) return res.status(400).json({ message: "Invalid year." });
      query.year = yearInt;
    }

    const limitVal = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 0;

    logger.info(`Listing movies. Filters: ${JSON.stringify(query)}`);
    const movies = await Movie.find(query).limit(limitVal);
    res.status(200).json(movies);
  } catch (error) {
    logger.error(`Error listing movies: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Admin CRUD ---

exports.createMovie = async (req, res) => {
  try {
    const { title, director, year, genre, duration, releaseDate, image } = req.body;

    if (!title || !director || !year || !duration) {
      return res.status(400).json({ message: "Title, director, year, and duration are required." });
    }

    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(409).json({ message: "A movie with this title already exists." });
    }

    logger.info(`Admin (ID: ${req.userId}) creating movie: ${title}`);

    const newMovie = new Movie({ 
        title, 
        director, 
        year, 
        genre, 
        duration, 
        releaseDate, 
        image: image 
    });

    await newMovie.save();
    res.status(201).json(newMovie);

  } catch (error) {
    logger.error(`Error creating movie: ${error.message}`);
    // This log catches Mongoose validation errors that slip through above
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID." });
    }

    logger.info(`Admin (ID: ${req.userId}) updating movie ID: ${id}`);

    // Here we use req.body directly, so if you send 'duration' in the update, it accepts it.
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!updatedMovie) return res.status(404).json({ message: "Movie not found." });

    res.json(updatedMovie);
  } catch (error) {
    logger.error(`Error updating: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deletedMovie = await Movie.findByIdAndDelete(id);
    if (!deletedMovie) return res.status(404).json({ message: "Movie not found." });

    res.json({ message: "Movie removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};