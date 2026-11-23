import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { isMailConfigured } from "./services/mailer.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
}
if (!isMailConfigured()) console.warn("SMTP_USER/SMTP_PASS not set — email notifications disabled.");

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
