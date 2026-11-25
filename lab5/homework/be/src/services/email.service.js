// Real email delivery through Gmail SMTP.
// Requires GMAIL_USER + GMAIL_APP_PASSWORD (App Password, not the login password).
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

async function sendMail(to, subject, html) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`[EMAIL] GMAIL_USER/GMAIL_APP_PASSWORD not set, skipped: "${subject}" -> ${to}`);
    return;
  }
  try {
    const info = await mailer.sendMail({
      from: `"ShopAdmin" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('[EMAIL] sent:', info.messageId, '->', to);
  } catch (error) {
    // A failed email must never fail the API request that triggered it
    console.error('[EMAIL] failed:', error.message);
  }
}

module.exports = { sendMail };
