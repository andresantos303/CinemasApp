const User = require("./users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const mongoose = require("mongoose"); // Required to validate IDs

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      logger.warn("Login attempt without email or password.");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login attempt failed: User '${email}' not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login attempt failed: Incorrect password for '${email}'.`);
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    logger.info(`Login successful: ${email} (${user.type})`);
    res.json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    logger.error(`Internal login error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// --- Public / Protected CRUD ---

exports.getAllUsers = async (req, res) => {
  try {
    // 1. Extrair todos os filtros possíveis da URL
    const { role, type, email, name } = req.query;
    let query = {};
    
    // 2. Filtro por Role/Type 
    // Aceita tanto 'role' como 'type' na URL para filtrar o campo 'type' da BD
    const filterRole = role || type;
    if (filterRole) {
      if (!["admin", "user"].includes(filterRole)) {
         return res.status(400).json({ message: "Invalid role filter. Use 'admin' or 'user'." });
      }
      query.type = filterRole;
    }

    if (email) {
      query.email = email;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    logger.info(`User listing requested. Filter: ${JSON.stringify(query)}`);
    
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error listing users: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ID format validation (Prevents Mongoose CastError)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format." });
    }

    logger.info(`Getting details for user ID: ${id}`);
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    logger.error(`Error getting user ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// --- Admin CRUD ---

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    const adminId = req.userId; 

    // 1. Mandatory Fields Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // 2. Duplicate Email Validation (Before attempting to save)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "The provided email is already registered." });
    }

    // 3. Role Validation (if provided)
    const validRoles = ["user", "admin"];
    const userType = type || "user"; // Default
    if (!validRoles.includes(userType)) {
        return res.status(400).json({ message: "Invalid user type." });
    }

    logger.info(`Admin (ID: ${adminId}) creating new user: ${email} [${userType}]`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, type: userType });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`Error creating user by admin: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, role, email, ...dataToUpdate } = req.body;
    const adminId = req.userId;
    const targetId = req.params.id;

    // 1. ID Validation
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "Invalid ID format." });
    }

    // 2. If attempting to change email, check if it already exists in another user
    if (email) {
        const existingUser = await User.findOne({ email });
        // If a user with this email exists AND it is not the user we are editing
        if (existingUser && existingUser._id.toString() !== targetId) {
            return res.status(409).json({ message: "The provided email is already in use by another user." });
        }
        dataToUpdate.email = email;
    }

    logger.info(`Admin (ID: ${adminId}) updating user (ID: ${targetId})`);

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    if (role) {
      if (!["admin", "user"].includes(role)) {
          return res.status(400).json({ message: "Invalid role." });
      }
      dataToUpdate.type = role;
    }

    const updatedUser = await User.findByIdAndUpdate(targetId, dataToUpdate, {
      new: true,
      runValidators: true // Ensures Schema validations (like required) run on update
    }).select("-password");

    if (!updatedUser) {
      logger.warn(`Admin tried to update non-existent user (ID: ${targetId})`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const adminId = req.userId;
    const targetId = req.params.id;

    // 1. ID Validation
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "Invalid ID format." });
    }
    
    // 2. Optional: Prevent Admin from deleting themselves
    if (adminId === targetId) {
         return res.status(400).json({ message: "You cannot delete your own administrator account." });
    }

    logger.info(`Admin (ID: ${adminId}) removing user (ID: ${targetId})`);

    const deletedUser = await User.findByIdAndDelete(targetId);

    if (!deletedUser) {
      logger.warn(`Admin tried to remove non-existent user (ID: ${targetId})`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User removed successfully" });
  } catch (error) {
    logger.error(`Error removing user: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};