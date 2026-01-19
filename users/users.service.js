const User = require('./users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

async function registerUser({ username, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, name, type: 'user' });
    await newUser.save();

    logger.info(`Utilizador registado: ${username} (ID: ${newUser._id})`);
    return newUser;
}

async function loginUser({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) throw { status: 404, message: 'Utilizador não encontrado' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { status: 400, message: 'Password incorreta' };

    const token = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '2h' });

    logger.info(`Login efetuado: ${username} (${user.type})`);
    return { token, user: { id: user._id, username: user.username, type: user.type } };
}

async function createUserAdmin(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new User({ ...data, password: hashedPassword });
    await newUser.save();
    logger.info(`Admin criou utilizador: ${data.username} (${data.type})`);
    return newUser;
}

async function updateUserAdmin(id, data) {
    const { password, ...rest } = data;
    if (password) rest.password = await bcrypt.hash(password, 10);

    const updated = await User.findByIdAndUpdate(id, rest, { new: true });
    if (!updated) throw { status: 404, message: 'Utilizador não encontrado' };

    logger.info(`Admin atualizou utilizador: ${id}`);
    return updated;
}

async function deleteUserAdmin(id) {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw { status: 404, message: 'Utilizador não encontrado' };

    logger.info(`Admin removeu utilizador: ${id}`);
    return deleted;
}

module.exports = {
    registerUser,
    loginUser,
    createUserAdmin,
    updateUserAdmin,
    deleteUserAdmin
};
