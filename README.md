# Nashr SaaS Template (v1)

## What this is
Minimal Node + Express + Static Frontend + One API route:
- POST /api/run
- GET /health
- Pages: / (landing) and /app

## Local Run
1) Install
npm install

2) Create env
cp .env.example .env
# Put your OPENAI_API_KEY

3) Run
npm start

Open:
http://localhost:3000/app

## Smoke Tests
Health:
curl -s http://localhost:3000/health

API:
curl -s -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{"text":"الحوكمة","platform":"Both"}'

## Deploy on Render (Web Service)
Start Command:
node backend/server.js

Environment Variables:
OPENAI_API_KEY=xxxx
OPENAI_MODEL=gpt-4o-mini (optional)

## Notes
- Never commit .env
- Keep /api/run declared before pages + fallback
