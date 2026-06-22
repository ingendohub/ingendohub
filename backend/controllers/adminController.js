const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT
 */
const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * REGISTER ADMIN (use once, then disable route)
 */
exports.registerAdmin = async (req, res) => {
  try {
    console.log("===== REGISTER ADMIN =====");
    console.log("REQ BODY:", req.body);

    const { username, email, password } = req.body;

    // 🔒 Validate input
    if (!username || !email || !password) {
      console.log("❌ Missing username, email, or password");
      return res.status(400).json({
        message: 'Username, email, and password are required',
      });
    }

    // 🔁 Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    console.log("ADMIN EXISTS:", adminExists ? "YES" : "NO");

    if (adminExists) {
      return res.status(400).json({
        message: 'Admin with this email already exists',
      });
    }

    // ✅ Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
    });

    console.log("✅ Admin registered successfully");

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('🔥 Error in registerAdmin:', error);
    res.status(500).json({
      message: 'Server error while registering admin',
    });
  }
};

/**
 * LOGIN ADMIN (EMAIL + PASSWORD)
 */
exports.loginAdmin = async (req, res) => {
  try {
    console.log("===== LOGIN ADMIN DEBUG =====");
    console.log("REQ BODY:", req.body); // Check if body is received

    const { email, password } = req.body || {};
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // 🔍 Find admin
    const admin = await Admin.findOne({ email, isActive: true });
    console.log("ADMIN FOUND:", admin ? "YES" : "NO", admin);

    if (!admin) {
      console.log("❌ Admin not found or inactive");
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // 🔑 Compare password
    const isMatch = await admin.matchPassword(password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // 🔐 Generate token
    const token = generateToken(admin._id);

    console.log("✅ Login successful, token generated");

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("🔥 ERROR in loginAdmin:", error);
    res.status(500).json({
      message: 'Server error during login',
    });
  }
};





