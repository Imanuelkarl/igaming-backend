# iGaming Home Assignment 🎮

This is a simple game lobby system where users can join a timed game session, pick a number between 1–9, and compete to win. The project consists of:

- 🛠 **Backend**: NestJS + MongoDB + JWT Authentication
- 🖼 **Frontend**: React

---

## 🔐 Features

### ✅ Authentication (JWT)
- Simple username-based login
- JWT-secured routes
- Users cannot log in if they already have an active session

### 🎮 Game Logic
- Join an active game session (max 10 users per session – configurable via `.env`)
- Select a number between 1–9
- A random winning number is selected when the session ends
- Winners are determined and stored
- Sessions are stored in the database
- Users can leave a session before it starts
- First-in queue replaces any user who leaves
- Sessions auto-close after 20 seconds (or configured time)

### 🏆 Leaderboard & Stats
- Top 10 players by total wins
- View winners grouped by **day**, **week**, or **month**

---

## 🧪 Tech Stack

| Area       | Tech              |
|------------|-------------------|
| Backend    | NestJS, MongoDB, JWT |
| Frontend   | React, Axios       |
| Auth       | JWT Token Auth     |

---

## 🖥️ Pages

### 🔑 Authentication Page
- Username input
- Login functionality

### 🏠 Home Page
- Join active session button
- Countdown timer for session

### 🎰 Game Page
- Number selection (1–9)
- Result message (Win/Lose)

### 🏆 Leaderboard Page
- Top 10 players
- Filters: by Day, Week, Month

---

## ⚙️ Setup Instructions

### Backend

```bash
git clone https://github.com/Imanuelkarl/igaming-backend.git
cd igaming-backend
npm install
cp .env.example .env # fill in required env values (DB URI, JWT_SECRET)
npm run start:dev
