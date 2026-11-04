# SmartRoute — Smart College Bus Management & Attendance System

A full-stack, responsive web application designed to solve college bus transit inefficiencies. Instead of fixed routes that halt at empty bus stops, students submit their daily morning bus availability. Drivers receive dynamic route guidance showing which pickup stops have students waiting and which stops can be skipped, saving fuel and travel time. The system also includes real-time GPS location sharing and dynamic 60-second QR-code attendance recording.

---

## 1. Technologies Used & Where They Are Used

### Frontend (`/client`)
- **HTML5**: Semantic markup across all student and driver interfaces (`index.html`, `login.html`, `signup.html`, `student-dashboard.html`, `availability.html`, `attendance.html`, `driver-dashboard.html`, `student-profile.html`).
- **CSS3 & Bootstrap 5**: Custom theme styling (`client/css/style.css`), responsive layouts, navbar, modals, cards, badges, and mobile-friendly layouts.
- **Vanilla JavaScript (ES6+)**:
  - `client/js/api.js`: Centralized asynchronous Fetch API wrapper for all backend REST endpoints.
  - `client/js/auth.js`: Client-side session state management, role-based page protection, and dashboard routing.
- **Leaflet.js & OpenStreetMap**: Interactive route maps, stop markers, and real-time red bus marker tracking (`client/availability.html` and `client/driver-dashboard.html`).
- **html5-qrcode**: Browser-based camera scanner for verifying boarding QR codes (`client/availability.html`).

### Backend (`/server`)
- **Node.js**: Server runtime environment.
- **Express.js (v5)**: Modular RESTful routing, request parsing, and error handling (`server/src/app.js`, `server/src/server.js`).
  - `/api/auth`: Login, registration (Student & Driver), session checking, and logout.
  - `/api/availability`: Daily bus availability declarations, personal stats, and student profile updates.
  - `/api/driver`: Driver console, route stops aggregation, live student pickup counts, and real-time GPS coordinates broadcast.
  - `/api/attendance`: 60-second dynamic QR session generation, instant scan verification, and unified student attendance logs.
  - `/api/stops` & `/api/tiles`: Stop list queries and local disk-cached OpenStreetMap tile proxy to avoid external rate limits.
- **express-session & express-mysql-session**: Secure cookie sessions stored directly in MySQL (`smartroute_sid`).
- **bcryptjs**: One-way salt hashing (10 rounds) for password security.
- **helmet & cors**: HTTP security headers and CORS protection.
- **express-rate-limit**: Rate limiting on login and QR scanning endpoints to prevent brute-force attacks.
- **qrcode**: Cryptographic QR code data generation and dynamic verification.

### Database (`/database`)
- **MySQL 8.0**: Relational database storage with InnoDB engine, foreign key cascades, and unique daily constraints.
  - `users`: User credentials, roles (`student`, `driver`), and account status.
  - `student_profiles`: Enrollment numbers and contact details.
  - `bus_stops`: Campus route stops with geographic coordinates (latitude, longitude) and scheduled arrival times.
  - `routes` & `route_stops`: Bus routes and sequential stop order.
  - `student_availability`: Daily student attendance declarations (`YES`/`NO`), designated stops, and pickup timestamps.
  - `driver_assignments`: Daily route assignment for bus drivers.
  - `attendance_records`: Boarding verification logs (QR scan / declaration source).
  - `route_locations`: Real-time driver GPS telemetry.

---

## 2. Project Directory Structure

