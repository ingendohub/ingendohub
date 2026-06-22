import { FiStar } from "react-icons/fi";

const Reviews = () => {
  return (
    <>
      <div className="dashboard-header">
        <h1>Rate & Review Us</h1>
        <p>Tell us how your trip went. We value your feedback!</p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 20px' }}>Write a Review</h3>
        <form className="dashboard-form">
          <div className="form-group-dash">
            <label>Rate your experience</label>
            <div style={{ display: 'flex', gap: 8, fontSize: 28, color: 'var(--primary)', cursor: 'pointer' }}>
              <FiStar /> <FiStar /> <FiStar /> <FiStar /> <FiStar />
            </div>
          </div>
          <div className="form-group-dash">
            <label>Detailed Feedback (Optional)</label>
            <textarea rows="4" placeholder="How was the ride? Was the driver professional?"></textarea>
          </div>
          <button type="button" className="btn-primary-dash">Submit Review</button>
        </form>
      </div>

      <h3 style={{ marginBottom: 16 }}>Your Past Reviews</h3>
      <div className="review-card">
        <div className="review-avatar">H</div>
        <div className="review-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Trip to Rubavu</h4>
            <div className="review-stars">
              <FiStar style={{ fill: 'currentColor' }} /><FiStar style={{ fill: 'currentColor' }} /><FiStar style={{ fill: 'currentColor' }} /><FiStar style={{ fill: 'currentColor' }} /><FiStar style={{ color: 'var(--muted)' }} />
            </div>
          </div>
          <p>The bus was very clean and departed right on time. Will travel with them again.</p>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Submitted on 2026-05-12</span>
        </div>
      </div>
    </>
  );
};

export default Reviews;
