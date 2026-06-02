# Employee Attendance & Management System (EMS)

A clean, professional Employee Management System built with **Next.js 16** and **Firebase**. Employees check in/out, take breaks, submit daily reports, and request leaves; a single admin oversees the whole team — attendance, leaves, and daily reports — from a dedicated dashboard.

---

## ✨ Features

### Employee
- **Authentication** — email/password sign up & login (Firebase Auth).
- **Profile onboarding** — complete your profile (name, CNIC, phone, address, photo) after first login.
- **Attendance portal** — Check In / Break / Resume / Check Out with a **live shift timer**.
- **Accumulated daily hours** — multiple sessions in a day add up; the timer resumes from the day's total and only resets on a new day.
- **Daily report** — on check out, submit a summary of the day's work (sent to the admin).
- **Leave requests** — request leave, track status (pending / approved / rejected), and edit while pending.
- **Personal dashboard** — your own status, hours, weekly attendance, breakdown, and recent activity (no org-wide data).

### Admin (single hardcoded account)
- **Command Center** — live team stats (employees, active now, pending leaves) + real weekly check-in trend.
- **Employees** — searchable personnel directory.
- **Attendance** — full check-in/out logs for all staff.
- **Leaves** — approve / reject pending requests, view history.
- **Daily Reports** — read every employee's end-of-day report with hours worked.
- **Settings** — manage the admin profile.

---

## 🛠 Tech Stack

| Area | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 (Inter font, slate + indigo theme) |
| State | Redux Toolkit + React Redux |
| Backend | Firebase Authentication + Cloud Firestore |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | lucide-react |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ and npm
- A Firebase project (free **Spark** plan is enough)

### 2. Install
```bash
npm install
```

### 3. Set up Firebase
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Add a **Web app** and copy its config values.
3. **Authentication** → Get started → enable **Email/Password**.
4. **Firestore Database** → Create database → **Start in test mode** (for development).
5. For development, Firestore rules can be:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   > ⚠️ Tighten these rules before any production deployment.

### 4. Environment variables
Copy `.env.example` to `.env.local` and fill in your Firebase web config:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
> `.env.local` is git-ignored and never committed.

### 5. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 👤 Admin Access

There is **one admin**, identified by a hardcoded email: **`clark@admin.com`**.

- Create this account directly in **Firebase Console → Authentication → Users → Add user** (set a strong password).
- The admin **logs in directly** — no sign up and no profile setup — and lands on the admin dashboard.
- Every other email is treated as a regular **employee**.

To change the admin email, update the `clark@admin.com` check in `app/store/authInit.tsx`, `app/hooks/useLogin.ts`, and `app/profile/page.tsx`.

---

## 📂 Project Structure

```
app/
├─ (auth)/login, signup        # Auth pages
├─ profile/                    # First-login profile onboarding
├─ dashboard/                  # Employee: home, attendance, leaves, settings
├─ admin-dashboard/            # Admin: home, users, attendance, leaves, reports, settings
├─ store/                      # Redux store, auth slice, auth init
└─ hooks/                      # useLogin, useSignup, usePresence, etc.
components/
├─ layout/DashboardLayout.tsx  # Shared sidebar + header
└─ ui/                         # Button, Input, AuthCard, UserAvatar, SplashScreen
services/firebase.ts           # Firebase initialization
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment

Deploy on [Vercel](https://vercel.com/new) (recommended for Next.js). Add the six `NEXT_PUBLIC_FIREBASE_*` variables in the project's **Environment Variables** settings, then deploy.
