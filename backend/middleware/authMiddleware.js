const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");

/* =====================================================
   🔐 ADMIN PROTECTION
===================================================== */
const protectAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "Not authorized, no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) return res.status(401).json({ message: "Admin does not exist" });

    req.admin = admin;
    next();
  } catch (error) {
    console.error("protectAdmin error:", error);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

/* =====================================================
   👤 USER PROTECTION
===================================================== */
const protectUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "Not authorized, no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User does not exist" });
    if (user.isBlocked) return res.status(403).json({ message: "Account blocked" });

    req.user = user;
    next();
  } catch (error) {
    console.error("protectUser error:", error);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

/* =====================================================
   🤷 OPTIONAL USER 
===================================================== */
const optionalUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && !user.isBlocked) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};

/* =====================================================
   🔒 ADMIN ONLY GUARD
===================================================== */
const adminOnly = (req, res, next) => {
  if (!req.admin) return res.status(403).json({ message: "Access denied: admin only" });
  next();
};

/* =====================================================
   🏢 COMPANY PROTECTION
===================================================== */
const protectCompany = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Use the correct key from JWT payload
    const companyId = decoded.companyId || decoded.id; 
    const company = await Company.findById(companyId).select("-password");

    if (!company) return res.status(404).json({ message: "Company not found" });

    req.company = company;
    next();
  } catch (error) {
    console.error("protectCompany error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

/* =====================================================
   🔑 EXPORTS
===================================================== */
module.exports = {
  protectAdmin,
  protectUser,
  optionalUser,
  adminOnly,
  protectCompany
};




