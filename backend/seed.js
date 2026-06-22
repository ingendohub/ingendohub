require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const User = require("./models/userModel");
const Company = require("./models/companyModel");
const Bus = require("./models/busModel");
const Trip = require("./models/tripModel");
const Booking = require("./models/bookingModel");
const Admin = require("./models/adminModel");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Bus.deleteMany({}),
      Trip.deleteMany({}),
      Booking.deleteMany({}),
      Admin.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // 1. Create admin
    const admin = await Admin.create({
      username: "admin",
      email: "admin@xpresi.com",
      password: "admin123",
    });
    console.log("Admin created:", admin.email);

    // 2. Create users
    const users = await User.create([
      { fullName: "Alice Uwimana", email: "alice@test.com", phone: "+250781111111", password: await bcrypt.hash("password123", 10) },
      { fullName: "Bob Mugisha", email: "bob@test.com", phone: "+250782222222", password: await bcrypt.hash("password123", 10) },
    ]);
    console.log("Users created:", users.length);

    // 3. Create companies
    const companies = await Company.create([
      { name: "Horizon Express", email: "horizon@xpresi.com", password: await bcrypt.hash("company123", 10), phone: "+250783333333", address: "Kigali, Rwanda" },
      { name: "Volcano Buses", email: "volcano@xpresi.com", password: await bcrypt.hash("company123", 10), phone: "+250784444444", address: "Musanze, Rwanda" },
    ]);
    console.log("Companies created:", companies.length);

    // 4. Create buses
    const buses = await Bus.create([
      { model: "Toyota Hiace", plateNumber: "RAB 001 A", seats: 18, company: companies[0]._id },
      { model: "Scania Interlink", plateNumber: "RAB 002 B", seats: 45, company: companies[0]._id },
      { model: "Isuzu NJD", plateNumber: "RAB 003 C", seats: 30, company: companies[1]._id },
      { model: "Toyota Coaster", plateNumber: "RAB 004 D", seats: 26, company: companies[1]._id },
    ]);
    console.log("Buses created:", buses.length);

    // 5. Create trips
    const today = new Date();
    const trips = await Trip.create([
      { company: companies[0]._id, bus: buses[0]._id, from: "KIGALI", to: "MUSANZE", date: new Date(today.getTime() + 86400000), time: "06:00", price: 5000, totalSeats: 18, availableSeats: 18 },
      { company: companies[0]._id, bus: buses[1]._id, from: "KIGALI", to: "GITARAMA", date: new Date(today.getTime() + 86400000), time: "07:30", price: 3000, totalSeats: 45, availableSeats: 45 },
      { company: companies[0]._id, bus: buses[0]._id, from: "MUSANZE", to: "KIGALI", date: new Date(today.getTime() + 86400000), time: "14:00", price: 5000, totalSeats: 18, availableSeats: 18 },
      { company: companies[1]._id, bus: buses[2]._id, from: "KIGALI", to: "RUBENGERA", date: new Date(today.getTime() + 86400000 * 2), time: "05:00", price: 8000, totalSeats: 30, availableSeats: 30 },
      { company: companies[1]._id, bus: buses[3]._id, from: "KIGALI", to: "GISENYI", date: new Date(today.getTime() + 86400000 * 2), time: "08:00", price: 6000, totalSeats: 26, availableSeats: 26 },
      { company: companies[1]._id, bus: buses[2]._id, from: "RUBENGERA", to: "KIGALI", date: new Date(today.getTime() + 86400000 * 3), time: "15:00", price: 8000, totalSeats: 30, availableSeats: 30 },
      { company: companies[0]._id, bus: buses[1]._id, from: "GITARAMA", to: "KIGALI", date: new Date(today.getTime() + 86400000 * 3), time: "16:00", price: 3000, totalSeats: 45, availableSeats: 45 },
    ]);
    console.log("Trips created:", trips.length);

    console.log("\n===== SEED COMPLETE =====");
    console.log("Admin: admin@xpresi.com / admin123");
    console.log("Users: alice@test.com / password123, bob@test.com / password123");
    console.log("Companies: horizon@xpresi.com / company123, volcano@xpresi.com / company123");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
