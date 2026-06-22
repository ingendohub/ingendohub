const getBackendUrl = () =>
  (process.env.BACKEND_URL || "http://localhost:3001").replace(/\/+$/, "");

const buildTicketVerificationUrl = (ticketNumber) =>
  `${getBackendUrl()}/api/ticket/verify/${encodeURIComponent(ticketNumber)}`;

module.exports = {
  buildTicketVerificationUrl,
};
