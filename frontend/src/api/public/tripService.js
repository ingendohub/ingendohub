import axiosPublic from './axiosPublic';

/* ===============================
   PUBLIC TRIPS API
================================ */

/**
 * Get all available trips
 */
export const getPublicTrips = () => {
  return axiosPublic.get('/trips');
};

/**
 * Search trips
 * Example params:
 * { from, to, date }
 */
export const searchTrips = (params) => {
  return axiosPublic.get('/trips/search', { params });
};

/**
 * Get single trip by ID
 */
export const getTripById = (id) => {
  return axiosPublic.get(`/trips/${id}`);
};