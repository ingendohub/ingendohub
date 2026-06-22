import { useParams } from 'react-router-dom';

const PaymentPage = () => {
  const { bookingId } = useParams();

  return (
    <section className="payment-page">
      <h2>Payment</h2>

      <p>Booking ID: {bookingId}</p>

      <button className="btn mtn">
        Pay with MTN MoMo
      </button>

      <button className="btn airtel">
        Pay with Airtel Money
      </button>
    </section>
  );
};

export default PaymentPage;