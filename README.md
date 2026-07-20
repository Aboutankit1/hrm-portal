# Staff Hub — Employee Management System

A full-stack MERN (MongoDB, Express, React, Node.js) staff/employee management system with authentication, role-based access control, real-time attendance (swipe in/out with a live timer), task management, department management, and admin/employee dashboards.

> **Scope note:** This is a solid, working core (auth, employees, departments, attendance with real-time Socket.IO updates, tasks) built to be extended. Leave management, performance scoring, PDF/Excel export wiring, Cloudinary uploads, and email flows are scaffolded (models, routes, and UI shells exist for Reports/Settings) but not fully implemented — see "What's next" below.

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Redux Toolkit, Tailwind CSS, Axios, React Hook Form, Chart.js, React Icons, Framer Motion, react-hot-toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + refresh tokens), Socket.IO, bcryptjs, Helmet, express-validator, express-rate-limit, Morgan
- **Deployment:** Vercel/Netlify (frontend), Render/Railway (backend), MongoDB Atlas (database), Docker + docker-compose (self-hosted)

## Project Structure

```
staff-hub/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── validators/      # express-validator rules
│   ├── utils/           # JWT helpers
│   ├── seed/            # Demo data seeder
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, Navbar, StatCard, Loader
│   │   ├── layouts/      # DashboardLayout
│   │   ├── pages/        # Login, Dashboards, Employees, Attendance, Tasks...
│   │   ├── redux/        # Store + slices
│   │   ├── routes/       # ProtectedRoute
│   │   └── services/     # Axios instance with auto refresh-token
│   └── vite.config.js
└── docker-compose.yml
```

## Getting Started (Local Development)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secrets
npm install
npm run seed   # optional — creates demo admin + employee + departments
npm run dev    # starts on http://localhost:5000
```

Demo credentials after seeding:
- **Admin:** admin@staffhub.com / Admin@123
- **Employee:** john@staffhub.com / Employee@123

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Create `frontend/.env` if your API isn't on the default port:
```
VITE_API_URL=http://localhost:5000/api
```

## Docker (full stack, one command)

```bash
docker-compose up --build
```
This starts MongoDB, the backend API, and the frontend (served via Nginx) together.

## Deployment

- **Frontend → Vercel:** `vercel.json` is included with a SPA rewrite rule so refreshing any route (e.g. `/employees`, `/attendance`) never 404s.
- **Frontend → Netlify:** `public/_redirects` handles the same SPA fallback.
- **Backend → Render/Railway:** `backend/render.yaml` provided; set `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL` as environment variables in the dashboard.
- **Database → MongoDB Atlas:** create a free cluster, whitelist your backend's IP (or `0.0.0.0/0` for simplicity), and use the connection string in `MONGO_URI`.
- **Self-hosted → Nginx:** `frontend/nginx.conf` includes `try_files $uri /index.html` so nginx never returns a raw 404 on client-side routes either.

## Core Features Implemented

- JWT auth (access + httpOnly refresh token cookie), role-based access control (super_admin / admin / employee), auto-login on refresh
- Employee CRUD with search, filter, pagination, suspend/activate
- Department CRUD with employee counts
- Attendance: swipe in/out capturing device, browser, IP, timestamps; live working timer on the employee dashboard; auto-computed working hours, overtime, and status (present/late/half-day); monthly calendar view; admin daily attendance table
- Real-time updates via Socket.IO in-emit on swipe in/out and task events
- Task management: create, assign to multiple employees, priority, deadline, status workflow (pending → accepted → in progress → review → completed/cancelled), comments
- Role-aware dashboards (Admin sees org-wide stats + charts, Employee sees swipe controls + their tasks)
- Dark mode, responsive sidebar, skeleton loaders, toast notifications
- SPA routing that never 404s on refresh (Vercel/Netlify/Nginx configs included)

## What's Next (scaffolded but not wired up)

- Leave management endpoints/UI (model pattern established by Attendance/Task — same approach applies)
- Performance scoring engine
- PDF/Excel report generation (Reports page UI exists; wire up `pdfkit`/`exceljs` export routes)
- Cloudinary profile photo upload (Multer middleware slot ready in employee routes)
- Nodemailer password reset flow (reset token fields already on Admin/Employee schemas)
- Swagger API docs (`swagger-jsdoc` + `swagger-ui-express` can be dropped into `server.js`)
- Super Admin multi-company management

## Security Notes

- Passwords hashed with bcrypt (10 salt rounds)
- Helmet for HTTP security headers, CORS locked to `CLIENT_URL`, rate limiting on `/api/*`
- Refresh tokens stored httpOnly + validated against the stored token in DB (revocable on logout)
- All mutating routes protected by `protect` + `authorize(...)` middleware