```
SMART_ROUTE/
├── client/                     # Frontend web application
│   ├── css/
│   │   └── style.css           # Custom styles & design variables
│   ├── js/
│   │   ├── api.js              # Fetch API helper & utilities
│   │   └── auth.js             # Client session & route protection
│   ├── attendance.html         # Student attendance log & statistics
│   ├── availability.html       # Daily availability marking & live map
│   ├── driver-dashboard.html   # Driver console, route guidance & QR generator
│   ├── index.html              # Landing page
│   ├── login.html              # Sign in page (Student & Driver)
│   ├── signup.html             # Self-registration (Student & Driver)
│   ├── student-dashboard.html  # Student dashboard
│   └── student-profile.html    # Student profile
│
├── database/                   # Database configuration
│   ├── init.js                 # Automatic database & table setup runner
│   ├── schema.sql              # Relational tables, indexes & foreign keys
│   └── seed.sql                # Default Udaipur campus stops & route data
│
├── server/                     # Backend application (Node.js + Express)
│   └── src/
│       ├── config/
│       │   └── database.js     # MySQL connection pool (supports local & cloud)
│       ├── controllers/        # Route controllers
│       │   ├── attendance.controller.js
│       │   ├── auth.controller.js
│       │   ├── availability.controller.js
│       │   ├── driver.controller.js
│       │   ├── stops.controller.js
│       │   └── tiles.controller.js
│       ├── middleware/         # Authentication & rate limiting
│       │   ├── auth.middleware.js
│       │   └── rateLimiter.middleware.js
│       ├── routes/             # REST API routes
│       │   ├── attendance.routes.js
│       │   ├── auth.routes.js
│       │   ├── availability.routes.js
│       │   ├── driver.routes.js
│       │   └── stops.routes.js
│       ├── services/
│       │   └── qr.service.js   # Dynamic 60-second QR token engine
│       ├── utils/
│       │   └── geo.utils.js    # Haversine distance calculations
│       ├── app.js              # Express app setup & middleware
│       └── server.js           # Server startup script
│
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules (node_modules, .env, etc.)
├── LICENSE                     # MIT License
├── package.json                # Dependencies and project metadata
└── README.md                   # Project documentation
```

---

## 3. Local Setup & Installation

### Prerequisites
1. **Node.js** (v18 or higher): [nodejs.org](https://nodejs.org/)
2. **MySQL Server** (v8.0 or higher) running on port `3306`
3. **Git**: [git-scm.com](https://git-scm.com/)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MaliHimanshu3659/SmartRoute-College-Bus_management.git
   cd SmartRoute-College-Bus_management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MySQL database credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=smartroute
   SESSION_SECRET=smartroute_secret_key_change_me
   QR_EXPIRATION_SECONDS=60
   ```

4. **Initialize Database**:
   Run the database setup script to create tables and load default bus stops:
   ```bash
   npm run db:init
   ```

5. **Start Application**:
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser.

---

## 4. Cloud Deployment (Render / Railway)

### Option A: Deploy on Render (Recommended for College Projects)

1. **Push your code to GitHub**:
   Ensure all changes are pushed to your repository.
2. **Set up Cloud MySQL**:
   - Create a free MySQL database on [Aiven](https://aiven.io/), [TiDB Cloud](https://tidbcloud.com/), or [Clever Cloud](https://www.clever-cloud.com/).
   - Copy the MySQL connection URI (`DATABASE_URL`).
3. **Create a Web Service on Render**:
   - Go to [render.com](https://render.com) and click **New + > Web Service**.
   - Connect your repository: `SmartRoute-College-Bus_management`.
   - Configure:
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run db:init`
     - **Start Command**: `npm start`
4. **Add Environment Variables in Render Dashboard**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `mysql://<username>:<password>@<host>:<port>/<dbname>`
   - `MYSQL_SSL`: `true`
   - `SESSION_SECRET`: `<any-random-secure-string>`
   - `QR_EXPIRATION_SECONDS`: `60`
5. Click **Deploy Web Service**. Your app will be live on an `https://...onrender.com` URL.

---

## 5. Application Roles & Features

### 🎓 Student
- Self-registration with Enrollment Number and College Email.
- Daily availability declaration (`YES` or `NO`) before route departure.
- Select designated pickup stop from scheduled Udaipur stops or via GPS map.
- View real-time red bus marker transmitting live coordinates from the driver.
- Boarding attendance via live camera QR scan or instant verification.
- Complete personal attendance log displaying daily availability and boarding timestamps.

### 🚍 Bus Driver
- Secure driver login and route assignment console (`Campus Route 01`).
- Stop-by-stop route guidance showing active student counts and skip recommendations.
- Broadcast live GPS coordinates to students on the map.
- Dynamic 60-second QR code generator for passenger boarding verification.
- Real-time boarding attendance counter and verified rider list.

---

## 6. License
This project is open-source and available under the [MIT License](LICENSE).
