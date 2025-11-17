const User = require('./users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password incorreta' });

        // Gerar Token
        const token = jwt.sign(
            { id: user._id, type: user.type }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ token, user: { id: user._id, username: user.username, type: user.type } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        // Admins podem criar outros admins ou users
        const { username, password, name, type } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, name, type });
        await newUser.save();
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { password, ...dataToUpdate } = req.body;

        // Se houver password nova, temos de encriptar
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, dataToUpdate, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Utilizador removido' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Middleware de Proteção ---

exports.verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(403).json({ message: 'Token não fornecido' });

    try {
        // O token vem normalmente como "Bearer <token>", removemos o "Bearer "
        const tokenClean = token.split(' ')[1] || token; 
        const decoded = jwt.verify(tokenClean, process.env.JWT_SECRET);
        
        if (decoded.type !== 'admin') {
            return res.status(401).json({ message: 'Acesso negado: Requer Admin' });
        }
        
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};