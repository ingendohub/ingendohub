const Company = require("../models/companyModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =====================================================
   REGISTER COMPANY
===================================================== */
exports.registerCompany = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if company exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await Company.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Company registered successfully",
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone
      }
    });

  } catch (error) {
    console.error("RegisterCompany error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   LOGIN COMPANY
===================================================== */
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find company
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: company._id, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone
      }
    });

  } catch (error) {
    console.error("LoginCompany error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET CURRENT COMPANY (FOR DASHBOARD)
===================================================== */
exports.getCurrentCompany = async (req, res) => {
  try {
    // req.company set by auth middleware
    const company = await Company.findById(req.company.id).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);

  } catch (error) {
    console.error("GetCurrentCompany error:", error);
    res.status(500).json({ message: "Server error" });
  }
};