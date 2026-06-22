require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

// ================= DATABASE =================
connectDB();

// ================= EXPRESS =================
const app = express();
const PORT = process.env.PORT || 3001;

// ================= DEBUG LOGGER =================
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// ================= SECURITY =================
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ================= RATE LIMITERS =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Please try again later.",
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: "Too many requests. Please slow down.",
});

// ================= BODY PARSERS =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= SAFE REQUIRE =================
const safeRequire = (path) => {
  try {
    const route = require(path);
    console.log(`✅ Loaded: ${path}`);
    return route;
  } catch (err) {
    console.warn(`❌ Missing route file: ${path}`);
    return null;
  }
};

// ================= ROUTES =================

// Company
const companyAuthRoutes = safeRequire("./routes/companyAuthRoutes");
const companyRoutes = safeRequire("./routes/companyRoutes");

// Core resources
const tripRoutes = safeRequire("./routes/tripRoutes");
const busRoutes = safeRequire("./routes/busRoutes");

// Bookings
const publicBookingRoutes = safeRequire("./routes/publicBookingRoutes");
const companyBookingRoutes = safeRequire("./routes/companyBookingRoutes");
const userBookingRoutes = safeRequire("./routes/userBookingRoutes");
const adminBookingRoutes = safeRequire("./routes/adminBookingRoutes");

// Payments & Tickets
const paymentRoutes = safeRequire("./routes/paymentRoutes");
const ticketRoutes = safeRequire("./routes/ticketRoutes");

// Auth (users)
const authRoutes = safeRequire("./routes/authRoutes");

// Admin
const adminRoutes = safeRequire("./routes/adminRoutes");

// User profile
const userRoutes = safeRequire("./routes/userRoutes");

// Company buses
const companyBusRoutes = safeRequire("./routes/companyBusRoutes");

// Company dashboard
const companyDashboardRoutes = safeRequire("./routes/companyDashboardRoutes");

// ================= COMPANY =================
if (companyAuthRoutes) {
  app.use("/api/company/auth", authLimiter, companyAuthRoutes);
}

if (companyRoutes) {
  app.use("/api/company", generalLimiter, companyRoutes);
}

// ================= CORE PUBLIC DATA =================
// ✅ THIS is where trips come from
if (tripRoutes) {
  app.use("/api/trips", generalLimiter, tripRoutes);
}

if (busRoutes) {
  app.use("/api/buses", generalLimiter, busRoutes);
}

// ================= BOOKINGS =================
// Public bookings (no auth)
if (publicBookingRoutes) {
  app.use("/api/bookings", generalLimiter, publicBookingRoutes);
}

// Company bookings
if (companyBookingRoutes) {
  app.use("/api/bookings/company", generalLimiter, companyBookingRoutes);
}

// User bookings
if (userBookingRoutes) {
  app.use("/api/bookings/user", generalLimiter, userBookingRoutes);
}

// Admin bookings
if (adminBookingRoutes) {
  app.use("/api/bookings/admin", generalLimiter, adminBookingRoutes);
}

// ================= PAYMENTS =================
if (paymentRoutes) {
  app.use("/api/payments", generalLimiter, paymentRoutes);
}

// ================= TICKETS =================
if (ticketRoutes) {
  app.use("/api/ticket", generalLimiter, ticketRoutes);
}

// ================= AUTH (USERS) =================
if (authRoutes) {
  app.use("/api/auth", authLimiter, authRoutes);
}

// ================= ADMIN =================
if (adminRoutes) {
  app.use("/api/admin", generalLimiter, adminRoutes);
}

// ================= USER PROFILE =================
if (userRoutes) {
  app.use("/api/user", generalLimiter, userRoutes);
}

// ================= COMPANY BUSES =================
if (companyBusRoutes) {
  app.use("/api/company/buses", generalLimiter, companyBusRoutes);
}

// ================= COMPANY DASHBOARD =================
if (companyDashboardRoutes) {
  app.use("/api/company/dashboard", generalLimiter, companyDashboardRoutes);
}

// ================= TEST ROUTE =================
app.post("/api/bookings/test", (req, res) => {
  res.json({ message: "Booking route is reachable ✅" });
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🚀 Xpresi backend running");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  console.warn(`❌ 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Xpresi server running on port ${PORT}`);
});















