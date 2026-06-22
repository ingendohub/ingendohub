import companyApi from "./companyApi";

export const getDashboardStats = () => {
  return companyApi.get("/dashboard/stats");
};

export const getCompanyTrips = () => {
  return companyApi.get("/trips");
};

export const getCompanyBuses = () => {
  return companyApi.get("/buses");
};

export const getCompanyBookings = () => {
  return companyApi.get("/bookings");
};