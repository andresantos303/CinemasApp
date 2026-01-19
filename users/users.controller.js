const usersService = require('./users.service')


exports.register = async (req, res) => {
    try {
        const user = await usersService.registerUser(req.body);
        res.status(201).json({ message: 'Utilizador registado', user });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await usersService.loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = await usersService.createUserAdmin(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updated = await usersService.updateUserAdmin(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const result = await usersService.deleteUserAdmin(req.params.id);
        res.json({ message: 'Utilizador removido', result });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};