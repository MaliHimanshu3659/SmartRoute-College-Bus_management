# SmartRoute — Viva Preparation & Course Concepts Guide
*Tailored for 2nd Year B.Tech Computer Science & Engineering Students*

---

## 1. Project Motivation & Problem Statement

### Q1: What is the main problem that SmartRoute solves?
**Answer**:
Traditional college buses follow rigid schedules and stop at every designated bus stop, regardless of whether any students are actually waiting. In reality, student attendance fluctuates daily due to exams, late classes, sickness, or alternative transport. 

This causes two major issues:
1. Buses waste 15–25 minutes stopping at empty pickup points.
2. Bus drivers have no advance notice of who is boarding where.

**SmartRoute** solves this by providing a decentralized, database-backed web portal where students declare their bus availability (YES or NO) each morning. The driver console automatically aggregates these responses to show which stops have waiting students and which stops can be safely skipped, followed by 60-second dynamic QR code boarding verification.

---

## 2. Frontend Technologies & DOM Manipulation

### Q2: What frontend technologies are used and why?
**Answer**:
- **HTML5**: Provides semantic structure (`<nav>`, `<main>`, `<aside>`, `<section>`, `<table>`, `<form>`), improving accessibility, SEO, and maintainability.
- **CSS3 & Bootstrap 5**: Implements a clean, mobile-responsive dashboard using CSS Flexbox, Grid, custom CSS variables (`--navy`, `--teal`, `--amber`), and Bootstrap components (modals, nav-tabs, alerts).
- **Vanilla JavaScript**: Handles user interactions, form validation, DOM manipulation without full-page reloads, and communicates asynchronously with the Express backend using the **Fetch API**.
- **Leaflet.js & OpenStreetMap**: Renders an interactive map with the transit route polyline and stop pins without requiring paid map API keys.
- **Html5Qrcode**: Accesses the device camera securely in the browser to scan QR codes during boarding.

### Q3: What is the Fetch API and how does it compare to traditional form submissions?
**Answer**:
In traditional HTML forms, submitting a form triggers a synchronous HTTP POST request, causing the browser to reload the entire web page. 

The **Fetch API** provides a modern, Promise-based JavaScript interface for performing asynchronous HTTP requests (AJAX). It allows the browser to send and receive JSON data in the background, updating only specific elements of the DOM (e.g. updating the availability toggle or showing scan confirmation) without a jarring page refresh.

---

## 3. Backend Technologies & Architecture

### Q4: Why migrate from Python Flask to Node.js and Express.js?
**Answer**:
1. **Single Language Stack**: Using JavaScript on both client and server reduces context switching and allows shared data formats (JSON).
2. **Event-Driven Non-Blocking I/O**: Node.js operates on a single-threaded event loop with asynchronous I/O, making it exceptionally lightweight and high-throughput for concurrent I/O operations (such as dozens of students marking attendance simultaneously).
3. **Course Compliance**: The course syllabus requires Node.js, Express.js, and MySQL.

### Q5: What is a REST API and what makes an API RESTful?
**Answer**:
**REST** stands for **Representational State Transfer**. A RESTful API adheres to architectural constraints:
1. **Client-Server Separation**: Frontend and backend are decoupled and communicate solely via HTTP.
2. **Statelessness**: Each request from client to server must contain all information required to understand and process the request.
3. **Standard HTTP Methods**:
   - `GET`: Read resources (e.g., `GET /api/stops`).
   - `POST`: Create a new resource or execute a command (e.g., `POST /api/attendance/scan`).
   - `PUT`: Replace or update an entire resource (e.g., `PUT /api/admin/stops/:id`).
   - `PATCH`: Partially update a resource (e.g., `PATCH /api/admin/users/:id/status`).
   - `DELETE`: Remove a resource.
4. **JSON Representation**: Standardized JSON data format for request payloads and responses.

---

## 4. Database Design & MySQL

