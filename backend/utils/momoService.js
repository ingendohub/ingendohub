const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const MOMO_BASE_URL = "https://sandbox.momodeveloper.mtn.com";
const PRIMARY_KEY = process.env.Primary_key; // Subscription Key for Collections

// In-memory cache for API User & Key (in production, store in DB or env)
let cachedApiUser = null;
let cachedApiKey = null;
let cachedToken = null;
let tokenExpiry = null;

// Ensure local backend URL is available
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

/**
 * 1. Provision a Sandbox API User
 */
const provisionApiUser = async () => {
  if (cachedApiUser && cachedApiKey) return { apiUser: cachedApiUser, apiKey: cachedApiKey };

  try {
    const referenceId = crypto.randomUUID(); // the new API User UUID v4
    
    console.log("Provisioning new MoMo Sandbox API User:", referenceId);

    // Call POST /v1_0/apiuser
    await axios.post(
      `${MOMO_BASE_URL}/v1_0/apiuser`,
      { providerCallbackHost: BACKEND_URL.replace("http://", "").replace("https://", "") },
      {
        headers: {
          "X-Reference-Id": referenceId,
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // wait briefly for the sandbox to register the user
    await new Promise((res) => setTimeout(res, 2000));

    // Call POST /v1_0/apiuser/{X-Reference-Id}/apikey
    console.log("Fetching API Key for user:", referenceId);
    const keyRes = await axios.post(
      `${MOMO_BASE_URL}/v1_0/apiuser/${referenceId}/apikey`,
      {},
      {
        headers: {
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
        },
      }
    );

    cachedApiUser = referenceId;
    cachedApiKey = keyRes.data.apiKey;

    console.log("MoMo API User provisioned successfully.");
    return { apiUser: cachedApiUser, apiKey: cachedApiKey };
  } catch (error) {
    console.error("Momo Provisioning Error:", error.response?.data || error.message);
    throw new Error("Failed to provision MoMo API User");
  }
};

/**
 * 2. Get Bearer Token
 */
const getAuthToken = async () => {
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    return cachedToken;
  }

  const { apiUser, apiKey } = await provisionApiUser();
  const authHeader = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  try {
    console.log("Requesting MoMo Bearer Token...");
    const res = await axios.post(
      `${MOMO_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    cachedToken = res.data.access_token;
    // Token is usually valid for 3600 seconds, save with 5 min buffer
    tokenExpiry = new Date(new Date().getTime() + (res.data.expires_in - 300) * 1000);
    return cachedToken;
  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    throw new Error("Failed to get MoMo Auth Token");
  }
};

/**
 * 3. Request To Pay (USSD Prompt to User)
 */
exports.requestToPay = async ({ amount, currency, phone, externalId, payerMessage }) => {
  const token = await getAuthToken();
  const tx_ref = crypto.randomUUID(); // Transaction UUID

  // Format phone (MTN Sandbox uses specific test numbers like 46733123453 or standard international ones without '+')
  // We will pass the phone number directly
  let formattedPhone = phone.replace("+", "");

  try {
    console.log(`Sending MoMo RequestToPay for ${formattedPhone}...`);
    await axios.post(
      `${MOMO_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: currency || "EUR", // MTN Sandbox often requires EUR for generic testing, but we try the passed currency
        externalId: externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: formattedPhone,
        },
        payerMessage: payerMessage || "Bus Ticket Payment",
        payeeNote: "Quickbook System",
      },
      {
        headers: {
          "X-Reference-Id": tx_ref,
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
          "X-Target-Environment": "sandbox",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Returns the reference ID we used to query status later
    return { tx_ref, status: "PENDING_MOMO" };
  } catch (error) {
    console.error("RequestToPay Error:", error.response?.data || error.message);
    throw new Error("MoMo Request to Pay failed");
  }
};

/**
 * 4. Get Payment Status (For Polling)
 */
exports.getPaymentStatus = async (tx_ref) => {
  const token = await getAuthToken();

  try {
    const res = await axios.get(
      `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${tx_ref}`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": PRIMARY_KEY,
          "X-Target-Environment": "sandbox",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // status can be SUCCESSFUL, PENDING, FAILED, REJECTED
    return res.data.status; 
  } catch (error) {
    console.error("Payment Status Error:", error.response?.data || error.message);
    throw new Error("Could not fetch MoMo transaction status");
  }
};
