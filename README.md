# SmartRoute — Smart College Bus Management & Attendance System

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-blue.svg)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/Tests-28%20Passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

SmartRoute is a full-stack, database-connected web application engineered to solve college transit inefficiencies. Rather than forcing college buses to stop at every designated stop regardless of student demand, students declare daily bus usage each morning. The driver console automatically aggregates submissions to indicate which stops have waiting students and which can be safely skipped to reduce travel time. The system also features a secure 60-second dynamic QR code boarding attendance system and a full administrative management dashboard.

---

## 1. Prescribed Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Structure** | HTML5 | Semantic elements (`<main>`, `<aside>`, `<nav>`, `<table>`, `<form>`) |
| **Frontend Styling** | CSS3 & Bootstrap 5 | Responsive grid, Flexbox, custom color palette (`--navy`, `--teal`, `--amber`) |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | DOM manipulation, form validation, event handling |
| **Client-Server Comm** | JavaScript Fetch API | Asynchronous AJAX/JSON communication without page reloads |
| **Interactive Map** | Leaflet.js & OpenStreetMap | Free tile mapping, route polylines, and dynamic stop markers |
| **QR Scanner** | html5-qrcode | Browser camera access for scanning driver attendance QR codes |
| **Backend Runtime** | Node.js (v18+) | Event-driven, non-blocking I/O runtime |
| **Backend Framework** | Express.js (v5) | Modular REST API routing, controllers, and middleware |
| **Database** | MySQL 8.0 | Relational database, InnoDB engine, foreign keys, unique constraints |
| **Database Client** | mysql2 (Promise-based) | Connection pooling with 100% parameterized SQL queries |
| **Session Management** | express-session + MySQLStore | Persistent server-side session store with HttpOnly secure cookies |
| **Security & Hashing** | bcryptjs & helmet | Bcrypt password hashing (salt factor 10), HTTP security headers |
| **QR Generation** | qrcode (npm) | Server-side cryptographic token generation & QR data URLs |
| **Testing** | Node.js Test Runner + Supertest | 28 automated integration tests covering all critical workflows |

---

## 2. Default Demo Accounts

All accounts are pre-seeded with password: `password123`.

| Role | Username | Full Name | Access Scope |
|---|---|---|---|
| **Student** | `student1` | Rahul Sharma | Student Dashboard, Daily Availability, QR Scan, History, Profile |
| **Student** | `student2` | Priya Patel | Student Dashboard, Daily Availability, QR Scan, History, Profile |
| **Driver** | `driver1` | Ramesh Kumar | Driver Console, Route Guidance, Stop Skip Guide, Live 60s QR Generator |
| **Administrator** | `admin` | System Administrator | Admin Dashboard, User Management, Route & Stop Config, Audit Logs |

---

## 3. Quick Setup Instructions

### 3.1 Prerequisites
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/)).
2. **MySQL Server**: 8.0 or higher running on port `3306`.
3. **Git**: For version control.

### 3.2 Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/himanshumali5569/SmartRoute.git
   cd SmartRoute
   ```

2. **Install npm dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   PORT=3000
   NODE_ENV=development
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=smartroute
   SESSION_SECRET=smartroute_super_secure_session_secret_2026
   QR_EXPIRATION_SECONDS=60
   ```

4. **Initialize and Seed the MySQL Database**:
   Run the database initialization script to execute `database/schema.sql` and `database/seed.sql`:
   ```bash
   npm run db:init
   ```

5. **Start the Express Development Server**:
   ```bash
   npm start
   ```
   Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

6. **Run Automated Test Suite**:
   Execute the full test suite to verify authentication, availability, QR attendance, and administrative security:
   ```bash
   npm test
   ```

---

## 4. System Capabilities Matrix

