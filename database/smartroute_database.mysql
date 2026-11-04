-- ==================================================================
-- SmartRoute College Bus Management & Attendance System
-- Database Dump / Schema & Default Data
-- Compatible with: MySQL 8.0+, MariaDB 10.5+
-- ==================================================================

CREATE DATABASE IF NOT EXISTS smartroute;
USE smartroute;

-- SECTION 1: TABLES AND CONSTRAINTS

-- SmartRoute MySQL Database Schema
-- Compatible with MySQL 8.0+

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'driver', 'admin') NOT NULL DEFAULT 'student',
    full_name VARCHAR(120) NULL,
    account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    enrollment_number VARCHAR(50) NULL,
    mobile_number VARCHAR(20) NULL,
    address TEXT NULL,
    parent_name VARCHAR(120) NULL,
    parent_mobile_number VARCHAR(20) NULL,
    study_year VARCHAR(30) NULL,
    branch VARCHAR(80) NULL,
    program VARCHAR(80) NULL,
    specialization VARCHAR(120) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(120) NOT NULL UNIQUE,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    scheduled_time VARCHAR(20) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stop_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(120) NOT NULL,
    route_code VARCHAR(50) NOT NULL UNIQUE,
    bus_name VARCHAR(100) NOT NULL DEFAULT 'Campus Route',
    description VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Route Stops Mapping Table
CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    bus_stop_id INT NOT NULL,
    stop_order INT NOT NULL,
    scheduled_time VARCHAR(20) NULL,
    CONSTRAINT fk_rs_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_stop FOREIGN KEY (bus_stop_id) REFERENCES bus_stops(id) ON DELETE CASCADE,
    CONSTRAINT uq_route_stop_order UNIQUE (route_id, stop_order),
    CONSTRAINT uq_route_stop UNIQUE (route_id, bus_stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Student Daily Availability Table
CREATE TABLE IF NOT EXISTS student_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    availability_date DATE NOT NULL,
    use_bus ENUM('YES', 'NO') NOT NULL,
    bus_stop_id INT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_avail_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_avail_stop FOREIGN KEY (bus_stop_id) REFERENCES bus_stops(id) ON DELETE SET NULL,
    CONSTRAINT uq_student_daily_avail UNIQUE (student_id, availability_date),
    INDEX idx_avail_date (availability_date),
    INDEX idx_avail_use_bus (use_bus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QR Attendance Sessions Table (server validated, 60s expiration)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    route_id INT NOT NULL,
    session_date DATE NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    raw_token VARCHAR(255) NULL,
    expires_at DATETIME NOT NULL,
    is_revoked TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_session_token_hash (token_hash),
    INDEX idx_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_session_id INT NULL,
    route_id INT NULL,
    bus_stop_id INT NULL,
    attendance_date DATE NOT NULL,
    marked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) NOT NULL DEFAULT 'QR_SCAN',
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_session FOREIGN KEY (attendance_session_id) REFERENCES attendance_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_att_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    CONSTRAINT fk_att_stop FOREIGN KEY (bus_stop_id) REFERENCES bus_stops(id) ON DELETE SET NULL,
    CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, attendance_date),
    INDEX idx_att_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Driver Route Assignments Table
CREATE TABLE IF NOT EXISTS driver_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    route_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT uq_driver_date UNIQUE (driver_id, assigned_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bus Live Locations Table
CREATE TABLE IF NOT EXISTS bus_live_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    route_id INT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_live_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_live_recorded (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. System Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- SECTION 2: INITIAL BUS STOPS & ROUTE SEED DATA

-- SmartRoute Seed Data (Clean Setup - No Demo Users)

-- 1. Insert Bus Stops (Campus Route Stops)
INSERT INTO bus_stops (id, stop_name, latitude, longitude, scheduled_time, is_active)
VALUES
(1, 'Rampura Circle', 24.583676, 73.651993, '08:10 AM', 1),
(2, 'Malla Talai Circle', 24.583717, 73.669451, '08:13 AM', 1),
(3, 'Chetak Circle', 24.591111, 73.689986, '08:17 AM', 1),
(4, 'Court Circle', 24.588322, 73.695866, '08:20 AM', 1),
(5, 'Shastri Circle', 24.587008, 73.699107, '08:30 AM', 1),
(6, 'Inox', 24.586439, 73.709010, '08:33 AM', 1),
(7, 'Kumharo Ka Bhatta', 24.579577, 73.709714, '08:35 AM', 1),
(8, 'Sewashram', 24.582133, 73.722158, '08:40 AM', 1),
(9, 'Thokar', 24.583543, 73.725967, '08:42 AM', 1),
(10, 'Glass Factory', 24.586708, 73.738590, '08:44 AM', 1),
(11, 'Pratap Nagar', 24.590152, 73.747573, '08:50 AM', 1),
(12, 'Campus', 24.615456, 73.991489, '09:20 AM', 1)
ON DUPLICATE KEY UPDATE latitude=VALUES(latitude), longitude=VALUES(longitude);

-- 3. Insert Main Campus Route
INSERT INTO routes (id, route_name, route_code, bus_name, description, is_active)
VALUES
(1, 'Rampura to Campus', 'ROUTE-01', 'Campus Route 01', 'Morning standard college transit covering western to eastern pickup corridors to campus.', 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 4. Insert Route Stops Ordering
INSERT INTO route_stops (route_id, bus_stop_id, stop_order, scheduled_time)
VALUES
(1, 1, 1, '08:10 AM'),
(1, 2, 2, '08:13 AM'),
(1, 3, 3, '08:17 AM'),
(1, 4, 4, '08:20 AM'),
(1, 5, 5, '08:30 AM'),
(1, 6, 6, '08:33 AM'),
(1, 7, 7, '08:35 AM'),
(1, 8, 8, '08:40 AM'),
(1, 9, 9, '08:42 AM'),
(1, 10, 10, '08:44 AM'),
(1, 11, 11, '08:50 AM'),
(1, 12, 12, '09:20 AM')
ON DUPLICATE KEY UPDATE scheduled_time=VALUES(scheduled_time);
