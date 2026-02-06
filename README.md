# Royal Ambassadors Examination Portal – Frontend

## Overview

This repository contains the frontend application for the Royal Ambassadors Examination & Management Portal for Ogbomoso Goshen Baptist Association (OGBA).

The frontend is built with Next.js and serves as the user interface for:

- Royal Ambassadors (RAs)
- Church Admins (Local Presidents)
- Association Officers

It consumes APIs exposed by the backend (Express.js) and does not contain business logic such as rank enforcement, exam eligibility, or promotion rules. All authority resides in the backend.

---

## Project Goals

- Provide a clean, disciplined, school-portal-style interface
- Enforce role-based UI rendering (RA, Church Admin, Association Officer)
- Support secure authentication via RA Number
- Provide a focused, distraction-free exam experience
- Scale cleanly as features and user base grow

---

## Core Principles

- Backend is the source of truth
- Frontend never decides permissions
- Role-aware, not role-enforcing
- Readable > flashy
- Discipline over decoration

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Server Components + minimal client state
- **Auth Strategy**: Secure HTTP-only cookies (set by backend)
- **API Communication**: REST over HTTPS
- **Deployment Target**: Linux-based cloud hosting

---

## User Roles (Frontend Perspective)

The frontend adapts UI based on the authenticated user's role.

**Roles:**

- **RA** – Royal Ambassador
- **CHURCH_ADMIN** – Local Church President
- **ASSOCIATION_OFFICER** – Exam Coordinators, General President
- **SYSTEM_ADMIN** – Technical only (limited UI)

⚠️ **Role checks in the frontend are purely for rendering.**  
Backend authorization is mandatory for every protected API.

---

## Application Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── activate/
│   ├── dashboard/
│   ├── exams/
│   │   ├── [examId]/
│   ├── results/
│   ├── resources/
│   ├── activities/
│   ├── records/
│   ├── admin/
│   │   ├── churches/
│   │   ├── users/
│   │   ├── exams/
│   │   └── reports/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── dashboard/
│   ├── exams/
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── constants.ts
├── middleware.ts
├── styles/
├── public/
└── README.md
```

---

## Routing Strategy

### Public Routes

- `/` – Landing page
- `/auth/login` – Login (RA Number + Password)
- `/auth/activate` – Account activation

### Protected Routes

- `/dashboard`
- `/exams`
- `/results`
- `/resources`
- `/activities`
- `/records`

### Admin-Only Routes

- `/admin/churches`
- `/admin/users`
- `/admin/exams`
- `/admin/reports`

Access is guarded by:

- Middleware checks
- Backend validation

---

## Authentication Flow

### Login

1. User enters RA Number + Password
2. Credentials sent to backend
3. Backend sets secure HTTP-only cookie
4. Frontend fetches `/me` endpoint
5. User context loaded

### Activation

1. RA enters RA Number + activation code
2. Sets password
3. Account status becomes active

---

## Dashboard Design

Dashboard is an overview, not a workspace.

Each role sees:

- Identity summary (Name, Role, Rank, Church)
- High-priority notifications
- Exam availability status
- Quick navigation links

No heavy actions occur on the dashboard.

### Tabs & Sections (RA View)

- **Dashboard** – Overview
- **Exams** – Available exams & exam history
- **Results / Progress** – Passed ranks, promotion status
- **Resources** – Manuals, syllabi, creed (rank-aware)
- **Activities** – Camps, events, trainings
- **My Records** – Result slips, promotion letters (read-only)

---

## Exams UI Rules (Very Important)

- Exam runs in a focused view
- No navigation during exam
- Timer visible at all times
- Auto-submit on timeout
- One exam per page load
- No exam logic on frontend

**Frontend only:**

- Displays questions
- Collects answers
- Submits payload

---

## API Consumption Pattern

All API calls go through a single abstraction:

```
lib/api.ts
```

**Rules:**

- No direct fetch in components
- Handle auth errors globally
- Backend errors displayed gracefully
- Never assume permissions

**Example:**

```
GET /api/me
GET /api/dashboard
GET /api/exams/available
POST /api/exams/:id/start
POST /api/exams/:id/submit
```

---

## State Management Strategy

- Prefer Server Components
- Client components only when necessary
- No global state for auth
- User data fetched on layout load
- Avoid duplicated API calls

---

## Middleware Usage

`middleware.ts` is used to:

- Protect authenticated routes
- Redirect unauthenticated users
- Perform lightweight role checks

Middleware does NOT replace backend authorization.

---

## Error Handling & UX

- Friendly error messages
- Clear "permission denied" states
- Network failure fallback
- Loading skeletons for slow responses
- No silent failures

---

## Styling & Design Language

- Clean
- Minimal
- Institutional
- School-portal aesthetic
- Mobile responsive

**Avoid:**

- Over-animation
- Social-media patterns
- Chat-like interfaces

---

## Security Responsibilities (Frontend)

Frontend is responsible for:

- Never storing tokens in localStorage
- Avoiding sensitive data exposure
- Preventing UI-based privilege escalation
- Sanitizing user input before submission

Backend handles enforcement.

---

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=<backend-url>
```

No secrets in frontend.

---

## Development Setup

```bash
git clone https://github.com/<org>/ra-portal-frontend.git
cd ra-portal-frontend
npm install
npm run dev
```

---

## Contribution Rules

- Follow folder conventions
- No business logic in components
- No direct API calls outside `lib/api.ts`
- Use TypeScript strictly
- PRs must reference a task or issue

---

## Deployment Notes

- Build must pass without warnings
- Environment variables set at runtime
- HTTPS required
- Backend must be live first

---

## Ownership & Governance

This project is owned by:

- Ogbomoso Goshen Baptist Association (OGBA)
- Royal Ambassadors Leadership

Technical stewardship is delegated to approved developers.

---

## Final Note

This frontend is not just a website.  
It is an official RA digital system.

Every design and implementation decision must respect:

- **Discipline**
- **Order**
- **Integrity**
- **Authority**

Build accordingly.