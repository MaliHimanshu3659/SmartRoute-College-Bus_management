-- SmartRoute Seed Data (Clean Setup - No Demo Users)
USE smartroute;

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
