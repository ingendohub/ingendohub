const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/adminModel');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const newPassword = "admin123";
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await Admin.updateOne(
      { email: "djbrlniyonkuru@gmail.com" },
      { $set: { password: hashed, isActive: true } }
    );

    console.log("✅ Password updated:", result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();