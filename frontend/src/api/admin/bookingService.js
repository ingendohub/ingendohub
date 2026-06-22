import axiosAdmin from "./axiosAdmin";

/**
 * GET ALL BOOKINGS
 */
export const getAllBookings = () => {
  return axiosAdmin.get("/admin/bookings");
};

/**
 * CANCEL BOOKING
 */
export const cancelBooking = (bookingId) => {
  return axiosAdmin.patch(`/admin/bookings/${bookingId}/cancel`);
};