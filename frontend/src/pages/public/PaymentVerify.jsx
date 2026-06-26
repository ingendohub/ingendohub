import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const txRef = searchParams.get("tx_ref");

    if (!txRef) {
      console.error("Missing tx_ref in URL");
      navigate("/payment/failed");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:3001/api"}/payments/verify`,
          {
            params: { tx_ref: txRef },
          }
        );

        if (res.data?.success) {
          navigate("/payment/success");
        } else {
          console.error("Payment verification failed:", res.data?.message);
          navigate("/payment/failed");
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error.response?.data || error.message
        );
        navigate("/payment/failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {loading ? (
        <>
          <h2>Verifying payment…</h2>
          <p>Please wait while we confirm your transaction.</p>
        </>
      ) : (
        <p>If you are not redirected automatically, please refresh the page.</p>
      )}
    </div>
  );
};

export default PaymentVerify;





