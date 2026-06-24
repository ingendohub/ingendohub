const nodemailer = require('nodemailer');
const path = require('path');

const createTransporter = async () => {
  // If no SMTP host is provided, create a test Ethereal account
  if (!process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    console.log("⚠️ No SMTP config found. Using Ethereal Email test account.");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || '"Ingendohub Team" <no-reply@ingendohub.com>',
      to,
      subject,
      html,
      attachments
    });

    console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
    
    // Log preview URL if using Ethereal
    if (!process.env.SMTP_HOST) {
      console.log("🔗 Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};

/**
 * Send Booking Pending Email with payment link
 */
exports.sendBookingPendingEmail = async (booking, frontendUrl) => {
  const paymentLink = `${frontendUrl || 'http://localhost:3000'}/booking-summary/${booking.bookingRef}`;

  // Trip info (trip may be populated or just an object on booking)
  const trip = booking.trip || {};
  const tripFrom = trip.from || 'N/A';
  const tripTo   = trip.to   || 'N/A';
  const tripDate = trip.date ? new Date(trip.date).toDateString() : 'N/A';
  const tripTime = trip.time || 'N/A';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e7ef; border-radius: 12px; overflow: hidden;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0c1a06, #2e5c08); padding: 28px 32px; text-align: center;">
        <div style="background: #ffffff; border-radius: 12px; padding: 12px 24px; display: inline-block; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><img src="cid:logo" alt="Ingendohub" style="height: 36px; display: block; border: 0;" /></div>
        <p style="color: #e8f5c0; margin: 6px 0 0; font-size: 14px;">Your journey is almost ready!</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #0c1a06; margin-top: 0;">Booking Reserved Successfully!</h2>
        <p style="color: #334155;">Hello <strong>${booking.fullName}</strong>,</p>
        <p style="color: #334155;">Your seat has been reserved. Complete your payment within the next <strong>30 minutes</strong> to confirm your booking.</p>

        <!-- Trip Card -->
        <div style="background: #f4f7ee; border-left: 4px solid #6ea00a; border-radius: 8px; padding: 18px 22px; margin: 24px 0;">
          <p style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #0c1a06;">
            📍 ${tripFrom} &rarr; ${tripTo}
          </p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🗓️ <strong>Date:</strong> ${tripDate}</p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🕐 <strong>Departure:</strong> ${tripTime}</p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🎫 <strong>Seats:</strong> ${booking.seats}</p>
        </div>

        <!-- Summary -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <p style="margin: 6px 0; color: #334155;"><strong>Booking Ref:</strong> <span style="font-family: monospace; color: #6ea00a;">${booking.bookingRef}</span></p>
          <p style="margin: 6px 0; color: #334155;"><strong>Total Amount:</strong> <span style="font-size: 18px; font-weight: 700; color: #0c1a06;">${booking.totalPrice} ${booking.currency || 'RWF'}</span></p>
          <p style="margin: 6px 0; color: #334155;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: 600;">⏳ Pending Payment</span></p>
        </div>

        <a href="${paymentLink}" style="display: block; text-align: center; padding: 14px 28px; background-color: #6ea00a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">
          ✅ Complete Payment Now
        </a>
        <p style="margin-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">This link expires in 30 minutes.</p>
      </div>

      <!-- Customer Service -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px;">
        <p style="margin: 0 0 12px; font-weight: 700; color: #0f172a; font-size: 15px;">Need Help? Contact Us</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">📞 Phone / WhatsApp</td>
            <td style="padding: 6px 0; color: #6ea00a; font-size: 14px; font-weight: 600;"><a href="tel:+250788000000" style="color: #6ea00a; text-decoration: none;">+250 788 000 000</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">✉️ Email</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:support@ingendohub.rw" style="color: #6ea00a; text-decoration: none;">support@ingendohub.rw</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">💬 Live Chat</td>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">Available on our website 08:00 – 20:00</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">📘 Facebook</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="https://facebook.com/IngendohubRW" style="color: #6ea00a; text-decoration: none;">facebook.com/IngendohubRW</a></td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="background: #0c1a06; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; color: #a8d40e; font-size: 12px;">© ${new Date().getFullYear()} Ingendohub Rwanda · All rights reserved</p>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 11px;">If you did not request this booking, please ignore this email.</p>
      </div>

    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: `Action Required: Complete Payment for Booking ${booking.bookingRef}`,
    html,
    attachments: [{ filename: 'logo.png', path: path.join(__dirname, '../assets/logo.png'), cid: 'logo' }],
    attachments: [{ filename: 'logo.png', path: path.join(__dirname, '../assets/logo.png'), cid: 'logo' },
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'logo'
      }
    ]
  });
};

