import { Router } from "express";
import rateLimit from "express-rate-limit";
import Message from "../models/Message.js";
import { isDBConnected } from "../config/db.js";
import { sendContactEmail } from "../services/mailer.js";

const router = Router();

// 5 submissions per IP every 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again later." },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const errors = [];
  if (!name || name.length > 100) errors.push("Name is required (max 100 characters).");
  if (!EMAIL_RE.test(email) || email.length > 200) errors.push("A valid email is required.");
  if (message.length < 5 || message.length > 5000) errors.push("Message must be 5–5000 characters.");
  return { errors, data: { name, email, message } };
}

router.post("/", limiter, async (req, res) => {
  // Honeypot field: real users never fill it, bots usually do
  if (req.body?.website) return res.status(200).json({ ok: true });

  const { errors, data } = validate(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  let stored = false;

  if (isDBConnected()) {
    try {
      await Message.create({ ...data, ip: req.ip, userAgent: req.get("user-agent") });
      stored = true;
    } catch (err) {
      console.error("Failed to store message:", err.message);
    }
  }

  // Once the message is safely stored, reply immediately and send the email
  // notification in the background so a slow/blocked SMTP server never delays the user.
  if (stored) {
    res.status(201).json({ ok: true });
    sendContactEmail(data).catch((err) => console.error("Failed to send email:", err.message));
    return;
  }

  // No database: email is the only delivery path, so wait for it.
  try {
    if (await sendContactEmail(data)) return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
  res.status(503).json({ error: "Message could not be delivered right now. Please email me directly." });
});

export default router;
