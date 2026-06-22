const jwt = require("jsonwebtoken");
const Company = require("../models/companyModel"); // adjust path if needed

const protectCompany = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.companyId) {
        return res.status(401).json({ message: "Not authorized, invalid token payload" });
      }

      // Find company by ID
      const company = await Company.findById(decoded.companyId).select("-password");

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Attach company to request
      req.company = company;

      next(); // continue to the controller
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }
};

module.exports = { protectCompany };