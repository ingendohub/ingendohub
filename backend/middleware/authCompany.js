const jwt = require("jsonwebtoken");
const Company = require("../models/companyModel");

const authCompany = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find company
    const company = await Company.findById(decoded.id).select("-password");
    if (!company) {
      return res.status(401).json({ message: "Company not found" });
    }

    // Attach company to request
    req.company = company;

    next();
  } catch (error) {
    console.error("AuthCompany error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authCompany;