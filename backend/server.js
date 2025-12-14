import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ===== Base paths =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, "../frontend");

// ===== Middlewares =====
app.use(express.json({ limit: "2mb" }));

// ===== Static files (CSS / JS only — no index auto-serve) =====
app.use(express.static(FRONTEND_DIR, { index: false }));

// ===== Routes =====

// Landing page (صفحة التعريف)
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "landing.html"));
});

// App page (النظام)
app.get("/app", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "app.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Fallback → Landing
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "landing.html"));
});

// ===== Server start =====
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Nashr server running on port ${PORT}`);
});