import axios from "axios";

const axiosPublic = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001/api", // use env variable if available
  timeout: 15000, // 15 seconds timeout
  withCredentials: true, // include cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: global response/error interceptor
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Public Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosPublic;
