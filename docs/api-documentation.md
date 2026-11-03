# SmartRoute — REST API Documentation

This document describes all API endpoints provided by the SmartRoute Express.js backend. All API requests accept and return JSON formatted data.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 `POST /api/auth/login`
Authenticates a user and establishes an HTTP session cookie.
- **Access**: Public
- **Rate Limit**: 20 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "username": "student1",
    "password": "password123",
    "role": "student"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "user": {
      "id": 3,
      "username": "student1",
      "email": "rahul@student.edu",
      "role": "student",
      "fullName": "Rahul Sharma"
    }
  }
  ```

### 1.2 `POST /api/auth/logout`
Destroys the current session and clears the session cookie.
- **Access**: Authenticated

### 1.3 `POST /api/auth/register`
Creates a new student account (public registration assigns `role: 'student'`).
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "priya_patel",
    "fullName": "Priya Patel",
    "email": "priya@student.edu",
    "enrollmentNumber": "2024BTCS002",
    "password": "password123"
  }
  ```

### 1.4 `GET /api/auth/me`
Returns current session profile and student details.
- **Access**: Authenticated

---

## 2. Student Availability Endpoints (`/api/availability`)

### 2.1 `GET /api/availability/me`
Retrieves student's today availability declaration and recent submission history.
- **Access**: Authenticated Student

### 2.2 `POST /api/availability`
Submits or updates daily transit availability for today.
- **Access**: Authenticated Student
- **Request Body**:
  ```json
  {
    "useBus": "YES",
    "stopId": 3,
    "latitude": 24.591111,
    "longitude": 73.689986
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Bus marked: YES for stop 'Chetak Circle'.",
    "data": {
      "availabilityDate": "2026-11-03",
      "useBus": "YES",
      "stopId": 3,
      "stopName": "Chetak Circle",
      "latitude": 24.591111,
      "longitude": 73.689986
    }
  }
  ```

### 2.3 `GET /api/availability/dashboard-stats`
Retrieves monthly attendance statistics, week breakdown cards, and primary route information.
- **Access**: Authenticated Student

### 2.4 `GET /api/availability/profile` & `POST /api/availability/profile`
Retrieves and updates extended student profile information.
- **Access**: Authenticated Student

---

## 3. Bus Stops & Routes Endpoints (`/api`)

### 3.1 `GET /api/stops`
Returns all active bus stops with geographic coordinates and scheduled pickup times.
- **Access**: Public / Authenticated

### 3.2 `GET /api/routes`
Returns list of active transit routes.
- **Access**: Public / Authenticated

### 3.3 `GET /api/routes/:id/stops`
Returns ordered sequence of stops for a specific route.
- **Access**: Public / Authenticated

---

## 4. Driver Dashboard Endpoints (`/api/driver`)

### 4.1 `GET /api/driver/dashboard`
Returns live guidance for the driver:
- List of stops with counts of waiting students.
- Skip indicator for empty stops.
- Manifest of confirmed riders.
- Live scan progress (scanned count vs active riders).
- **Access**: Driver / Admin
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "route": {
      "id": 1,
      "name": "Rampura to Campus",
      "busName": "Campus Route 01",
      "departureTime": "08:10 AM",
      "arrivalTime": "09:20 AM"
    },
    "stats": {
      "activeRiders": 2,
      "skippedRiders": 1,
      "totalStops": 12,
      "stopsToVisit": 4,
      "stopsToSkip": 8,
      "qrScanned": 1,
      "pendingScans": 1,
      "scanProgressPercent": 50
    },
    "stops": [ ... ],
    "riders": [ ... ]
  }
  ```

### 4.2 `POST /api/driver/location`
Stores current bus GPS coordinates.
- **Access**: Driver

### 4.3 `GET /api/driver/latest-location`
Fetches most recent live bus location recorded within the last 15 minutes.
- **Access**: Authenticated

---

## 5. QR Attendance Endpoints (`/api/attendance`)

### 5.1 `POST /api/attendance/sessions`
Generates a new dynamic 60-second QR session.
- **Access**: Driver / Admin
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Attendance QR code generated. Valid for 60 seconds.",
    "sessionId": 42,
    "token": "a1b2c3d4...",
    "qrDataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "expiresAt": "2026-11-03T14:30:00.000Z",
    "expiresInSeconds": 60
  }
  ```

### 5.2 `POST /api/attendance/scan`
Validates QR token and marks verified boarding attendance.
- **Access**: Student / Admin
- **Rate Limit**: 30 requests per minute
- **Request Body**:
  ```json
  {
    "token": "a1b2c3d4..."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Boarding attendance verified and marked successfully!",
    "attendance": {
      "id": 15,
      "date": "2026-11-03",
      "markedAt": "2026-11-03T14:29:45.000Z",
      "routeName": "Rampura to Campus",
      "busName": "Campus Route 01"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: "QR code has expired. Please ask the driver to refresh the QR code."
  - `409 Conflict`: "Attendance has already been marked today at 08:35 AM."

### 5.3 `GET /api/attendance/history`
Retrieves authenticated student's historical attendance records.
- **Access**: Student / Admin

---

## 6. Admin Management Endpoints (`/api/admin`)

- `GET /api/admin/dashboard`: System-wide statistics.
- `GET /api/admin/users`: List users (filterable by role, status, search).
- `POST /api/admin/users`: Create user (student, driver, admin).
- `PATCH /api/admin/users/:id/status`: Activate or deactivate user.
- `GET /api/admin/stops`: List all stops.
- `POST /api/admin/stops`: Create a new bus stop with coordinates.
- `PUT /api/admin/stops/:id`: Update stop name, time, or active status.
- `GET /api/admin/routes`: List routes.
- `POST /api/admin/routes`: Create route.
- `GET /api/admin/attendance`: View and filter college attendance logs.
- `GET /api/admin/logs`: View system audit trail.
