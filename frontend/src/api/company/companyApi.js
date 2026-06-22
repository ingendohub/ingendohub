import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
const companyApi = axios.create({
  baseURL: "http://localhost:3001/api/company",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ================= REQUEST INTERCEPTOR ================= */
companyApi.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const token = localStorage.getItem("companyToken")?.trim();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "companyApi request:",
      config.method?.toUpperCase(),
      config.url
    );

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
companyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    console.error("companyApi response error:", status, error.response?.data);

    if (status === 401) {
      localStorage.removeItem("companyToken");
      localStorage.removeItem("company");
      window.location.href = "/company/login";
    }

    return Promise.reject(error);
  }
);

/* ================= COMPANY API METHODS ================= */
const companyService = {
  /* 🔐 AUTH */
  login: (data) => companyApi.post("/auth/login", data),
  register: (data) => companyApi.post("/auth/register", data),

  /* ================= 🚌 BUSES ================= */

  getBuses: async () => {
    const res = await companyApi.get("/buses");
    return res.data || [];
  },

  createBus: (data) => companyApi.post("/buses", data),

  deleteBus: (id) => companyApi.delete(`/buses/${id}`),

  /* ================= 🧭 TRIPS ================= */

  getTrips: async () => {
    const res = await companyApi.get("/trips");

    return (res.data.trips || []).map((t) => ({
      _id: t._id,
      from: t.from,
      to: t.to,
      date: t.date,
      time: t.time,
      price: t.price,
      availableSeats: t.availableSeats,
      bus: t.bus
        ? {
            _id: t.bus._id,
            plateNumber: t.bus.plateNumber,
            seats: t.bus.seats
          }
        : null
    }));
  },

  createTrip: (data) => companyApi.post("/trips", data),

  deleteTrip: (id) => companyApi.delete(`/trips/${id}`),

  /* ================= 🎫 BOOKINGS ================= */

  getBookings: async () => {
    const res = await companyApi.get("/bookings");

    return (res.data.bookings || []).map((b) => ({
      _id: b._id,
      trip: {
        _id: b.trip?._id,
        from: b.trip?.from,
        to: b.trip?.to,
        date: b.trip?.date,
        time: b.trip?.time,
        price: b.trip?.price,
        availableSeats: b.trip?.availableSeats,
        bus: b.trip?.bus
          ? {
              _id: b.trip.bus._id,
              plateNumber: b.trip.bus.plateNumber,
              seats: b.trip.bus.seats
            }
          : null
      },
      seats: b.seats,
      totalPrice: b.totalPrice
    }));
  },

  /* ================= 📊 DASHBOARD ================= */

  getDashboard: async () => {
    const res = await companyApi.get("/dashboard/stats");

    return {
      buses: res.data.totalBuses || 0,
      trips: res.data.totalTrips || 0,
      bookings: res.data.totalBookings || 0,
      revenue: res.data.totalRevenue || 0
    };
  }
};

export default companyService;
