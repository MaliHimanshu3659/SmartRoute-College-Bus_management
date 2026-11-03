-- SmartRoute Seed Data
USE smartroute;

-- 1. Insert Default Users (Password: password123)
-- Hash: $2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6
INSERT INTO users (id, username, email, password_hash, role, full_name, account_status)
VALUES
(1, 'admin', 'admin@smartroute.edu', '$2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6', 'admin', 'System Administrator', 'active'),
(2, 'driver1', 'driver1@smartroute.edu', '$2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6', 'driver', 'Ramesh Kumar (Driver)', 'active'),
(3, 'student1', 'rahul@student.edu', '$2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6', 'student', 'Rahul Sharma', 'active'),
(4, 'student2', 'priya@student.edu', '$2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6', 'student', 'Priya Patel', 'active'),
(5, 'student3', 'amit@student.edu', '$2b$10$B2ljfW1GA/50/bnOXJageOvyHr0ul9ud83460BPnCvVJUlKe7tgU6', 'student', 'Amit Verma', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role);

-- 2. Insert Student Profiles
INSERT INTO student_profiles (user_id, enrollment_number, mobile_number, address, parent_name, parent_mobile_number, study_year, branch, program, specialization)
VALUES
(3, '2024BTCS001', '9876543210', '12 Near Chetak Circle, Udaipur', 'Suresh Sharma', '9876543211', '2nd Year', 'Computer Science & Engineering', 'B.Tech', 'Full Stack Development'),
(4, '2024BTCS002', '9876543220', '45 Shastri Circle, Udaipur', 'Mahesh Patel', '9876543221', '2nd Year', 'Computer Science & Engineering', 'B.Tech', 'Data Science'),
(5, '2024BTCS003', '9876543230', '78 Pratap Nagar, Udaipur', 'Dinesh Verma', '9876543231', '3rd Year', 'Information Technology', 'B.Tech', 'Cloud Computing')
ON DUPLICATE KEY UPDATE enrollment_number=VALUES(enrollment_number);

-- 3. Insert Bus Stops (from Udaipur Campus Route)
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

-- 4. Insert Main Campus Route
INSERT INTO routes (id, route_name, route_code, bus_name, description, is_active)
VALUES
(1, 'Rampura to Campus', 'ROUTE-01', 'Campus Route 01', 'Morning standard college transit covering western to eastern pickup corridors to campus.', 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 5. Insert Route Stops Ordering
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

-- 6. Assign Driver to Route for Today
INSERT INTO driver_assignments (driver_id, route_id, assigned_date, is_active)
VALUES
(2, 1, CURDATE(), 1)
ON DUPLICATE KEY UPDATE is_active=1;

-- 7. Insert Today's Sample Student Availability
INSERT INTO student_availability (student_id, availability_date, use_bus, bus_stop_id, latitude, longitude)
VALUES
(3, CURDATE(), 'YES', 3, 24.591111, 73.689986),
(4, CURDATE(), 'YES', 5, 24.587008, 73.699107),
(5, CURDATE(), 'NO', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE use_bus=VALUES(use_bus), bus_stop_id=VALUES(bus_stop_id);

