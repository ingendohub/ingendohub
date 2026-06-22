require("dotenv").config();
const jwt = require("jsonwebtoken");

const companyId = "69afd79eae23190b89b3861f"; // your company _id
const token = jwt.sign({ id: companyId }, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("Company JWT:", token);