/**
 * Send confirmed ticket email with PDF attached
 */
exports.sendTicketEmail = async (booking, ticketBuffer) => {
  // Trip info
  const trip = booking.trip || {};
  const tripFrom = trip.from || 'N/A';
  const tripTo   = trip.to   || 'N/A';
  const tripDate = trip.date ? new Date(trip.date).toDateString() : 'N/A';
  const tripTime = trip.time || 'N/A';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e7ef; border-radius: 12px; overflow: hidden;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0c1a06, #6ea00a); padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">🚌 Ingendohub</h1>
        <p style="color: #e8f5c0; margin: 6px 0 0; font-size: 14px;">Your e-Ticket is ready!</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #0c1a06; margin-top: 0;">🎉 Booking Confirmed!</h2>
        <p style="color: #334155;">Hello <strong>${booking.fullName}</strong>,</p>
        <p style="color: #334155;">Your payment was successful and your booking is now confirmed. Your official e-Ticket is attached to this email. Please present it when boarding.</p>

        <!-- Trip Card -->
        <div style="background: #f4f7ee; border-left: 4px solid #6ea00a; border-radius: 8px; padding: 18px 22px; margin: 24px 0;">
          <p style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #0c1a06;">
            📍 ${tripFrom} &rarr; ${tripTo}
          </p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🗓️ <strong>Date:</strong> ${tripDate}</p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🕐 <strong>Departure:</strong> ${tripTime}</p>
          <p style="margin: 6px 0; color: #475569; font-size: 14px;">🎫 <strong>Seats:</strong> ${booking.seats}</p>
        </div>

        <!-- Summary -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <p style="margin: 6px 0; color: #334155;"><strong>Booking Ref:</strong> <span style="font-family: monospace; color: #6ea00a;">${booking.bookingRef}</span></p>
          <p style="margin: 6px 0; color: #334155;"><strong>Total Paid:</strong> <span style="font-size: 18px; font-weight: 700; color: #0c1a06;">${booking.totalPrice} ${booking.currency || 'RWF'}</span></p>
          <p style="margin: 6px 0; color: #334155;"><strong>Status:</strong> <span style="color: #6ea00a; font-weight: 600;">✅ Confirmed &amp; Paid</span></p>
        </div>

        <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: #713f12;">
          ⚠️ <strong>Important:</strong> Your e-Ticket (PDF) is attached. Please have it ready (printed or on your phone) when boarding your bus.
        </div>
      </div>

      <!-- Customer Service -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px;">
        <p style="margin: 0 0 12px; font-weight: 700; color: #0f172a; font-size: 15px;">Need Help? Contact Us</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">📞 Phone / WhatsApp</td>
            <td style="padding: 6px 0; color: #6ea00a; font-size: 14px; font-weight: 600;"><a href="tel:+250788000000" style="color: #6ea00a; text-decoration: none;">+250 788 000 000</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">✉️ Email</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:support@ingendohub.rw" style="color: #6ea00a; text-decoration: none;">support@ingendohub.rw</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">💬 Live Chat</td>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">Available on our website 08:00 – 20:00</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px;">📘 Facebook</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="https://facebook.com/IngendohubRW" style="color: #6ea00a; text-decoration: none;">facebook.com/IngendohubRW</a></td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="background: #0c1a06; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; color: #a8d40e; font-size: 12px;">© ${new Date().getFullYear()} Ingendohub Rwanda · All rights reserved</p>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 11px;">Safe travels from the Ingendohub team! 🌍</p>
      </div>

    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: `✅ Your E-Ticket for Booking ${booking.bookingRef} — ${tripFrom} → ${tripTo}`,
    html,
    attachments: [
      {
        filename: `Ticket-${booking.bookingRef}.pdf`,
        content: ticketBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

/**
 * Send Password Reset Email
 */
exports.sendPasswordResetEmail = async (userId, userEmail, userFullName, resetUrl) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e0e7ef; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0c1a06, #6ea00a); padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">🚌 Ingendohub</h1>
        <p style="color: #e8f5c0; margin: 6px 0 0; font-size: 14px;">Password Reset Request</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #0c1a06; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #334155;">Hello <strong>${userFullName || 'User'}</strong>,</p>
        <p style="color: #334155;">You requested to reset your password. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #6ea00a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">
            🔑 Reset Password
          </a>
        </div>

        <p style="margin-top: 12px; font-size: 14px; color: #475569;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>

      <!-- Footer -->
      <div style="background: #0c1a06; padding: 16px 32px; text-align: center;">
        <p style="margin: 0; color: #a8d40e; font-size: 12px;">© ${new Date().getFullYear()} Ingendohub Rwanda · All rights reserved</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Password Reset Request - Ingendohub',
    html
  });
};
