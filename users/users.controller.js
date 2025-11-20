const User = require('./users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('./logger'); // Importar o nosso logger configurado

// --- Lógica de Autenticação ---

exports.register = async (req, res) => {
    try {
        const { username, password, name } = req.body;
        
        logger.info(`Iniciando registo para o utilizador: ${username}`);

        // Encriptar a password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            name,
            type: 'user' 
        });

        await newUser.save();
        
        logger.info(`Utilizador registado com sucesso: ${username} (ID: ${newUser._id})`);
        res.status(201).json({ message: 'Utilizador registado com sucesso' });
    } catch (error) {
        logger.error(`Erro ao registar utilizador ${req.body.username}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            logger.warn(`Tentativa de login falhada: Utilizador '${username}' não encontrado.`);
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Tentativa de login falhada: Password incorreta para '${username}'.`);
            return res.status(400).json({ message: 'Password incorreta' });
        }

        // Gerar Token
        const token = jwt.sign(
            { id: user._id, type: user.type }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        logger.info(`Login efetuado com sucesso: ${username} (${user.type})`);
        res.json({ token, user: { id: user._id, username: user.username, type: user.type } });
    } catch (error) {
        logger.error(`Erro interno no login: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

// --- CRUD para Admins ---

exports.createUser = async (req, res) => {
    try {
        const { username, password, name, type } = req.body;
        const adminId = req.userId; // Vem do middleware

        logger.info(`Admin (ID: ${adminId}) a criar novo utilizador: ${username} [${type}]`);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, name, type });
        
        await newUser.save();
        
        res.status(201).json(newUser);
    } catch (error) {
        logger.error(`Erro na criação de user pelo admin: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { password, ...dataToUpdate } = req.body;
        const adminId = req.userId;
        const targetId = req.params.id;

        logger.info(`Admin (ID: ${adminId}) a atualizar utilizador (ID: ${targetId})`);

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(targetId, dataToUpdate, { new: true });
        
        if (!updatedUser) {
            logger.warn(`Admin tentou atualizar utilizador inexistente (ID: ${targetId})`);
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        logger.error(`Erro ao atualizar utilizador: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const adminId = req.userId;
        const targetId = req.params.id;

        logger.info(`Admin (ID: ${adminId}) a remover utilizador (ID: ${targetId})`);

        const deletedUser = await User.findByIdAndDelete(targetId);
        
        if (!deletedUser) {
            logger.warn(`Admin tentou remover utilizador inexistente (ID: ${targetId})`);
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        res.json({ message: 'Utilizador removido' });
    } catch (error) {
        logger.error(`Erro ao remover utilizador: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

// --- Middleware de Proteção ---

exports.verifyAdmin = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        logger.warn('Acesso negado: Token não fornecido.');
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    try {
        const token = tokenHeader.split(' ')[1] || tokenHeader; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'admin') {
            logger.warn(`Acesso negado: Utilizador ${decoded.id} tentou aceder a rota de admin.`);
            return res.status(401).json({ message: 'Acesso negado: Requer Admin' });
        }
        
        req.userId = decoded.id; // Guardar ID para usar nos logs das funções seguintes
        next();
    } catch (error) {
        logger.warn(`Token inválido ou expirado: ${error.message}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};