const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

/**
 * 🔐 Protect admin routes (JWT required)
 */
const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2️⃣ No token
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, token missing'
    });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Find admin
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        message: 'Admin not found'
      });
    }

    // 5️⃣ Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Admin account disabled'
      });
    }

    // 6️⃣ Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

/**
 * 🛡️ Extra guard (future roles support)
 */
const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({
      message: 'Admin access only'
    });
  }
  next();
};

module.exports = { protect, adminOnly };


