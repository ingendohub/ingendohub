import { useState } from "react";
import { Routes, Route } from "react-router-dom";

/* ================= COMPONENTS ================= */
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import ProtectedRoute from "./components/ProtectedRoute";

/* ================= CONTEXT ================= */
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/public/Home";
import AvailableBuses from "./pages/public/AvailableBuses";
import AboutUs from "./pages/public/AboutUs";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsConditions from "./pages/public/TermsConditions";
import NotFound from "./pages/public/NotFound";
import ResetPassword from "./pages/public/ResetPassword";
import AuthCallback from "./pages/public/AuthCallback";


/* ================= BOOKING COMPONENTS ================= */
import BookingPage from "./components/BookingPage";
import BookingSummary from "./components/BookingSummary";

/* ================= PAYMENT PAGES ================= */
import PaymentVerify from "./pages/public/PaymentVerify";
import PaymentSuccess from "./pages/public/PaymentSuccess";
import PaymentFailed from "./pages/public/PaymentFailed";

/* ================= TICKET PAGE ================= */
import TicketPage from "./pages/ticket/TicketPage";

/* ================= USER PAGES ================= */
import DashboardHome from "./pages/user/DashboardHome";
import MyTrips from "./pages/user/MyTrips";
import Payments from "./pages/user/Payments";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";
import Reviews from "./pages/user/Reviews";

/* ================= DASHBOARD LAYOUT ================= */
import DashboardLayout from "./layouts/DashboardLayout";

/* ================= ADMIN PAGES ================= */
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";

/* ================= COMPANY DASHBOARD ================= */
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Overview from "./pages/company/Overview";
import Trips from "./pages/company/Trips";
import CreateTrip from "./pages/company/CreateTrip";
import Buses from "./pages/company/Buses";
import CompanyBookings from "./pages/company/CompanyBookings";
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyRegister from "./pages/company/CompanyRegister.jsx"; // make sure file exists

/* ================= PAYMENT/TICKET WRAPPERS ================= */
const PaymentSuccessWrapper = (props) => <PaymentSuccess {...props} />;
const TicketPageWrapper = (props) => <TicketPage {...props} />;

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app-container">

        {/* ================= HEADER ================= */}
        <Header
          onOpenLogin={() => setLoginOpen(true)}
          onOpenSignup={() => setSignupOpen(true)}
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="main-content">
          <Routes>

            {/* ============== PUBLIC ROUTES ============== */}
            <Route path="/" element={<Home />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/available-buses" element={<AvailableBuses />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            {/* ============== COMPANY AUTH ================= */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/company/register" element={<CompanyRegister />} /> {/* NEW */}

            {/* ============== COMPANY DASHBOARD ================= */}
            <Route
              path="/company"
              element={
                <ProtectedRoute type="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="trips" element={<Trips />} />
              <Route path="trips/create" element={<CreateTrip />} />
              <Route path="buses" element={<Buses />} />
              <Route path="bookings" element={<CompanyBookings />} />
            </Route>

            {/* ============== USER DASHBOARD ================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute type="user">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="my-trips" element={<MyTrips />} />
              <Route path="payments" element={<Payments />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="booking/:tripId" element={<BookingPage />} />
              <Route path="booking-summary/:bookingRef" element={<BookingSummary />} />
              <Route path="payment-success/:tx_ref" element={<PaymentSuccess />} />
              <Route path="ticket/:tx_ref" element={<TicketPage />} />
            </Route>

            {/* ============== GUEST BOOKING FLOW ================= */}
            <Route path="/booking/:tripId" element={<BookingPage />} />
            <Route path="/booking-summary/:bookingRef" element={<BookingSummary />} />

            {/* ============== PUBLIC PAYMENT FLOW ================= */}
            <Route path="/payment/verify" element={<PaymentVerify />} />
            <Route path="/payment/success/:tx_ref" element={<PaymentSuccessWrapper />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />

            {/* ============== TICKET DOWNLOAD ================= */}
            <Route path="/ticket/:tx_ref" element={<TicketPageWrapper />} />

            {/* ============== ADMIN ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />

            {/* ============== 404 PAGE ================= */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </main>

        {/* ================= FOOTER ================= */}
        <Footer />

        {/* ================= AUTH MODALS ================= */}
        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSwitchSignup={() => {
            setLoginOpen(false);
            setSignupOpen(true);
          }}
        />
        <SignupModal
          isOpen={signupOpen}
          onClose={() => setSignupOpen(false)}
          onSwitchLogin={() => {
            setSignupOpen(false);
            setLoginOpen(true);
          }}
        />

      </div>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;










