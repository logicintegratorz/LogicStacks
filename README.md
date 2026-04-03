# Inventory Management System (STRICT MVC)

A full-stack Inventory Management application built with **Node.js/Express** (Backend), **React/Vite** (Frontend), and **PostgreSQL** (Database). This project follows a strict MVC (Model-View-Controller) architecture for professional-grade scalability and maintenance.

## 🏗️ Architecture Overview

The system uses a **Strict MVC** pattern:
- **Models**: [models/](file:///c:/Users/Growbiz/Desktop/Backend/models/) handle all raw SQL queries and database logic.
- **Controllers**: [controllers/](file:///c:/Users/Growbiz/Desktop/Backend/controllers/) handle request/response orchestration (input validation, model calls, status codes).
- **Routes**: [routes/](file:///c:/Users/Growbiz/Desktop/Backend/routes/) map HTTP endpoints to controller logic.
- **Middlewares**: [middlewares/](file:///c:/Users/Growbiz/Desktop/Backend/middlewares/) handle JWT verification, Admin role protection, and global error handling.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT, Bcrypt, Joi (Validation).
- **Frontend**: React (Vite), React Router, Axios, Context API.
- **Database**: PostgreSQL.

---

## 📁 Folder Structure

```text
Backend/
├── config/             # Database connection pool
├── controllers/        # Request/Response handlers
├── models/             # Database logic (Queries)
├── routes/             # API endpoint mapping
├── middlewares/        # Auth, Role, Error Handling
├── migrations/         # SQL Schema (schema.sql)
├── seeders/            # Initial data (Admin seeder)
├── utils/              # Validation schemas
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI (Protected routes)
│   │   ├── context/    # Global auth state
│   │   ├── pages/      # Views (Login, Dashboard, CRUD)
│   │   └── services/   # Axios API calls
├── .env                # Environment variables
├── app.js              # Express app initialization
└── server.js           # Server entry point
```

---

## 🚀 Local Setup Instructions

### 1. Database Connection
Ensure you have **PostgreSQL** installed and running.
1. Create a database (e.g., `inventory_db`).
2. Run the SQL schema from [migrations/schema.sql](file:///c:/Users/Growbiz/Desktop/Backend/migrations/schema.sql) in your DB tool.
3. Update the `DATABASE_URL` in [.env](file:///c:/Users/Growbiz/Desktop/Backend/.env):
   ```env
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/inventory_db
   ```

### 2. Backend Setup
1. Open a terminal in the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the admin user:
   ```bash
   node seeders/admin.js
   ```
   *(Default: `admin` / `admin@123`)*
4. Start the server:
   ```bash
   npm run dev
   ```
   *(Backend runs on `http://localhost:5000`)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*

---

## 🔑 Authentication Logic

- **JWT Tokens**: Consumed from the `Authorization` header (`Bearer <token>`).
- **localStorage**: The token is stored locally in the browser to persist sessions.
- **Admin Only**: Read access to the dashboard and write/delete access to products/categories require the `admin` role.

---

## 📈 Dashboard Logic

The Dashboard highlights **Low Stock Items** (Quantity < 5). This logic is handled in the `ProductModel.getStats()` method and is visualized in the `Dashboard.jsx` page.

---

## 📜 Personal Note
This codebase is designed for professional use. Always use `.env` for sensitive keys and maintain the MVC separation when adding new features.
