<div align="center">

# 🌿 LOKII

### *The Campus Trust & Recovery Network*

**Find. Return. Inspire.**

An AI-powered Smart Lost & Found platform that transforms the way campuses recover misplaced belongings by encouraging honesty, community participation, and continuous learning.

---

![React](https://img.shields.io/badge/React-JS-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary)

</div>

---

# 📖 Overview

LOKII is an **AI-powered Campus Trust & Recovery Network** designed to simplify the process of reporting, matching, verifying, and recovering lost belongings within educational institutions.

Unlike traditional Lost & Found systems that rely on WhatsApp groups, notice boards, or manual reporting, LOKII centralizes the entire recovery process into a single intelligent platform.

Beyond helping students recover their belongings, LOKII promotes a culture of **honesty, trust, responsibility, and community engagement** by recognizing verified acts of kindness through personalized educational rewards.

---

# ❗ Problem Statement

Students frequently lose personal belongings on campus and often depend on scattered communication channels such as WhatsApp groups, notice boards, or campus offices to recover them.

These methods are:

- Unorganized
- Time-consuming
- Difficult to search
- Inefficient in matching lost and found items
- Lack proper verification mechanisms

Additionally, individuals who return lost belongings receive little recognition, reducing motivation to actively participate in the recovery process.

---

# 💡 Our Solution

LOKII provides a centralized AI-powered platform where users can:

- Report lost items
- Report found items
- Upload item images
- Receive intelligent item match suggestions
- Verify ownership securely
- Receive real-time notifications
- Earn recognition through educational rewards

Rather than simply storing reports, LOKII focuses on **reducing reporting effort**, **building trust**, and **encouraging active participation** within the campus community.

---

# 🎯 Vision

> To redefine the Lost & Found experience by creating a smart, secure, and community-driven platform that improves the recovery of misplaced belongings while fostering a culture of honesty, trust, and responsibility.

---

# 🚀 Mission

To provide a centralized Smart Lost & Found platform that simplifies reporting, intelligent matching, ownership verification, and item recovery while recognizing verified acts of kindness through personalized educational rewards that inspire continuous learning and community engagement.

---

# ✨ Key Features

## 👤 User Authentication

- Secure Firebase Authentication
- Login & Registration
- Protected User Sessions

---

## 📦 Lost Item Reporting

- Report lost belongings
- Upload item images
- Add descriptions
- Specify location and date

---

## 🎒 Found Item Reporting

- Report found belongings
- Upload images
- Add discovery location
- Help connect items with their rightful owners

---

## 🤖 AI-Powered Intelligent Matching

Powered by **Google Gemini API**

- Intelligent comparison of item descriptions
- Image-assisted matching
- Suggested potential matches
- Reduced manual searching

---

## 🔐 Secure Ownership Verification

Ensures that items are returned only to their rightful owners through verification before successful recovery.

---

## 🔔 Smart Notifications

- Match notifications
- Email alerts
- Push notifications
- Recovery updates

---

## 🏆 Gamified Recognition

Encouraging kindness through:

- Educational Rewards
- Community Recognition
- Contribution Tracking

---

# 🎓 Personalized Educational Rewards

Instead of traditional reward systems, LOKII motivates verified finders by recommending educational resources aligned with their interests.

Examples include:

- Learning Roadmaps
- Interview Preparation Resources
- Programming Cheat Sheets
- Technical Documentation
- Career Development Resources

This transforms every successful recovery into an opportunity for personal growth.

---

# 🧠 Why LOKII?

Existing Lost & Found systems focus primarily on storing reports.

LOKII focuses on **changing user behavior** by encouraging students to actively participate in the recovery process through:

- AI-assisted matching
- Recognition for honesty
- Educational rewards
- Community engagement

Our goal is not only to recover belongings but also to strengthen trust across the campus.

---

# 🛠 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- HTML5
- JavaScript

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas

## Artificial Intelligence

- Google Gemini API
  - Intelligent Item Matching
  - Personalized Educational Recommendations

## Authentication

- Firebase Authentication

## Cloud Storage

- Cloudinary

## Notifications

- Firebase Cloud Messaging (FCM)
- EmailJS

## Deployment

- Vercel (Frontend)
- Render (Backend)

## Version Control

- Git
- GitHub

## UI/UX

- Figma

## Development Tools

- Visual Studio Code
- Postman
- Claude Code

---

# 🏗 System Workflow

```
Lost Item Report
        │
        ▼
Store Item Information
        │
        ▼
AI Intelligent Matching
        │
        ▼
Potential Match Found
        │
        ▼
Owner Verification
        │
        ▼
Notification Sent
        │
        ▼
Successful Recovery
        │
        ▼
Educational Reward & Recognition
```

---

# 🎯 Target Users

- Students
- Faculty Members
- Campus Staff
- Security Office
- Educational Institutions

---

# 🌱 Future Scope

- Mobile Application
- Multi-Campus Support
- Advanced AI Image Recognition
- Smart Analytics Dashboard
- Campus-Wide Community Challenges
- Institutional Reward Programs

---

# 📂 Project Structure

```
Loki-The-lost-finding-web/
├── client/                     # React (Vite) + Tailwind frontend
│   ├── public/
│   │   └── firebase-messaging-sw.js   # FCM background push worker
│   ├── src/
│   │   ├── components/         # Navbar, ItemCard, MatchCard, Modal, Toast, ProtectedRoute…
│   │   ├── pages/              # Home, Login, Register, Dashboard, Report, Browse, Matches…
│   │   ├── context/           # AuthContext, NotificationContext, ToastContext
│   │   ├── hooks/             # useAuth, useItems, useMatches
│   │   ├── services/          # api.js, firebase.js, fcm.js, email.js
│   │   └── utils/             # constants, formatters
│   ├── .env.example
│   └── package.json
│
├── server/                     # Node + Express REST API
│   ├── config/                # env.js (feature flags), db.js, firebaseAdmin.js
│   ├── controllers/           # auth, items, matches, verification, notifications, rewards, admin, users
│   ├── middleware/            # verifyFirebaseToken, roleCheck, validate, rateLimiter, dbGuard, errorHandler
│   ├── models/                # User, Item, Match, VerificationRequest, Notification, Reward
│   ├── routes/                # one router per resource + index.js (mounts /api)
│   ├── services/              # gemini, cloudinary, fcm, match.engine, reward, notification
│   ├── utils/                 # asyncHandler, apiResponse, validators (zod)
│   ├── seed.js                # demo users + items + one full demo flow
│   ├── .env.example
│   └── package.json
│
├── package.json                # root scripts (concurrent dev, seed, lint)
├── vercel.json                 # frontend deploy config
├── render.yaml                 # backend deploy config
├── README.md
└── .gitignore
```

---

# 🏛 Architecture

```
                         ┌────────────────────────────┐
                         │   React (Vite) + Tailwind   │
                         │   Firebase Auth (client)    │
                         │   FCM web push · EmailJS     │
                         └──────────────┬─────────────┘
                                        │ axios  { success, data, error }
                                        │ Bearer <idToken>  (or x-dev-* in dev mode)
                                        ▼
                         ┌────────────────────────────┐
                         │      Express REST API       │
                         │  verifyFirebaseToken →       │
                         │  roleCheck → zod validate →  │
                         │  controller → service        │
                         └──┬──────────┬──────────┬────┘
                            │          │          │
              ┌─────────────▼──┐  ┌────▼─────┐  ┌─▼────────────┐
              │ MongoDB Atlas  │  │  Gemini   │  │  Cloudinary  │
              │  (Mongoose)    │  │  AI (JSON)│  │  (images)    │
              └────────────────┘  └───────────┘  └──────────────┘
                            │          │
                    ┌───────▼───┐  ┌───▼──────────────┐
                    │ FCM (push)│  │ match.engine.js   │
                    │ Notif docs│  │ verify · rewards  │
                    └───────────┘  └───────────────────┘
```

**Graceful fallback design:** `server/config/env.js` exposes `isConfigured(service)`. Every
external integration checks it and degrades cleanly when a key is missing, so the whole app
runs and is testable **before** you add any credentials:

| Service          | Missing key behaviour                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| Firebase Admin   | **Dev auth mode** — identity via `x-dev-uid` headers (insecure, logged loudly) |
| Gemini AI        | Heuristic keyword/category matching + curated reward resources               |
| Cloudinary       | Client stores a local data-URL / placeholder image instead of failing        |
| FCM / EmailJS    | Push & email are logged no-ops; in-app notifications are always persisted     |
| MongoDB          | Data routes return a fast `503` with a clear message (no 10s hang)           |

---

# 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (MongoDB Atlas, or local `mongod`) — **required** for data features
- (Optional, for full behaviour) Firebase project, Gemini API key, Cloudinary account, EmailJS account

### 1. Install
```bash
npm run install:all        # installs root + client + server
```

### 2. Configure env
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Set at least `MONGO_URI` in `server/.env`. Everything else is optional — leave blank to run in
fallback/dev mode. See **Environment Variables** below.

### 3. Seed demo data (optional but recommended)
```bash
npm run seed
```
Creates 6 demo users, 10 lost + 10 found items, and one completed recovery (match → verification
→ recovery → reward).

### 4. Run
```bash
npm run dev                # client (http://localhost:5173) + server (http://localhost:5000)
```
Health check: `GET http://localhost:5000/api/health`

### Dev auth mode (no Firebase needed)
When Firebase is not configured, sign in with **any email**. Seeded accounts:

| Email                | Role     | Notes                       |
| -------------------- | -------- | --------------------------- |
| `admin@lokii.dev`    | admin    | Admin dashboard             |
| `security@lokii.dev` | security | Admin dashboard + reviews   |
| `alice@lokii.dev`    | student  | Owner in demo flow          |
| `dave@lokii.dev`     | staff    | Finder in demo flow         |
| `bob@lokii.dev`      | student  |                             |
| `carol@lokii.dev`    | faculty  |                             |

---

# 🔑 Environment Variables

### `server/.env`
| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `PORT` | – | API port (default `5000`) |
| `CLIENT_ORIGIN` | – | Allowed CORS origin(s), comma-separated |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | – | Google Gemini AI (fallback: heuristics) |
| `FIREBASE_SERVICE_ACCOUNT` | – | Full service-account JSON (or use `FIREBASE_SERVICE_ACCOUNT_PATH`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | – | Signed image uploads |
| `MATCH_CONFIDENCE_THRESHOLD` | – | Min AI score to create a match (default `60`) |
| `VERIFICATION_PASS_THRESHOLD` | – | Min score to auto-approve ownership (default `70`) |

### `client/.env`
| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | – | Backend base URL (default `http://localhost:5000/api`) |
| `VITE_FIREBASE_*` | – | Firebase web config (fallback: dev auth mode) |
| `VITE_FIREBASE_VAPID_KEY` | – | FCM web push key |
| `VITE_EMAILJS_PUBLIC_KEY` / `VITE_EMAILJS_SERVICE_ID` / `VITE_EMAILJS_TEMPLATE_ID` | – | Email alerts |

> No secrets are committed — `.env` files are git-ignored. Enable a Firebase project **and**
> `server/config/firebaseAdmin.js` for production to leave dev auth mode.

---

# 🔌 API Reference (prefix `/api`)

All responses use `{ success, data, error }`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | – | Service status + configured integrations |
| POST | `/auth/sync` | ✅ | Create/update the Mongo user from the token |
| GET | `/auth/me` | ✅ | Current user |
| GET | `/items` | – | List with filters (`type,category,status,q,location,dateFrom,dateTo,page,limit,mine`) |
| POST | `/items` | ✅ | Report an item (runs AI matching) |
| GET | `/items/:id` | – | Item detail (private details never exposed) |
| PATCH / DELETE | `/items/:id` | ✅ | Update / delete (owner or admin) |
| POST | `/items/:id/rematch` | ✅ | Manually re-run matching |
| GET | `/items/upload-signature` | ✅ | Cloudinary signed-upload params |
| GET | `/matches/mine` | ✅ | Matches involving the user's items |
| GET | `/matches/:id` | ✅ | Match detail + confidence + AI reasoning |
| POST | `/matches/:id/accept` \| `/reject` | ✅ | Claim / dismiss a match |
| POST | `/verifications` | ✅ | Start verification (Gemini questions) |
| POST | `/verifications/:id/answer` | ✅ | Answer → auto-approve or route to review |
| POST | `/verifications/:id/review` | ✅ | Finder/security manual decision |
| GET | `/notifications` | ✅ | In-app notifications + unread count |
| PATCH | `/notifications/:id/read` · `/read-all` | ✅ | Mark read |
| POST | `/notifications/token` | ✅ | Save an FCM token |
| GET | `/rewards/mine` · `/leaderboard` | ✅ / – | Rewards / public leaderboard |
| PATCH | `/rewards/:id/ack` | ✅ | Acknowledge a reward |
| PATCH | `/users/me` · GET `/users/me/summary` | ✅ | Profile (interests) + dashboard summary |
| GET | `/admin/items` · `/stats` · `/verifications` | admin/security | Admin views |
| PATCH | `/admin/items/:id/status` | admin/security | Override item status |

---

# 🧪 Testing the flow end-to-end

**With seed + fallbacks (no external keys):**
1. `npm run seed && npm run dev`
2. Log in as `bob@lokii.dev`, report a lost item resembling a seeded found item.
3. Item creation triggers heuristic matching → open **Matches**.
4. Open the match → **"This looks like mine — verify"** → answer questions → auto-approve.
5. Match becomes **completed**, items **recovered**, contact revealed, finder earns a **reward**,
   and both parties get **notifications** (bell icon).
6. Log in as `admin@lokii.dev` → **Admin** dashboard for stats, item status overrides, and reviews.

**With real keys:** fill `.env`, restart, and repeat — you'll get real Gemini reasoning,
Cloudinary URLs, FCM push, and EmailJS emails.

---

# ☁️ Deployment

- **Frontend → Vercel:** `vercel.json` builds `client/` (`npm run build` → `client/dist`) with SPA
  rewrites. Set the `VITE_*` env vars in the Vercel dashboard.
- **Backend → Render:** `render.yaml` defines a Node web service (`rootDir: server`,
  health check `GET /api/health`). Set `MONGO_URI` and the other secrets in Render.
  Point the client's `VITE_API_BASE_URL` at the Render URL and add it to `CLIENT_ORIGIN`.

---

# 🧰 Scripts (root)
| Command | Description |
| --- | --- |
| `npm run install:all` | Install root + client + server deps |
| `npm run dev` | Run client and server concurrently |
| `npm run seed` | Seed demo data + full demo flow |
| `npm run build` | Build the client |
| `npm run lint` | Lint client + server |

---

# 👨‍💻 Team

Built with the vision of creating a safer, smarter, and more trustworthy campus community through technology.

---

# ❤️ Final Thought

> **"Every returned item strengthens our community."**

LOKII is more than a Lost & Found platform.

It is a step toward building campuses where honesty is recognized, kindness is encouraged, and technology empowers people to help one another.

---

<div align="center">

### 🌿 LOKII — The Campus Trust & Recovery Network

**Find. Return. Inspire.**

</div>