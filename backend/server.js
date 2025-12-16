import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRun from "./api-run.js";

const app = express();

// ===== Base paths =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, "../frontend");

// ===== Middlewares =====
app.use(express.json({ limit: "2mb" }));
app.use(express.static(FRONTEND_DIR, { index: false }));

// ===== API =====
app.post("/api/run", apiRun);

// ===== Health =====
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Nashr",
    api: "/api/run",
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  });
});

// ===== Pages =====
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "landing.html"));
});

app.get("/app", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "app.html"));
});

// Fallback → Landing
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "landing.html"));
});

// ===== Server start =====
const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Nashr server running on port ${PORT}`);
});