import nodemailer from "nodemailer";

// Email notifications for new contact messages.
// Preferred: Resend (HTTPS API — works on Render's free plan, which blocks SMTP ports).
// Fallback: SMTP (e.g. Gmail with an App Password) when RESEND_API_KEY is not set.

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function buildEmail({ name, email, message }) {
  return {
    subject: `New portfolio message from ${name}`,
    text: `${message}\n\n— ${name} <${email}>\n\nReply to this email to respond directly.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">New message from your portfolio</h2>
        <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <div style="white-space:pre-wrap;background:#f4f6fa;border-radius:8px;padding:14px">${escapeHtml(message)}</div>
        <p style="color:#667;font-size:13px;margin-top:16px">Hit reply to respond directly to ${escapeHtml(name)}.</p>
      </div>`,
  };
}

// ---------- Resend ----------
async function sendWithResend(data) {
  const { subject, text, html } = buildEmail(data);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // onboarding@resend.dev works without a domain, but only delivers to your Resend account's email
        from: process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO],
        reply_to: data.email,
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return true;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- SMTP fallback ----------
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast instead of hanging ~2 min if the SMTP port is blocked
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

async function sendWithSmtp(data) {
  const { subject, text, html } = buildEmail(data);
  await getTransporter().sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO || process.env.SMTP_USER,
    replyTo: `"${data.name}" <${data.email}>`,
    subject,
    text,
    html,
  });
  return true;
}

// ---------- Public API ----------
export function mailProvider() {
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO) return "resend";
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  return null;
}

export const isMailConfigured = () => mailProvider() !== null;

export async function sendContactEmail(data) {
  const provider = mailProvider();
  if (provider === "resend") return sendWithResend(data);
  if (provider === "smtp") return sendWithSmtp(data);
  return false;
}
