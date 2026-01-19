const User = require("./users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const mongoose = require("mongoose"); // Necessário para validar IDs

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validação de Input
    if (!email || !password) {
      logger.warn("Tentativa de login sem email ou password.");
      return res.status(400).json({ message: "Email e password são obrigatórios." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Tentativa de login falhada: Utilizador '${email}' não encontrado.`);
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Tentativa de login falhada: Password incorreta para '${email}'.`);
      return res.status(400).json({ message: "Password incorreta" });
    }

    // Gerar Token
    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    logger.info(`Login efetuado com sucesso: ${email} (${user.type})`);
    res.json({
      message: "Login efetuado com sucesso",
      token: token,
    });
  } catch (error) {
    logger.error(`Erro interno no login: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// --- CRUD Pública / Protegida ---

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    // 1. Validação simples do filtro
    if (role) {
      if (!["admin", "user"].includes(role)) {
         return res.status(400).json({ message: "Filtro de role inválido. Use 'admin' ou 'user'." });
      }
      query.type = role;
    }

    logger.info(`Listagem de utilizadores solicitada. Filtro: ${JSON.stringify(query)}`);
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Erro ao listar utilizadores: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validação de formato de ID (Evita CastError do Mongoose)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Formato de ID inválido." });
    }

    logger.info(`Obtendo detalhes do utilizador ID: ${id}`);
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    res.json(user);
  } catch (error) {
    logger.error(`Erro ao obter utilizador ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// --- CRUD para Admins ---

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    const adminId = req.userId; 

    // 1. Validação de Campos Obrigatórios
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Nome, email e password são obrigatórios." });
    }

    // 2. Validação de Email Duplicado (Antes de tentar gravar)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "O email fornecido já está registado." });
    }

    // 3. Validação do Role (se fornecido)
    const validRoles = ["user", "admin"];
    const userType = type || "user"; // Default
    if (!validRoles.includes(userType)) {
        return res.status(400).json({ message: "Tipo de utilizador inválido." });
    }

    logger.info(`Admin (ID: ${adminId}) a criar novo utilizador: ${email} [${userType}]`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, type: userType });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`Erro na criação de user pelo admin: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, role, email, ...dataToUpdate } = req.body;
    const adminId = req.userId;
    const targetId = req.params.id;

    // 1. Validação de ID
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "Formato de ID inválido." });
    }

    // 2. Se houver tentativa de mudar o email, verificar se já existe noutro user
    if (email) {
        const existingUser = await User.findOne({ email });
        // Se existe um user com esse email E não é o próprio user que estamos a editar
        if (existingUser && existingUser._id.toString() !== targetId) {
            return res.status(409).json({ message: "O email fornecido já está em uso por outro utilizador." });
        }
        dataToUpdate.email = email;
    }

    logger.info(`Admin (ID: ${adminId}) a atualizar utilizador (ID: ${targetId})`);

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    if (role) {
      if (!["admin", "user"].includes(role)) {
          return res.status(400).json({ message: "Role inválido." });
      }
      dataToUpdate.type = role;
    }

    const updatedUser = await User.findByIdAndUpdate(targetId, dataToUpdate, {
      new: true,
      runValidators: true // Garante que validações do Schema (como required) correm no update
    }).select("-password");

    if (!updatedUser) {
      logger.warn(`Admin tentou atualizar utilizador inexistente (ID: ${targetId})`);
      return res.status(404).json({ message: "Utilizador não encontrado" });
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

    // 1. Validação de ID
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "Formato de ID inválido." });
    }
    
    // 2. Opcional: Impedir que o Admin se apague a si próprio
    if (adminId === targetId) {
         return res.status(400).json({ message: "Não pode apagar a sua própria conta de administrador." });
    }

    logger.info(`Admin (ID: ${adminId}) a remover utilizador (ID: ${targetId})`);

    const deletedUser = await User.findByIdAndDelete(targetId);

    if (!deletedUser) {
      logger.warn(`Admin tentou remover utilizador inexistente (ID: ${targetId})`);
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    res.json({ message: "Utilizador removido com sucesso" });
  } catch (error) {
    logger.error(`Erro ao remover utilizador: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// --- Middleware --- 
// (O middleware verifyAdmin manteve-se igual, pois já tinha validações suficientes)
exports.verifyAdmin = (req, res, next) => {
    // ... (código existente mantido) ...
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
        logger.warn("Acesso negado: Token não fornecido.");
        return res.status(403).json({ message: "Token não fornecido" });
    }

    try {
        const token = tokenHeader.split(" ")[1] || tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== "admin") {
        logger.warn(
            `Acesso negado: Utilizador ${decoded.id} tentou aceder a rota de admin.`
        );
        return res.status(401).json({ message: "Acesso negado: Requer Admin" });
        }

        req.userId = decoded.id; 
        next();
    } catch (error) {
        logger.warn(`Token inválido ou expirado: ${error.message}`);
        return res.status(401).json({ message: "Token inválido" });
    }
};