### Q6: Why is MySQL used instead of SQLite or MongoDB?
**Answer**:
1. **Relational Integrity**: SmartRoute inherently deals with structured relational entities (Users, Profiles, Routes, Stops, Daily Availability, Attendance Sessions, Attendance Records) that require strict foreign key constraints (`ON DELETE CASCADE`).
2. **ACID Transactions**: MySQL InnoDB guarantees Atomicity, Consistency, Isolation, and Durability, ensuring attendance records are committed reliably.
3. **Multi-User Concurrency**: Unlike file-based SQLite which locks the entire database file during writes, MySQL supports row-level locking, enabling simultaneous writes by students and drivers.

### Q7: How does the schema prevent duplicate availability and attendance records?
**Answer**:
Using **multi-column UNIQUE database constraints**:
1. `uq_student_daily_avail(student_id, availability_date)` in `student_availability`: Guarantees a student can never have more than one row for a given day. When a student changes their mind from YES to NO, an `INSERT ... ON DUPLICATE KEY UPDATE` statement updates the existing row in-place.
2. `uq_student_daily_attendance(student_id, attendance_date)` in `attendance_records`: Prevents a student from scanning the driver's QR code multiple times on the same day.

### Q8: How are SQL Injection attacks prevented?
**Answer**:
All database queries in SmartRoute are executed using **parameterized queries (prepared statements)** via the `mysql2/promise` library. The SQL statement template with `?` placeholders is sent to the MySQL server first to be parsed and compiled. User input parameters are sent separately and treated strictly as literal data, never as executable SQL code.

---

## 5. Security, Sessions, & QR-Code Architecture

### Q9: How does password security work in SmartRoute?
**Answer**:
Passwords are never stored in plaintext. When a user registers or is created by an admin, the password is processed using **bcrypt** with a cost factor (salt rounds) of 10. Bcrypt automatically generates a unique random salt and applies repeated cryptographic hashing to prevent rainbow table attacks. During login, `bcrypt.compare(password, user.password_hash)` verifies the password in constant time.

### Q10: How do login sessions and cookies work?
**Answer**:
1. User submits credentials to `POST /api/auth/login`.
2. Upon successful authentication, the server generates a new session and regenerates the session ID to prevent **session fixation attacks**.
3. The session data is saved server-side in the MySQL database using `express-mysql-session`.
4. The server sends back a signed `connect.sid` cookie with:
   - `HttpOnly: true` (prevents malicious JavaScript/XSS from stealing the cookie).
   - `SameSite: 'lax'` (defends against Cross-Site Request Forgery / CSRF).
   - `Secure: true` in production over HTTPS.

### Q11: Explain the complete security lifecycle of the 60-second QR code.
**Answer**:
1. **Generation**: The authorized driver clicks "Generate Attendance QR". The backend generates 32 bytes of cryptographic randomness using `crypto.randomBytes(32)` (64 hex characters).
2. **Storage**: To protect against database compromise, the server computes a **SHA-256 hash** of the token and stores `token_hash` in `attendance_sessions` with an expiration set to `NOW() + INTERVAL 60 SECOND`.
3. **Display**: The server returns the raw token encoded in a QR Code data URL along with an `expiresInSeconds: 60` countdown.
4. **Submission**: The student scans the QR code using their camera and submits the token to `POST /api/attendance/scan`.
5. **Server Validation**: The server hashes the incoming token with SHA-256 and searches for a matching session:
   - If not found &rarr; 400 Bad Request (forged token).
   - If `expires_at < CURRENT_TIMESTAMP` &rarr; 400 Bad Request (expired session).
   - If student already marked attendance today &rarr; 409 Conflict.
6. **Server-Generated Timestamp**: The attendance record is inserted using MySQL `CURRENT_TIMESTAMP`, ensuring students cannot manipulate attendance time.

---

## 6. Limitations & Future Scope

### Q12: What are the current limitations and future enhancements?
**Answer**:
- **Current Architecture**: Route guidance is based on student-declared availability; live bus tracking uses browser GPS sharing (`navigator.geolocation.watchPosition`).
- **Future Enhancements**:
  1. Dedicated onboard IoT hardware (ESP32/Raspberry Pi with GPS module) for continuous vehicle tracking.
  2. Push notifications / SMS alerts via Firebase Cloud Messaging (FCM) when the bus is 2 stops away.
  3. Machine learning predictive model to forecast student absence based on weather, day of the week, and past attendance trends.
