# SmartRoute — Automated Testing Report

## 1. Executive Summary

- **Total Test Suites**: 4
- **Total Tests Executed**: 28
- **Passed**: 28 (100%)
- **Failed**: 0
- **Execution Engine**: Node.js Built-in Test Runner (`node:test`) + Supertest (`supertest`)
- **Database Engine**: Live MySQL 8.0 with InnoDB Constraints

---

## 2. Test Execution Log

```text
> smartroute@2.0.0 test
> node --test --test-force-exit tests/*.test.js

[Database Pool] Successfully connected to MySQL database: smartroute
▶ Admin Management & Authorization Module Tests
  ✔ 1. Student attempting to access admin dashboard is rejected with 403 (19.1851ms)
  ✔ 2. Admin accesses dashboard stats successfully (31.8992ms)
  ✔ 3. Admin creates a new bus stop (24.118ms)
  ✔ 4. Admin deactivates and reactivates a bus stop (17.8295ms)
  ✔ 5. Admin retrieves attendance records filterable by date (14.0589ms)
  ✔ 6. Admin inspects audit security logs (13.643ms)
✔ Admin Management & Authorization Module Tests (548.0993ms)

[Database Pool] Successfully connected to MySQL database: smartroute
▶ QR-Code Attendance Module Tests
  ✔ 1. Driver generates a dynamic 60-second QR session (116.3699ms)
  ✔ 2. Student scans valid live QR token and marks attendance (31.4652ms)
  ✔ 3. Student attempting duplicate attendance scan on same day is rejected with 409 Conflict (153.8418ms)
  ✔ 4. Submitting invalid or forged token fails with 400 (11.7546ms)
  ✔ 5. Submitting expired QR session token is rejected with 400 Expired message (17.5905ms)
  ✔ 6. Student retrieves personal attendance history (22.0679ms)
✔ QR-Code Attendance Module Tests (793.7303ms)

[Database Pool] Successfully connected to MySQL database: smartroute
▶ Authentication Module Tests
  ✔ 1. Valid student login should return 200 and session user object (272.0794ms)
  ✔ 2. Valid driver login should return 200 and role driver (158.0489ms)
  ✔ 3. Valid admin login should return 200 and role admin (163.7715ms)
  ✔ 4. Login with wrong password should return 401 (137.5793ms)
  ✔ 5. Login with role mismatch should return 403 (116.929ms)
  ✔ 6. Public registration creates a student user with default student role (234.8908ms)
  ✔ 7. Unauthenticated request to protected route returns 401 (20.2203ms)
✔ Authentication Module Tests (1107.8098ms)

[Database Pool] Successfully connected to MySQL database: smartroute
▶ Student Availability Module Tests
  ✔ 1. Student submits availability YES with valid bus stop (25.2748ms)
  ✔ 2. Student updates availability to NO (skips stop) (20.7391ms)
  ✔ 3. Re-marking YES with different stop does not duplicate daily row (17.7944ms)
  ✔ 4. Submitting invalid stop ID fails with 400 (12.0274ms)
  ✔ 5. Student retrieves dashboard stats successfully (24.2681ms)
✔ Student Availability Module Tests (353.1684ms)

ℹ tests 28
ℹ suites 0
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 3361.7614
```

---

## 3. Verified Security & Business Rules

1. **Password Hashing**: Passwords are securely hashed with bcrypt (salt factor 10) and checked via `bcrypt.compare`.
2. **Session Regeneration**: Session IDs are regenerated upon successful authentication to defend against session fixation attacks.
3. **Role Authorization**: Role middleware strictly blocks students from accessing driver guidance or admin controls (`403 Forbidden`).
4. **Daily Availability Constraint**: `uq_student_daily_avail(student_id, availability_date)` prevents duplicate records and handles updates seamlessly with `ON DUPLICATE KEY UPDATE`.
5. **Anti-Replay & Anti-Fraud Attendance**:
   - Dynamic QR tokens expire on the server after 60 seconds.
   - Forged or expired tokens return `400 Bad Request`.
   - Repeated scans on the same calendar day return `409 Conflict`.
   - Attendance timestamps are server-generated (`CURRENT_TIMESTAMP`).

