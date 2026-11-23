import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { mailProvider } from "./services/mailer.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
}
const provider = mailProvider();
console.log(provider ? `Email notifications via ${provider}` : "No RESEND_API_KEY or SMTP credentials — email notifications disabled.");

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
