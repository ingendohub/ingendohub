import axiosAdmin from './axiosAdmin';

/* =========================================
TRIPS – ADMIN SERVICES
========================================= */

/**

* Get all trips (Admin)
  */
  export const getTrips = () => {
  return axiosAdmin.get('/trips');
  };

/**

* Get single trip by ID (Admin)
* @param {string} id
  */
  export const getTripById = (id) => {
  return axiosAdmin.get(`/trips/${id}`);
  };

/**

* Create a new trip (Admin)
* @param {Object} tripData
  */
  export const createTrip = (tripData) => {
  return axiosAdmin.post('/trips', tripData);
  };

/**

* Update a trip (Admin)
* @param {string} id
* @param {Object} updateData
  */
  export const updateTripById = (id, updateData) => {
  return axiosAdmin.put(`/trips/${id}`, updateData);
  };

/**

* Delete a trip (Admin)
* @param {string} id
  */
  export const deleteTripById = (id) => {
  return axiosAdmin.delete(`/trips/${id}`);
  };
