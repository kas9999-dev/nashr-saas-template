# Nashr SaaS Template (v1)

Minimal Node + Express + Static Frontend + One API route.

## Routes
- POST /api/run
- GET /health
- GET / (landing)
- GET /app

## Local Run
1) Install
npm install

2) Create env
cp .env.example .env
# set OPENAI_API_KEY

3) Start
npm start

Open:
http://localhost:3000/app

## Deploy (Render)
- Build Command: npm install
- Start Command: npm start
- Add Environment Variables:
  - OPENAI_API_KEY
  - OPENAI_MODEL (optional)
