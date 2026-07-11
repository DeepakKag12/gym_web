# 🏋️ FITNATION BY AJEET — Gym Management System

A complete full-stack gym management platform built with the MERN stack.

---

## 📁 Project Structure

```
gym/
├── backend/        ← Node.js + Express + MongoDB API
└── frontend/       ← React 18 + Tailwind CSS
```

---

## ⚙️ Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, Tailwind CSS, Framer Motion |
| Backend   | Node.js, Express                      |
| Database  | MongoDB + Mongoose                    |
| Media     | Cloudinary                            |
| Auth      | JWT (JSON Web Tokens)                 |
| Messaging | Twilio WhatsApp API                   |
| Scheduler | node-cron (daily fee reminders)       |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
# Copy the example env file
copy backend\.env.example backend\.env
```

Then edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/fitnation
PORT=5000
JWT_SECRET=your_super_secret_key_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
GYM_WHATSAPP=919999999999
```

### 3. Configure Frontend Environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
HOST=localhost
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### 4. Seed Exercise Data + Admin Account

```bash
cd backend
npm run seed
```

This creates:
- **Admin account**: `admin@fitnation.com` / `admin123`
- **40 exercises** across 8 muscle groups

### 5. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

---

## 🌐 Pages & Routes

### Public Pages
| Route              | Page                        |
|--------------------|-----------------------------|
| `/`                | Home (animations, hero)     |
| `/about`           | About Gym                   |
| `/exercises`       | Exercise Library (by muscle)|
| `/exercises/:id`   | Exercise Detail + Video      |
| `/diet`            | Diet Plans                  |
| `/store`           | Supplement Store (e-commerce)|
| `/store/:id`       | Product Detail               |
| `/cart`            | Cart                         |
| `/checkout`        | Checkout                     |
| `/transformations` | Client Transformations       |
| `/enquiry`         | Enquiry → WhatsApp           |
| `/login`           | Login                        |

### Member Dashboard
| Route          | Page                                |
|----------------|-------------------------------------|
| `/dashboard`   | Member Dashboard (membership card)  |
| `/my-workout`  | Weekly Workout Split (personalised) |
| `/my-progress` | Progress Tracker (charts + photos)  |
| `/my-orders`   | Order History                       |
| `/notifications`| Notifications                      |

### Admin Panel (dark theme)
| Route                     | Page                         |
|---------------------------|------------------------------|
| `/admin`                  | Dashboard (stats + alerts)   |
| `/admin/members`          | Member CRUD + Notifications  |
| `/admin/trainers`         | Trainer Management           |
| `/admin/exercises`        | Exercise CRUD + Video Upload |
| `/admin/splits`           | Workout Split Builder        |
| `/admin/diet`             | Diet Plan Builder            |
| `/admin/store`            | Product CRUD                 |
| `/admin/orders`           | Order Management             |
| `/admin/plans`            | Membership Plans CRUD        |
| `/admin/transformations`  | Before/After Photos          |
| `/admin/enquiries`        | Enquiry Management           |
| `/admin/analytics`        | Revenue + Member Charts      |

---

## 🔔 WhatsApp Fee Reminders

Automatic reminders fire daily at **9:00 AM** via `node-cron`:
- **7 days before** membership expiry
- **3 days before** expiry
- **On expiry day**

Requires valid Twilio credentials in `.env`. Gracefully skips if unconfigured.

---

## 🌱 Seed Data

The seed script (`npm run seed` in backend) loads:
- **Chest**: Bench Press, Incline DB Press, Cable Fly, Push-Up, Dips
- **Back**: Deadlift, Pull-Up, Barbell Row, Lat Pulldown, Seated Row
- **Shoulders**: OHP, Lateral Raise, Arnold Press, Face Pull, Front Raise
- **Arms**: Barbell Curl, Hammer Curl, Tricep Pushdown, Skull Crusher, Concentration Curl
- **Legs**: Squat, Romanian DL, Leg Press, Lunges, Leg Curl
- **Core**: Plank, Cable Crunch, Hanging Leg Raise, Ab Wheel, Russian Twist
- **Cardio**: HIIT, Jump Rope, Battle Ropes, Box Jump, Rowing
- **Full Body**: Clean & Press, Burpee, KB Swing, Thrusters, Turkish Get-Up

---

## 📱 Mobile First

All pages are mobile-responsive:
- Admin sidebar collapses to a **hamburger drawer** on mobile
- Member dashboard uses a **2×3 tile grid**
- Store uses responsive product card grid
- All forms are full-width on small screens

---

## 🔐 Roles

| Role      | Access                                              |
|-----------|-----------------------------------------------------|
| `admin`   | Full access: members, store, analytics, plans, etc. |
| `trainer` | Exercises, workout splits, diet plans, transformations |
| `member`  | Dashboard, workout, progress, diet, store, orders   |

---

## 🏗 Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve backend + static frontend
# Point Express to serve build/ folder or deploy to separate hosts
```

Recommended: Deploy backend to **Railway** or **Render**, frontend to **Vercel** or **Netlify**.
