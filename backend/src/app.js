import express from "express";
import cors from "cors";
import helmet from "helmet";
import contactRouter from "./routes/contact.js";

const app = express();

// Comma-separated list of frontend origins allowed to call the API,
// e.g. "https://sarthak-portfolio.vercel.app,http://localhost:8000"
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.set("trust proxy", 1); // Render sits behind a proxy
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (curl, health checks) and listed origins
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
  })
);
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => res.json({ name: "portfolio-api", status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.use("/api/contact", contactRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status === 400 ? "Invalid request body." : "Server error" });
});

export default app;
