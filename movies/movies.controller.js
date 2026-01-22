const Movie = require("./movies.model");
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const mongoose = require("mongoose");

// --- Middleware de Proteção ---
exports.verifyAdmin = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    logger.warn("Tentativa de alteração de filmes sem token.");
    return res.status(403).json({ message: "Token não fornecido" });
  }

  try {
    const token = tokenHeader.split(" ")[1] || tokenHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      logger.warn(`Acesso negado: User ${decoded.id} tentou alterar filmes.`);
      return res.status(401).json({ message: "Acesso negado: Requer Admin" });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    logger.warn(`Token inválido no serviço de Movies: ${error.message}`);
    return res.status(401).json({ message: "Token inválido" });
  }
};

// --- CRUD Pública ---

exports.getAllMovies = async (req, res) => {
  try {
    const { genre, year, limit } = req.query;
    let query = {};

    if (genre) query.genre = genre;
    if (year) {
      const yearInt = parseInt(year);
      if (isNaN(yearInt)) return res.status(400).json({ message: "Ano inválido." });
      query.year = yearInt;
    }

    const limitVal = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 0;

    logger.info(`Listagem de filmes. Filtros: ${JSON.stringify(query)}`);
    const movies = await Movie.find(query).limit(limitVal);
    res.status(200).json(movies);
  } catch (error) {
    logger.error(`Erro ao listar filmes: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ message: "Filme não encontrado" });
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- CRUD Admin ---

exports.createMovie = async (req, res) => {
  try {
    const { title, director, year, genre, duration, releaseDate, image } = req.body;

    if (!title || !director || !year || !duration) {
      return res.status(400).json({ message: "Título, realizador, ano e duração são obrigatórios." });
    }

    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(409).json({ message: "Já existe um filme com esse título." });
    }

    logger.info(`Admin (ID: ${req.userId}) a criar filme: ${title}`);

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
    logger.error(`Erro ao criar filme: ${error.message}`);
    // Este log vai apanhar erros de validação do Mongoose que escapem acima
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
        return res.status(400).json({ message: "ID inválido." });
    }

    logger.info(`Admin (ID: ${req.userId}) a atualizar filme ID: ${id}`);

    // Aqui usamos req.body diretamente, logo se enviares 'duration' no update, ele aceita.
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!updatedMovie) return res.status(404).json({ message: "Filme não encontrado." });

    res.json(updatedMovie);
  } catch (error) {
    logger.error(`Erro ao atualizar: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const deletedMovie = await Movie.findByIdAndDelete(id);
    if (!deletedMovie) return res.status(404).json({ message: "Filme não encontrado." });

    res.json({ message: "Filme removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};