| Feature | Module | Status | Verification Details |
|---|---|---|---|
| **Student Morning Availability** | Student | **Fully Implemented** | Single-tap YES/NO toggle, stop dropdown, GPS nearest match, unique daily constraint |
| **Driver Route Guidance** | Driver | **Fully Implemented** | Live student counts per stop, automated skip indicators, interactive route map |
| **Dynamic 60s QR Generation** | Driver | **Fully Implemented** | Unpredictable 32-byte cryptographic tokens, SHA-256 database hashing, live countdown |
| **QR Boarding Attendance Scan** | Student | **Fully Implemented** | HTML5 camera scanner, 60s server validation, duplicate prevention, server timestamp |
| **Interactive Route Map** | Shared | **Fully Implemented** | Leaflet.js with 12 Udaipur route stops, polyline, and student location pins |
| **User Role Authorization** | Backend | **Fully Implemented** | Session-based role-based access control (Student / Driver / Admin) |
| **User Management** | Admin | **Fully Implemented** | Create student/driver/admin, toggle active/inactive account status |
| **Route & Stop Management** | Admin | **Fully Implemented** | Add new stops with lat/lng, create routes, enable/disable transit stops |
| **Attendance Audit Log** | Admin | **Fully Implemented** | Searchable table of verified attendance logs filterable by date, route, and stop |
| **Security Audit Logs** | Admin | **Fully Implemented** | Real-time trail recording login, registration, and attendance events |
| **Continuous Live Vehicle GPS** | Hardware | **Designated Scope** | Implemented via browser GPS location sharing; onboard OBD-II GPS left for future IoT |

---

## 5. Project Directory Structure

```text
SmartRoute/
├── client/                     # HTML5, CSS3, JS Frontend
│   ├── index.html              # Landing page
│   ├── login.html              # Multi-role sign in
│   ├── signup.html             # Student self-registration
│   ├── student-dashboard.html  # Student home & stats
│   ├── availability.html       # Daily availability, map & QR scanner
│   ├── driver-dashboard.html   # Driver route guidance & QR generator
│   ├── attendance.html         # Personal attendance history
│   ├── student-profile.html    # Student profile edit
│   ├── admin-dashboard.html    # Full administrative console
│   ├── css/
│   │   └── style.css           # Custom Syne & DM Sans modern design
│   └── js/
│       ├── api.js              # Centralized Fetch API client
│       └── auth.js             # Client-side session and role guard
├── server/
│   └── src/
│       ├── app.js              # Express app configuration & middleware
│       ├── server.js           # Server listen entrypoint
│       ├── config/
│       │   └── database.js     # mysql2 connection pool
│       ├── controllers/        # Request handling & business logic
│       ├── routes/             # RESTful API route definitions
│       ├── middleware/         # Auth, role check, and rate limiting
│       ├── services/           # QR code generation & token hashing
│       └── utils/              # Haversine distance & nearest stop math
├── database/
│   ├── schema.sql              # MySQL DDL (11 tables with foreign keys)
│   ├── seed.sql                # Default Udaipur campus route & demo users
│   └── init.js                 # Automated database initialization script
├── tests/                      # Automated test suite (28 tests)
│   ├── auth.test.js            # Login, logout, register, role checks
│   ├── availability.test.js    # Student availability CRUD & stats
│   ├── attendance.test.js      # Dynamic QR generation, 60s expiry, scan
│   └── admin.test.js           # Admin CRUD, stop config, role security
├── docs/                       # Comprehensive project documentation
│   ├── architecture.md         # System architecture & Mermaid flowcharts
│   ├── api-documentation.md    # Detailed REST endpoint specifications
│   ├── database-design.md      # ER diagram & 3NF schema analysis
│   ├── testing-report.md       # Automated testing execution log (100% pass)
│   └── viva-prep.md            # B.Tech CSE Viva Q&A course guide
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## 6. Documentation Index

- [System Architecture](docs/architecture.md)
- [Database Design & ER Diagram](docs/database-design.md)
- [REST API Documentation](docs/api-documentation.md)
- [Automated Testing Report](docs/testing-report.md)
- [Viva Preparation Guide](docs/viva-prep.md)

---

## 7. License

Distributed under the MIT License. Developed for the Web Development Course Project.
