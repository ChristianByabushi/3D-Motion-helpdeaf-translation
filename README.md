# HelpDeaf

Sign language translation platform that converts spoken and written African languages into real-time 3D sign language animations.

---

## Quick Start

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Run the backend server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

### 3. Run the frontend

```bash
cd client
npm run dev
```

Frontend opens at `http://localhost:5173`

---

## Project Structure

```
helpdeaf/
  api/v1/         Vercel serverless functions (translate, health, models)
  client/         React + Vite + Three.js frontend
  server/         Node.js + Express server (local development only)
  vercel.json     Vercel deployment config
```

---

## Architecture

```
Browser (React + Three.js)
  |
  +-- POST /v1/translate  -->  Vercel Serverless Function (production)
  |                        -->  Express server on port 3001 (local dev)
  |
  +-- Client-side animation loop (requestAnimationFrame at 30fps)
         |-- No WebSocket needed in production
         +-- Avatar pose driven by gloss sequence from API response
```

---

## Supported Languages

| Code | Language | Region           |
|------|----------|------------------|
| ar   | Arabic   | North Africa     |
| sw   | Swahili  | East Africa      |
| ha   | Hausa    | West Africa      |
| yo   | Yoruba   | West Africa      |
| om   | Oromo    | Horn of Africa   |

---

## API Endpoints

| Method | Path             | Description              |
|--------|------------------|--------------------------|
| GET    | /v1/health       | System health check      |
| POST   | /v1/translate    | Text or audio to glosses |
| GET    | /v1/models       | List registered models   |

---

## Deployment — Vercel (free, zero config)

No environment variables. No separate backend. One deploy.

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repository
4. Leave all settings as default — Vercel reads `vercel.json` automatically
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

The API functions in `api/v1/` are deployed automatically alongside the frontend.

---

## Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Frontend   | React 18, Vite, Three.js         |
| API        | Vercel Serverless Functions      |
| Local dev  | Node.js, Express                 |
| 3D Avatar  | Three.js procedural skeleton     |
| Animation  | requestAnimationFrame at 30fps   |
| Fonts      | Roboto Condensed (Google Fonts)  |

---

## Notes

This is a prototype with simulated pipeline responses. The 3D avatar uses a
procedurally generated humanoid skeleton animated at 30fps entirely in the browser.

Production deployment would replace the mock services with:

- Speech recognition: Whisper, Azure Speech, or Google Speech-to-Text
- Translation: Custom transformer model fine-tuned on sign language glosses
- Motion synthesis: Encoder-decoder model outputting BVH or glTF animations
- Avatar: Full rigged glTF model loaded via Three.js GLTFLoader
