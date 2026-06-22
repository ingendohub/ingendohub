const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const generateToken = (admin) =>
  jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

// LOGIN (MVP)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      token: generateToken(admin)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

