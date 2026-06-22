import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiMail, FiPhone, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { useLang } from "../../i18n/LanguageContext";

const Contact = () => {
  const { t } = useLang();
  const token = localStorage.getItem("token") || localStorage.getItem("companyToken");
  const isLoggedIn = !!token;

  const [guestView, setGuestView] = useState("welcome"); // 'welcome' | 'booking-details'

  const handleSignIn = () => {
    // A quick fallback to trigger sign in modal, since it's mounted in App via Header
    const loginBtn = document.querySelector('.guest-dropdown-signin') || document.querySelector('.mobile-login-icon');
    if (loginBtn) {
      loginBtn.click();
    } else {
      const profileBtn = document.querySelector('.guest-profile-btn');
      if (profileBtn) profileBtn.click();
      setTimeout(() => {
        const signin = document.querySelector('.guest-dropdown-signin');
        if (signin) signin.click();
      }, 100);
    }
  };

  if (!isLoggedIn) {
    if (guestView === "booking-details") {
      return (
        <main className="content-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--heading)' }}>Help Centre</h1>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--heading)' }}>Enter booking details</h2>
            <p style={{ color: 'var(--text)', marginBottom: '24px', fontSize: '15px' }}>
              We just need your confirmation number and PIN code. You'll find them on top of your confirmation email.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: 'var(--heading)' }}>Confirmation number*</label>
              <input type="text" placeholder="Ex. 1234567890" style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: 'var(--heading)' }}>PIN code*</label>
              <input type="text" placeholder="Ex. 1234" style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }} />
            </div>
            
            <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px' }}>
              Continue
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
                Find your booking details
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
           <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
              Resend confirmation email
            </button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--heading)' }}>Need to talk to someone?</h3>
            <p style={{ color: 'var(--text)', marginBottom: '24px', fontSize: '15px' }}>
              If you can't find your booking details, please sign in or create an account to contact Customer Service.
            </p>
            <button className="btn-outline" onClick={handleSignIn} style={{ padding: '10px 24px' }}>
              Sign in
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="content-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--heading)' }}>Help Centre</h1>
        
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '16px', borderRadius: '8px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <FiAlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Stay safe online</strong>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Please check your payment policy. Ingendohub will never ask for your account or payment info by phone, email or chat (e.g. WhatsApp). If in doubt, please report it to Ingendohub.
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--heading)' }}>Welcome to the Help Centre</h2>
          <p style={{ color: 'var(--text)', marginBottom: '24px', fontSize: '15px' }}>
            Sign in to contact Customer Service, we're available 24 hours a day
          </p>

          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <FiMessageSquare size={24} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--heading)' }}>Send us a message</h3>
                <p style={{ color: 'var(--text)', fontSize: '14px', margin: 0 }}>Contact our agents about your booking, and we'll reply as soon as possible.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <FiPhone size={24} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--heading)' }}>Call us</h3>
                <p style={{ color: 'var(--text)', fontSize: '14px', margin: 0 }}>For anything urgent, you can call us 24/7 on a local or international phone number.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleSignIn} style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '8px' }}>
              Sign in
            </button>
            <button className="btn-outline" onClick={() => setGuestView("booking-details")} style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '8px' }}>
              Continue without an account
            </button>
          </div>
        </div>
      </main>
    );
  }

  // LOGGED IN VIEW
  return (
    <main className="content-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--heading)' }}>Customer Service</h1>
      <p style={{ color: 'var(--text)', marginBottom: '32px', fontSize: '16px' }}>
        Contact our agents about your booking, and we'll reply as soon as possible.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <a href="#chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--heading)', transition: 'all 0.2s' }} className="contact-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FiMessageSquare size={24} color="var(--primary)" />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Live Chat</span>
          </div>
          <FiChevronRight size={20} color="var(--border)" />
        </a>

        <a href="https://wa.me/250780000000" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--heading)', transition: 'all 0.2s' }} className="contact-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FiMessageSquare size={24} color="var(--primary)" />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>WhatsApp</span>
          </div>
          <FiChevronRight size={20} color="var(--border)" />
        </a>

        <a href="mailto:support@ingendohub.com" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--heading)', transition: 'all 0.2s' }} className="contact-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FiMail size={24} color="var(--primary)" />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Email Us</span>
          </div>
          <FiChevronRight size={20} color="var(--border)" />
        </a>

        <a href="tel:+250780000000" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--heading)', transition: 'all 0.2s' }} className="contact-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FiPhone size={24} color="var(--primary)" />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Call Us</span>
          </div>
          <FiChevronRight size={20} color="var(--border)" />
        </a>
      </div>
      <style>{`
        .contact-card:hover {
          background: var(--primary-soft) !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </main>
  );
};

export default Contact;
