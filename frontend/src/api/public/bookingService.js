import axiosPublic from "./axiosPublic";

/* =========================
   PUBLIC BOOKINGS
========================= */

/**
 * Create a new booking (public, no auth required)
 * @param {Object} data - Booking details: tripId, fullName, phone, email, seats
 * @returns Axios Promise
 */
export const createBooking = (data) => {
  const token = localStorage.getItem("token");
  if (token) {
    return axiosPublic.post("/bookings", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  return axiosPublic.post("/bookings", data);
};

/**
 * Get a booking by reference
 * @param {string} bookingRef - Booking reference code (e.g., "XP-ABC123")
 * @returns Axios Promise
 */
export const getBookingByRef = (bookingRef) => {
  return axiosPublic.get(`/bookings/${bookingRef.toUpperCase()}`);
};

/* =========================
   ADMIN BOOKINGS
========================= */

/**
 * Get all bookings (admin dashboard)
 * Backend route: GET /api/bookings/admin
 */
export const getAllBookings = () => {
  return axiosPublic.get("/bookings/admin");
};

/**
 * Cancel a booking (admin)
 * Backend route: PUT /api/bookings/:bookingRef/cancel
 */
export const cancelBooking = (bookingRef) => {
  return axiosPublic.put(`/bookings/${bookingRef.toUpperCase()}/cancel`);
};

/* =========================
   COMPANY BOOKINGS
========================= */

/**
 * Get all bookings for a company
 * Backend route: GET /api/bookings/company
 */
export const getCompanyBookings = () => {
  return axiosPublic.get("/bookings/company");
};

/* =========================
   USER BOOKINGS
========================= */

/**
 * Get all bookings for the logged-in user
 * Backend route: GET /api/bookings/user
 */
export const getMyBookings = () => {
  return axiosPublic.get("/bookings/user");
};
