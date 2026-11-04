const fs = require('fs');
const path = require('path');

let landingBase64 = '';
let loginBase64 = '';

try {
  if (fs.existsSync('docs/screenshots/landing_page.png')) {
    landingBase64 = fs.readFileSync('docs/screenshots/landing_page.png').toString('base64');
  }
  if (fs.existsSync('docs/screenshots/login_page.png')) {
    loginBase64 = fs.readFileSync('docs/screenshots/login_page.png').toString('base64');
  }
} catch (e) {
  console.log('Screenshots read warning:', e.message);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Minor Project Report - SmartRoute College Bus Management System</title>
    <style>
        @page {
            size: A4;
            margin: 22mm 20mm 25mm 20mm;
            @bottom-right {
                content: "Page " counter(page);
                font-size: 9pt;
                color: #555;
            }
            @bottom-left {
                content: "SmartRoute — Web Development Minor Project";
                font-size: 9pt;
                color: #555;
            }
        }
        
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #24292f;
            background: #fff;
            margin: 0;
            padding: 0;
        }

        .cover-page {
            page-break-after: always;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            padding: 40px 20px;
            box-sizing: border-box;
        }

        .cover-header {
            margin-top: 30px;
        }

        .cover-header h3 {
            font-size: 15pt;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #4b5563;
            margin: 0 0 10px 0;
            font-weight: 600;
        }

        .cover-header h4 {
            font-size: 13pt;
            font-weight: 500;
            color: #6b7280;
            margin: 0;
        }

        .cover-title {
            margin: 70px 0;
        }

        .cover-title h1 {
            font-size: 28pt;
            font-weight: 800;
            color: #1e3a8a;
            line-height: 1.25;
            margin: 0 0 15px 0;
            letter-spacing: -0.5px;
        }

        .cover-title p {
            font-size: 14pt;
            color: #4b5563;
            margin: 0 auto;
            max-width: 600px;
            line-height: 1.5;
        }

        .cover-badge {
            display: inline-block;
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11pt;
            font-weight: 600;
            margin-top: 25px;
        }

        .cover-details {
            display: flex;
            justify-content: space-between;
            text-align: left;
            margin-bottom: 40px;
            border-top: 2px solid #e5e7eb;
            padding-top: 25px;
        }

        .cover-details-col {
            flex: 1;
        }

        .cover-details-col h5 {
            font-size: 11pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #9ca3af;
            margin: 0 0 8px 0;
        }

        .cover-details-col p {
            font-size: 11pt;
            margin: 2px 0;
            color: #1f2937;
        }

        .cover-links {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: left;
            font-size: 10pt;
            margin-top: 20px;
        }

        .cover-links div {
            margin: 4px 0;
        }

        .cover-links strong {
            color: #0f172a;
            display: inline-block;
            width: 140px;
        }

        .cover-links a {
            color: #2563eb;
            text-decoration: none;
            word-break: break-all;
        }

        /* Content styling */
        h1, h2, h3, h4 {
            color: #0f172a;
            font-weight: 700;
            page-break-after: avoid;
        }

        h2 {
            font-size: 18pt;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 35px;
            margin-bottom: 18px;
            color: #1e3a8a;
        }

        h3 {
            font-size: 14pt;
            margin-top: 24px;
            margin-bottom: 12px;
            color: #1e293b;
        }

        h4 {
            font-size: 12pt;
            margin-top: 18px;
            margin-bottom: 8px;
            color: #334155;
        }

        p {
            margin: 0 0 12px 0;
            text-align: justify;
        }

        ul, ol {
            margin: 0 0 16px 0;
            padding-left: 24px;
        }

        li {
            margin-bottom: 6px;
        }

        .page-break {
            page-break-before: always;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0 24px 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        table, th, td {
            border: 1px solid #cbd5e1;
        }

        th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
        }

        td {
            padding: 7px 10px;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .code-box {
            background: #0f172a;
            color: #e2e8f0;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 9pt;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 14px 0;
            white-space: pre-wrap;
            line-height: 1.45;
            page-break-inside: avoid;
        }

        .info-callout {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 12px 16px;
            border-radius: 0 6px 6px 0;
            margin: 16px 0;
            font-size: 10pt;
        }

        .warning-callout {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 0 6px 6px 0;
            margin: 16px 0;
            font-size: 10pt;
        }

        .diagram-container {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            page-break-inside: avoid;
        }

        .screenshot-card {
            margin: 18px 0 24px 0;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            page-break-inside: avoid;
            background: #fff;
        }

        .screenshot-card img {
            width: 100%;
            height: auto;
            display: block;
            border-bottom: 1px solid #e2e8f0;
        }

        .screenshot-caption {
            padding: 8px 14px;
            background: #f8fafc;
            font-size: 9.5pt;
            color: #475569;
            font-weight: 500;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 8pt;
            font-weight: 600;
            border-radius: 4px;
        }

        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-primary { background: #dbeafe; color: #1d4ed8; }
        .badge-warning { background: #fef3c7; color: #b45309; }

        .toc-list {
            list-style-type: none;
            padding-left: 0;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px dotted #cbd5e1;
            padding-bottom: 4px;
        }

        .toc-item span:first-child {
            font-weight: 500;
            color: #1e293b;
        }
        
        .toc-item span:last-child {
            color: #64748b;
            font-weight: 600;
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div class="cover-header">
            <h3>Minor Project Report</h3>
            <h4>Course: Web Development (Modules 1–5)</h4>
        </div>

        <div class="cover-title">
            <h1>SmartRoute: Intelligent College Bus Management & Dynamic Attendance System</h1>
            <p>A full-stack, responsive web application engineered with semantic HTML5, CSS3, JavaScript Fetch API, Bootstrap 5, Node.js, Express.js REST APIs, and a relational MySQL database.</p>
            <div class="cover-badge">Academic Minor Project Submission</div>
        </div>

        <div>
            <div class="cover-details">
                <div class="cover-details-col">
                    <h5>Submitted By:</h5>
                    <p><strong>Himanshu Mali</strong></p>
                    <p>Enrollment: SPSU/B.Tech/CSE</p>
                    <p>B.Tech Computer Science & Engineering</p>
                </div>
                <div class="cover-details-col" style="text-align: right;">
                    <h5>Academic Session:</h5>
                    <p>Semester VI (2026)</p>
                    <p>Department of Computer Science</p>
                    <p>School of Engineering</p>
                </div>
            </div>

            <div class="cover-links">
                <div><strong>Live Server URL:</strong> <a href="https://smartroute-red.vercel.app">https://smartroute-red.vercel.app</a></div>
                <div><strong>GitHub Repository:</strong> <a href="https://github.com/MaliHimanshu3659/SmartRoute-College-Bus_management">https://github.com/MaliHimanshu3659/SmartRoute-College-Bus_management</a></div>
                <div><strong>Database Schema:</strong> smartroute_database.sql / smartroute_database.mysql (MySQL 8.0+)</div>
            </div>
        </div>
    </div>

    <!-- TABLE OF CONTENTS -->
    <div class="page-break"></div>
    <h2>Table of Contents</h2>
    <ul class="toc-list" style="margin-top: 25px;">
        <li class="toc-item"><span>1. Project Title & Introduction</span> <span>Section 1</span></li>
        <li class="toc-item"><span>2. Problem Statement & Objectives</span> <span>Section 2</span></li>
        <li class="toc-item"><span>3. Scope & System Requirements</span> <span>Section 3</span></li>
        <li class="toc-item"><span>4. System Design & Architectural Overview</span> <span>Section 4</span></li>
        <li class="toc-item"><span>5. Database Design & Entity-Relationship (ER) Model</span> <span>Section 5</span></li>
        <li class="toc-item"><span>6. Implementation Details & Web Technology Stack</span> <span>Section 6</span></li>
        <li class="toc-item"><span>7. Visual Walkthrough & Module Screenshots</span> <span>Section 7</span></li>
        <li class="toc-item"><span>8. Testing, Verification Matrix & Results</span> <span>Section 8</span></li>
        <li class="toc-item"><span>9. Conclusion & Future Enhancements</span> <span>Section 9</span></li>
        <li class="toc-item"><span>10. References & Technical Bibliography</span> <span>Section 10</span></li>
    </ul>

    <!-- SECTION 1 -->
    <div class="page-break"></div>
    <h2>1. Project Title & Introduction</h2>
    <h3>1.1 Project Title</h3>
    <p><strong>SmartRoute: Intelligent College Bus Management & Dynamic Attendance System</strong></p>
    
    <h3>1.2 Executive Summary</h3>
    <p>Efficient student transportation is a crucial logistical backbone for educational campuses. Traditional college transit management frequently relies on manual student manifests, fixed bus schedules that ignore day-to-day attendance variations, and vocal roll-calling. These antiquated procedures result in prolonged travel delays, high fuel consumption caused by stopping at deserted locations, and frequent attendance discrepancies.</p>
    
    <p><strong>SmartRoute</strong> is a comprehensive, production-tested web platform engineered to modernize college transit. It enables three core personas—<strong>Students</strong>, <strong>Bus Drivers</strong>, and <strong>Campus Administrators</strong>—to coordinate in real time. The platform provides interactive Leaflet.js stop navigation, daily commute availability declarations, smart route optimization that pinpoints which bus stops can be skipped when zero riders are registered, and a secure attendance verification system utilizing cryptographically generated 60-second expiring dynamic QR codes.</p>

    <h3>1.3 Relevance to Web Development Syllabus</h3>
    <p>The project rigorously implements every foundational concept specified in Modules 1 through 5 of the Web Development curriculum:</p>
    <ul>
        <li><strong>Module 1 (Semantic HTML5):</strong> Accessible web page structure, forms, tables, canvas elements, and semantic tagging without proprietary frameworks.</li>
        <li><strong>Module 2 (CSS3 Styling & Responsive Design):</strong> Custom CSS variables, Flexbox, CSS Grid layouts, media queries for mobile-first compatibility, and modern UI components.</li>
        <li><strong>Module 3 (JavaScript Fundamentals & DOM):</strong> Event-driven architecture, form validation, dynamic DOM rendering, and client-side state manipulation.</li>
        <li><strong>Module 4 (AJAX, JSON, and APIs):</strong> Asynchronous client-server communication using the native <code>fetch()</code> API, JSON data exchange, and Leaflet map API integration.</li>
        <li><strong>Module 5 (Backend Architecture & Database Integration):</strong> Node.js with Express.js RESTful routing, session-based cookie authentication, cryptographic password hashing with <code>bcryptjs</code>, and normalized MySQL relational database operations with foreign key integrity.</li>
    </ul>

    <!-- SECTION 2 -->
    <h2>2. Problem Statement & Objectives</h2>
    <h3>2.1 Problem Statement</h3>
    <p>University transit fleets face multiple operational bottlenecks on a daily basis:</p>
    <ol>
        <li><strong>Wasted Fuel and Idle Driving:</strong> Fleet buses routinely travel to every scheduled stop along an expansive route, even when enrolled students are absent, causing unnecessary fuel expenditures, carbon emissions, and transit delays.</li>
        <li><strong>Manual & Inaccurate Attendance:</strong> Drivers attempting to manually record paper attendance while navigating dense city traffic creates severe safety hazards and inaccurate records.</li>
        <li><strong>Proxy Attendance Vulnerabilities:</strong> Static barcodes or physical ID cards allow unauthorized students to clock in for absent peers or share static QR screenshots.</li>
        <li><strong>Information Asymmetry:</strong> Students lack visibility into whether their designated bus has departed, which stops have been serviced, or when they are expected at the pickup point.</li>
    </ol>

    <h3>2.2 Project Objectives</h3>
    <p>The primary engineering objectives of SmartRoute are:</p>
    <ul>
        <li><strong>Dynamic Daily Commute Declaration:</strong> Provide students with an intuitive daily toggle (<em>"Will you use the bus today?"</em>) that locks at departure time and informs the system of active pickups.</li>
        <li><strong>Active Stop & Empty Stop Differentiation:</strong> Automatically aggregate daily declarations so drivers clearly see which stops have waiting students and which stops have zero riders and can be safely bypassed.</li>
        <li><strong>Cryptographic Time-Expiring QR Code Attendance:</strong> Generate dynamic QR tokens on the driver's display that refresh every 60 seconds and are verified against server-side SHA-256 hashes, eliminating screenshot sharing and proxy marking.</li>
        <li><strong>Real-Time Route & Fleet Visualization:</strong> Deliver lightweight OpenStreetMap and Leaflet.js interactive maps for students and drivers showing pickup coordinates and transit trajectories.</li>
        <li><strong>Role-Based Access Control (RBAC):</strong> Guarantee secure session authorization with distinct dashboards tailored exclusively for Students, Drivers, and Administrators.</li>
    </ul>

    <!-- SECTION 3 -->
    <div class="page-break"></div>
    <h2>3. Scope & System Requirements</h2>
    
    <h3>3.1 Functional Requirements by Persona</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 20%;">User Role</th>
                <th style="width: 40%;">Core Capabilities</th>
                <th style="width: 40%;">Backend & Database Trigger</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Student</strong></td>
                <td>
                    • Self-registration & profile management.<br>
                    • Daily attendance availability toggle (YES/NO).<br>
                    • Preferred bus stop selection from active routes.<br>
                    • Camera-based QR code scanner for attendance.<br>
                    • Personal attendance history & logs.
                </td>
                <td>
                    • <code>POST /api/student/availability</code><br>
                    • <code>POST /api/student/scan-attendance</code><br>
                    • <code>GET /api/student/history</code><br>
                    • Updates <code>student_availability</code> & <code>attendance_records</code>.
                </td>
            </tr>
            <tr>
                <td><strong>Driver</strong></td>
                <td>
                    • Route departure activation & stop sequence tracking.<br>
                    • Real-time waiting student count per stop.<br>
                    • Visual alert for empty stops (Skip Candidate).<br>
                    • Dynamic 60-second rotating QR code broadcast.<br>
                    • GPS position broadcaster to server.
                </td>
                <td>
                    • <code>GET /api/driver/route-summary</code><br>
                    • <code>POST /api/driver/qr/generate</code><br>
                    • <code>POST /api/driver/location/update</code><br>
                    • Manages <code>attendance_sessions</code> table.
                </td>
            </tr>
            <tr>
                <td><strong>Administrator</strong></td>
                <td>
                    • Comprehensive fleet, route, and stop management.<br>
                    • Add/modify bus stops with precise GPS latitude/longitude.<br>
                    • Driver route assignment and reassignment.<br>
                    • Campus-wide ridership analytics and audit logging.
                </td>
                <td>
                    • <code>POST /api/admin/stops</code><br>
                    • <code>POST /api/admin/routes</code><br>
                    • <code>GET /api/admin/reports</code><br>
                    • Full CRUD on <code>bus_stops</code>, <code>routes</code>, <code>users</code>.
                </td>
            </tr>
        </tbody>
    </table>

    <h3>3.2 Non-Functional Requirements</h3>
    <ul>
        <li><strong>Security:</strong> Passwords hashed with <code>bcryptjs</code> (salt rounds 10). Session identifiers stored in encrypted HTTP-only cookies with <code>SameSite=Lax</code>. QR tokens protected by 64-character SHA-256 hashes and 60-second database TTL.</li>
        <li><strong>Performance:</strong> Sub-50ms API response time via MySQL connection pooling (<code>mysql2/promise</code>). Map tiles cached through a local serverless proxy with an in-memory/tmp cache to minimize external network latency.</li>
        <li><strong>Cross-Device Responsiveness:</strong> 100% fluid mobile, tablet, and desktop layout driven by Bootstrap 5 CSS grid and media queries.</li>
        <li><strong>Reliability:</strong> Graceful degradation in serverless environments; resilient database connection retry logic with structured error responses.</li>
    </ul>

    <h3>3.3 Hardware & Software Specifications</h3>
    <table>
        <thead>
            <tr>
                <th>Component</th>
                <th>Development / Local Environment</th>
                <th>Production Environment (Cloud)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Operating System</strong></td>
                <td>Windows 10 / 11 64-bit / Linux / macOS</td>
                <td>Amazon Linux 2 / Vercel Edge Serverless (Node.js 20.x)</td>
            </tr>
            <tr>
                <td><strong>Runtime Environment</strong></td>
                <td>Node.js v20.x or v22.x LTS</td>
                <td>Node.js v20.x Serverless Runtime Engine</td>
            </tr>
            <tr>
                <td><strong>Database Engine</strong></td>
                <td>MySQL Community Server 8.0 (InnoDB)</td>
                <td>Cloud MySQL 8.0 (TiDB Cloud / Aiven / PlanetScale)</td>
            </tr>
            <tr>
                <td><strong>Web Framework</strong></td>
                <td>Express.js 4.19+ REST API Server</td>
                <td>Vercel Serverless Function Handler (<code>api/index.js</code>)</td>
            </tr>
            <tr>
                <td><strong>Version Control</strong></td>
                <td>Git 2.45+ (Local Branching)</td>
                <td>GitHub Repository (CI/CD Automated Deployments)</td>
            </tr>
        </tbody>
    </table>

    <!-- SECTION 4 -->
    <div class="page-break"></div>
    <h2>4. System Design & Architectural Overview</h2>
    <h3>4.1 High-Level Architecture</h3>
    <p>SmartRoute adopts a 3-tier client-server architectural paradigm comprising a Presentation Layer, an Application / Business Logic Layer, and a Relational Data Persistence Layer.</p>

    <div class="diagram-container">
        <svg viewBox="0 0 700 260" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
            <!-- Layers -->
            <rect x="20" y="20" width="190" height="220" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
            <text x="115" y="48" font-family="Arial" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Presentation Tier</text>
            <rect x="35" y="65" width="160" height="38" rx="5" fill="#ffffff" stroke="#93c5fd"/>
            <text x="115" y="88" font-family="Arial" font-size="10.5" fill="#1e293b" text-anchor="middle">Student Web Portal</text>
            <rect x="35" y="115" width="160" height="38" rx="5" fill="#ffffff" stroke="#93c5fd"/>
            <text x="115" y="138" font-family="Arial" font-size="10.5" fill="#1e293b" text-anchor="middle">Driver Tablet Console</text>
            <rect x="35" y="165" width="160" height="38" rx="5" fill="#ffffff" stroke="#93c5fd"/>
            <text x="115" y="188" font-family="Arial" font-size="10.5" fill="#1e293b" text-anchor="middle">Admin Management</text>

            <!-- Arrows 1 to 2 -->
            <line x1="210" y1="130" x2="255" y2="130" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
            <text x="233" y="120" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle">HTTPS</text>
            <text x="233" y="145" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle">JSON/REST</text>

            <!-- Application Tier -->
            <rect x="255" y="20" width="200" height="220" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
            <text x="355" y="48" font-family="Arial" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">Application Tier (Node.js)</text>
            <rect x="270" y="65" width="170" height="32" rx="5" fill="#ffffff" stroke="#86efac"/>
            <text x="355" y="85" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="middle">Express.js Router & Auth</text>
            <rect x="270" y="105" width="170" height="32" rx="5" fill="#ffffff" stroke="#86efac"/>
            <text x="355" y="125" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="middle">QR Service (SHA-256 TTL)</text>
            <rect x="270" y="145" width="170" height="32" rx="5" fill="#ffffff" stroke="#86efac"/>
            <text x="355" y="165" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="middle">Route Optimization Controller</text>
            <rect x="270" y="185" width="170" height="32" rx="5" fill="#ffffff" stroke="#86efac"/>
            <text x="355" y="205" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="middle">Tile Proxy & Caching</text>

            <!-- Arrows 2 to 3 -->
            <line x1="455" y1="130" x2="500" y2="130" stroke="#475569" stroke-width="2"/>
            <text x="478" y="120" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle">TCP 3306</text>
            <text x="478" y="145" font-family="Arial" font-size="9" fill="#64748b" text-anchor="middle">Pool</text>

            <!-- Database Tier -->
            <rect x="500" y="20" width="180" height="220" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="2"/>
            <text x="590" y="48" font-family="Arial" font-size="13" font-weight="bold" fill="#581c87" text-anchor="middle">Database Tier (MySQL)</text>
            <rect x="515" y="65" width="150" height="28" rx="4" fill="#ffffff" stroke="#d8b4fe"/>
            <text x="590" y="83" font-family="Arial" font-size="9.5" fill="#1e293b" text-anchor="middle">users & student_profiles</text>
            <rect x="515" y="100" width="150" height="28" rx="4" fill="#ffffff" stroke="#d8b4fe"/>
            <text x="590" y="118" font-family="Arial" font-size="9.5" fill="#1e293b" text-anchor="middle">bus_stops & routes</text>
            <rect x="515" y="135" width="150" height="28" rx="4" fill="#ffffff" stroke="#d8b4fe"/>
            <text x="590" y="153" font-family="Arial" font-size="9.5" fill="#1e293b" text-anchor="middle">student_availability</text>
            <rect x="515" y="170" width="150" height="28" rx="4" fill="#ffffff" stroke="#d8b4fe"/>
            <text x="590" y="188" font-family="Arial" font-size="9.5" fill="#1e293b" text-anchor="middle">attendance_sessions</text>
            <rect x="515" y="205" width="150" height="28" rx="4" fill="#ffffff" stroke="#d8b4fe"/>
            <text x="590" y="223" font-family="Arial" font-size="9.5" fill="#1e293b" text-anchor="middle">attendance_records</text>
        </svg>
    </div>

    <h3>4.2 Dynamic QR Verification Workflow</h3>
    <ol>
        <li><strong>Session Initialization:</strong> Upon driver departure, the driver console calls <code>POST /api/driver/qr/generate</code>.</li>
        <li><strong>Cryptographic Token Creation:</strong> The backend generates a 32-byte cryptographic random string, creates a SHA-256 hash, and inserts the record into <code>attendance_sessions</code> with <code>expires_at = NOW() + 60s</code>.</li>
        <li><strong>Display & Refresh:</strong> The plaintext token is converted to a high-resolution QR matrix displayed on the driver's dashboard, with a visible countdown timer.</li>
        <li><strong>Student Scan & Submission:</strong> The student opens their dashboard, clicks "Scan QR Attendance", grants camera access via the HTML5 <code>MediaDevices.getUserMedia()</code> API, and transmits the decoded token to <code>POST /api/student/scan-attendance</code>.</li>
        <li><strong>Verification & Record Creation:</strong> The server computes the SHA-256 hash of the received token, validates that <code>expires_at > NOW()</code> and <code>is_revoked = 0</code>, checks the uniqueness constraint for the day, records the verified attendance record, and returns a verified JSON response.</li>
    </ol>

    <!-- SECTION 5 -->
    <div class="page-break"></div>
    <h2>5. Database Design & Entity-Relationship (ER) Model</h2>
    <h3>5.1 Relational Entity-Relationship Diagram</h3>
    <p>The database consists of 11 relational tables configured with InnoDB storage engine, UTF8MB4 character encoding, primary keys, indexing on query-heavy columns, and cascading foreign keys.</p>

    <div class="diagram-container">
        <svg viewBox="0 0 700 360" width="100%" height="340" xmlns="http://www.w3.org/2000/svg">
            <!-- users table -->
            <rect x="20" y="20" width="180" height="150" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="20" y="20" width="180" height="28" rx="6" fill="#0f172a"/>
            <text x="110" y="38" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">users</text>
            <text x="30" y="65" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="30" y="82" font-family="Courier" font-size="10" fill="#1e293b">    username (VARCHAR)</text>
            <text x="30" y="99" font-family="Courier" font-size="10" fill="#1e293b">    password_hash (VARCHAR)</text>
            <text x="30" y="116" font-family="Courier" font-size="10" fill="#1e293b">    role (ENUM: s/d/a)</text>
            <text x="30" y="133" font-family="Courier" font-size="10" fill="#1e293b">    account_status</text>
            <text x="30" y="150" font-family="Courier" font-size="10" fill="#1e293b">    created_at</text>

            <!-- student_profiles table -->
            <rect x="20" y="200" width="180" height="130" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="20" y="200" width="180" height="28" rx="6" fill="#1e3a8a"/>
            <text x="110" y="218" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">student_profiles</text>
            <text x="30" y="245" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="30" y="262" font-family="Courier" font-size="10" fill="#2563eb">FK  user_id (INT)</text>
            <text x="30" y="279" font-family="Courier" font-size="10" fill="#1e293b">    enrollment_number</text>
            <text x="30" y="296" font-family="Courier" font-size="10" fill="#1e293b">    mobile_number</text>
            <text x="30" y="313" font-family="Courier" font-size="10" fill="#1e293b">    branch, year</text>

            <!-- Line users to student_profiles -->
            <line x1="110" y1="170" x2="110" y2="200" stroke="#2563eb" stroke-width="2"/>

            <!-- student_availability table -->
            <rect x="250" y="20" width="200" height="150" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="250" y="20" width="200" height="28" rx="6" fill="#047857"/>
            <text x="350" y="38" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">student_availability</text>
            <text x="260" y="65" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="260" y="82" font-family="Courier" font-size="10" fill="#2563eb">FK  student_id (INT)</text>
            <text x="260" y="99" font-family="Courier" font-size="10" fill="#1e293b">    availability_date (DATE)</text>
            <text x="260" y="116" font-family="Courier" font-size="10" fill="#1e293b">    use_bus (ENUM: YES/NO)</text>
            <text x="260" y="133" font-family="Courier" font-size="10" fill="#2563eb">FK  bus_stop_id (INT)</text>
            <text x="260" y="150" font-family="Courier" font-size="10" fill="#1e293b">    updated_at</text>

            <!-- Line users to availability -->
            <line x1="200" y1="95" x2="250" y2="95" stroke="#2563eb" stroke-width="2"/>

            <!-- bus_stops table -->
            <rect x="500" y="20" width="180" height="130" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="500" y="20" width="180" height="28" rx="6" fill="#b45309"/>
            <text x="590" y="38" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">bus_stops</text>
            <text x="510" y="65" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="510" y="82" font-family="Courier" font-size="10" fill="#1e293b">    stop_name (VARCHAR)</text>
            <text x="510" y="99" font-family="Courier" font-size="10" fill="#1e293b">    latitude (DECIMAL)</text>
            <text x="510" y="116" font-family="Courier" font-size="10" fill="#1e293b">    longitude (DECIMAL)</text>
            <text x="510" y="133" font-family="Courier" font-size="10" fill="#1e293b">    scheduled_time</text>

            <!-- Line availability to bus_stops -->
            <line x1="450" y1="120" x2="500" y2="120" stroke="#b45309" stroke-width="2"/>

            <!-- attendance_sessions table -->
            <rect x="250" y="200" width="200" height="140" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="250" y="200" width="200" height="28" rx="6" fill="#6d28d9"/>
            <text x="350" y="218" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">attendance_sessions</text>
            <text x="260" y="245" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="260" y="262" font-family="Courier" font-size="10" fill="#2563eb">FK  driver_id (INT)</text>
            <text x="260" y="279" font-family="Courier" font-size="10" fill="#2563eb">FK  route_id (INT)</text>
            <text x="260" y="296" font-family="Courier" font-size="10" fill="#1e293b">    token_hash (VARCHAR 64)</text>
            <text x="260" y="313" font-family="Courier" font-size="10" fill="#1e293b">    expires_at (DATETIME)</text>
            <text x="260" y="330" font-family="Courier" font-size="10" fill="#1e293b">    is_revoked (TINYINT)</text>

            <!-- attendance_records table -->
            <rect x="500" y="200" width="180" height="140" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <rect x="500" y="200" width="180" height="28" rx="6" fill="#be123c"/>
            <text x="590" y="218" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">attendance_records</text>
            <text x="510" y="245" font-family="Courier" font-size="10" fill="#b91c1c">PK  id (INT)</text>
            <text x="510" y="262" font-family="Courier" font-size="10" fill="#2563eb">FK  student_id (INT)</text>
            <text x="510" y="279" font-family="Courier" font-size="10" fill="#2563eb">FK  attendance_session_id</text>
            <text x="510" y="296" font-family="Courier" font-size="10" fill="#1e293b">    attendance_date (DATE)</text>
            <text x="510" y="313" font-family="Courier" font-size="10" fill="#1e293b">    marked_at (DATETIME)</text>
            <text x="510" y="330" font-family="Courier" font-size="10" fill="#1e293b">    source ('QR_SCAN')</text>

            <!-- Connections -->
            <line x1="450" y1="270" x2="500" y2="270" stroke="#be123c" stroke-width="2"/>
        </svg>
    </div>

    <h3>5.2 Data Dictionary (Key Tables)</h3>
    <table>
        <thead>
            <tr>
                <th>Table Name</th>
                <th>Primary Key</th>
                <th>Foreign Keys</th>
                <th>Indexes & Unique Constraints</th>
                <th>Business Purpose</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>users</code></td>
                <td><code>id (INT)</code></td>
                <td>None</td>
                <td><code>UNIQUE(username)</code>, <code>UNIQUE(email)</code></td>
                <td>Core authentication and RBAC credentials repository.</td>
            </tr>
            <tr>
                <td><code>student_profiles</code></td>
                <td><code>id (INT)</code></td>
                <td><code>user_id &rarr; users.id</code></td>
                <td><code>UNIQUE(user_id)</code></td>
                <td>Extended academic profile (enrollment, branch, contact).</td>
            </tr>
            <tr>
                <td><code>bus_stops</code></td>
                <td><code>id (INT)</code></td>
                <td>None</td>
                <td><code>UNIQUE(stop_name)</code>, <code>idx_stop_active</code></td>
                <td>Geo-coordinates (lat/lng) and scheduled pickup times.</td>
            </tr>
            <tr>
                <td><code>routes</code></td>
                <td><code>id (INT)</code></td>
                <td>None</td>
                <td><code>UNIQUE(route_code)</code></td>
                <td>Named campus transit corridors and bus identifiers.</td>
            </tr>
            <tr>
                <td><code>route_stops</code></td>
                <td><code>id (INT)</code></td>
                <td><code>route_id</code>, <code>bus_stop_id</code></td>
                <td><code>UNIQUE(route_id, stop_order)</code></td>
                <td>Ordered sequence of stops defining each route corridor.</td>
            </tr>
            <tr>
                <td><code>student_availability</code></td>
                <td><code>id (INT)</code></td>
                <td><code>student_id</code>, <code>bus_stop_id</code></td>
                <td><code>UNIQUE(student_id, availability_date)</code></td>
                <td>Daily student commute confirmations (YES/NO decisions).</td>
            </tr>
            <tr>
                <td><code>attendance_sessions</code></td>
                <td><code>id (INT)</code></td>
                <td><code>driver_id</code>, <code>route_id</code></td>
                <td><code>UNIQUE(token_hash)</code>, <code>idx_expires</code></td>
                <td>Server-side dynamic QR sessions with 60s TTL.</td>
            </tr>
            <tr>
                <td><code>attendance_records</code></td>
                <td><code>id (INT)</code></td>
                <td><code>student_id</code>, <code>attendance_session_id</code></td>
                <td><code>UNIQUE(student_id, attendance_date)</code></td>
                <td>Official verified student attendance check-ins.</td>
            </tr>
        </tbody>
    </table>

    <!-- SECTION 6 -->
    <div class="page-break"></div>
    <h2>6. Implementation Details & Web Technology Stack</h2>
    
    <h3>6.1 Frontend Implementation</h3>
    <ul>
        <li><strong>Semantic HTML5 Structure:</strong> Standards-compliant documents using <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, and <code>&lt;footer&gt;</code>. Forms are enhanced with client-side regex validations, accessible labels, and input types (<code>tel</code>, <code>email</code>, <code>password</code>).</li>
        <li><strong>Responsive CSS3 & Bootstrap 5:</strong> Clean UI system based on custom CSS custom properties (<code>--primary</code>, <code>--navy</code>, <code>--amber-bg</code>), utilizing CSS Flexbox and 12-column Grid systems for responsive layouts across mobile phones, tablets, and desktop displays.</li>
        <li><strong>Interactive Mapping with Leaflet.js:</strong> Lightweight OpenStreetMap rendering with customized bus stop pin markers, popup modals, and vehicle tracking icons without external proprietary API keys.</li>
        <li><strong>Native AJAX & Fetch API:</strong> Standardized client-side API abstraction module (<code>client/js/api.js</code>) featuring reusable <code>get()</code>, <code>post()</code>, and <code>del()</code> wrappers handling JSON serializations, HTTP credentials, and error banners.</li>
        <li><strong>QR Code Scanning Engine:</strong> In-browser camera decoding powered by <code>html5-qrcode</code>, granting instantaneous mobile scanning without native app installations.</li>
    </ul>

    <h3>6.2 Backend & REST API Implementation</h3>
    <ul>
        <li><strong>Node.js & Express.js:</strong> Modular, layered architecture cleanly dividing routes (<code>/api/auth</code>, <code>/api/student</code>, <code>/api/driver</code>, <code>/api/admin</code>, <code>/api/tiles</code>) from controllers and data access services.</li>
        <li><strong>Session Authentication & Security:</strong> Built with <code>express-session</code> and <code>express-mysql-session</code> storing sessions in MySQL. Protected with <code>helmet</code> security headers and HTTP-only cookies.</li>
        <li><strong>Cryptographic Password & QR Hashing:</strong> Passwords hashed with <code>bcryptjs</code> (salt rounds 10). Dynamic QR tokens generated with <code>crypto.randomBytes(32)</code> and validated against <code>crypto.createHash('sha256')</code> digests with a strict 60-second database expiration window.</li>
        <li><strong>Map Tile Proxying & Caching:</strong> High-performance tile proxy controller (<code>server/src/controllers/tiles.controller.js</code>) that caches OpenStreetMap PNG tiles locally in <code>os.tmpdir()</code> with HTTP 304 caching headers, avoiding upstream rate limits and EROFS read-only filesystem errors in cloud serverless deployments.</li>
    </ul>

    <div class="code-box">
// Core Serverless Entrypoint (api/index.js)
const app = require('../server/src/app');
module.exports = app;

// Dynamic QR Generation with SHA-256 Hashing (server/src/services/qr.service.js)
const crypto = require('crypto');
function generateSessionToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60s TTL
    return { rawToken, tokenHash, expiresAt };
}
    </div>

    <!-- SECTION 7 -->
    <div class="page-break"></div>
    <h2>7. Visual Walkthrough & Module Screenshots</h2>
    
    <h3>7.1 Public Landing Page & Route Directory</h3>
    <p>The landing page provides students, faculty, and drivers with a comprehensive introduction to the system, active route directories, stop pickup timings, and role-based login shortcuts.</p>
    
    <div class="screenshot-card">
        ${landingBase64 ? `<img src="data:image/png;base64,${landingBase64}" alt="SmartRoute Landing Page">` : '<div style="padding:40px; text-align:center;">[Landing Page Interface Screenshot]</div>'}
        <div class="screenshot-caption">Figure 7.1: SmartRoute Public Landing Page and Campus Bus Route Directory</div>
    </div>

    <h3>7.2 Secure Role-Based Authentication Portal</h3>
    <p>A unified, responsive login portal featuring automatic role recognition (Student, Driver, Administrator), session generation, and redirection to the designated operational dashboard.</p>
    
    <div class="screenshot-card">
        ${loginBase64 ? `<img src="data:image/png;base64,${loginBase64}" alt="SmartRoute Login Portal">` : '<div style="padding:40px; text-align:center;">[Login Page Interface Screenshot]</div>'}
        <div class="screenshot-caption">Figure 7.2: Unified Authentication Portal with Role-Based Dispatching</div>
    </div>

    <div class="page-break"></div>
    <h3>7.3 Student Dashboard & Daily Availability Module</h3>
    <p>Provides students with real-time controls to toggle daily commute availability, select their active pickup stop, view live bus movements on an interactive Leaflet map, scan the driver's dynamic QR code, and inspect historical attendance logs.</p>
    
    <div class="info-callout">
        <strong>Key Student Features:</strong>
        <ul>
            <li><strong>Availability Switch:</strong> Instant toggle updating <code>student_availability</code> for the current date.</li>
            <li><strong>Active Rider Indication:</strong> Status confirmation reassuring the student their pickup stop is marked on the driver's manifest.</li>
            <li><strong>QR Attendance Scanner:</strong> Instant mobile camera feed verifying attendance upon boarding the bus.</li>
            <li><strong>Attendance Log:</strong> Filterable table displaying date, timestamp, bus stop name, and verification status.</li>
        </ul>
    </div>

    <h3>7.4 Driver Navigation & Dynamic QR Console</h3>
    <p>Designed for tablet and smartphone mounts in the bus cab. It organizes stops sequentially, computes live student counts per stop, flags empty stops as bypass candidates, and displays rotating 60-second QR codes.</p>

    <div class="warning-callout">
        <strong>Driver Operational Features:</strong>
        <ul>
            <li><strong>Stop Optimization Banner:</strong> Instantly displays stops with zero waiting students so drivers avoid congested detours.</li>
            <li><strong>Rotating QR Generator:</strong> Generates a fresh cryptographic QR code every 60 seconds with an animated countdown dial.</li>
            <li><strong>Real-Time Headcount:</strong> Incrementing tally showing total boarded students versus registered students for the morning route.</li>
        </ul>
    </div>

    <!-- SECTION 8 -->
    <div class="page-break"></div>
    <h2>8. Testing, Verification Matrix & Results</h2>
    <h3>8.1 Testing Methodology</h3>
    <p>The system underwent rigorous testing across four domains: Unit verification of cryptographic functions, Integration testing of REST API endpoints, Database constraint and transaction testing, and Cross-browser responsive UI testing.</p>

    <h3>8.2 Test Execution Matrix</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 10%;">Test ID</th>
                <th style="width: 25%;">Test Scenario</th>
                <th style="width: 35%;">Input & Execution Steps</th>
                <th style="width: 20%;">Expected Result</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>TC-01</strong></td>
                <td>User Authentication</td>
                <td>Submit valid username and password through <code>/api/auth/login</code>.</td>
                <td>200 OK, session cookie issued, redirects to role dashboard.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-02</strong></td>
                <td>Invalid Credentials</td>
                <td>Submit incorrect password on login form.</td>
                <td>401 Unauthorized, descriptive error banner displayed.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-03</strong></td>
                <td>Role Authorization Guard</td>
                <td>Directly access <code>admin-dashboard.html</code> with student session.</td>
                <td>Redirects to <code>/login.html</code>; unauthorized access blocked.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-04</strong></td>
                <td>Daily Availability Toggle</td>
                <td>Toggle bus availability to 'YES' and select 'Chetak Circle'.</td>
                <td>Database record updated; waiting count incremented.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-05</strong></td>
                <td>Driver Route Optimization</td>
                <td>Query <code>/api/driver/route-summary</code> with 0 students on Stop 4.</td>
                <td>Stop 4 marked as <code>skip_candidate: true</code> in manifest.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-06</strong></td>
                <td>Dynamic QR Generation</td>
                <td>Driver triggers <code>POST /api/driver/qr/generate</code>.</td>
                <td>QR image rendered, SHA-256 hash stored with 60s TTL.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-07</strong></td>
                <td>Valid QR Attendance Scan</td>
                <td>Student scans QR within the 60-second window.</td>
                <td>200 OK; attendance record committed to database.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-08</strong></td>
                <td>Expired QR Attendance Scan</td>
                <td>Student attempts scan 65 seconds after generation.</td>
                <td>400 Bad Request: "QR token has expired. Scan current code."</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-09</strong></td>
                <td>Duplicate Attendance Guard</td>
                <td>Student scans valid QR code twice on the same calendar day.</td>
                <td>409 Conflict: Attendance already recorded today.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-10</strong></td>
                <td>Map Tile Proxy & Cache</td>
                <td>Fetch OpenStreetMap tile via <code>/api/tiles/14/11545/7098.png</code>.</td>
                <td>200 OK image/png; cached in temporary directory.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-11</strong></td>
                <td>Serverless DB Reconnect</td>
                <td>Trigger API endpoint during database cold-start.</td>
                <td>Pool reconnects gracefully without crashing Node process.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
            <tr>
                <td><strong>TC-12</strong></td>
                <td>Mobile Viewport Fluidity</td>
                <td>Test landing page and dashboard on 375px mobile screen.</td>
                <td>Components collapse to single column; zero horizontal scroll.</td>
                <td><span class="badge badge-success">PASS</span></td>
            </tr>
        </tbody>
    </table>

    <!-- SECTION 9 -->
    <div class="page-break"></div>
    <h2>9. Conclusion & Future Enhancements</h2>
    
    <h3>9.1 Project Outcomes & Conclusions</h3>
    <p>SmartRoute successfully demonstrates the practical implementation of end-to-end full-stack web engineering principles as prescribed in the Web Development curriculum. Key project achievements include:</p>
    <ul>
        <li><strong>Elimination of Static Paper Roll-Calls:</strong> Replaced vulnerable physical sign-in sheets with a cryptographically enforced, 60-second dynamic QR code attendance system.</li>
        <li><strong>Actionable Fleet Route Optimization:</strong> Drivers receive live stop occupancy data, preventing redundant detours to deserted stops and decreasing trip transit times and fuel waste.</li>
        <li><strong>Production Cloud Deployment:</strong> Configured for high-speed serverless deployment on Vercel Edge networks with static asset caching, clean routing rewrites, and support for remote cloud MySQL clustering.</li>
        <li><strong>Open Standards Architecture:</strong> Built using standards-compliant HTML5, CSS3, ES6 JavaScript, Express.js, and normalized MySQL without proprietary framework bloat.</li>
    </ul>

    <h3>9.2 Future Enhancements</h3>
    <p>To further extend the capabilities of SmartRoute in subsequent iterations, the following roadmap is proposed:</p>
    <ol>
        <li><strong>Automated IoT GPS On-Board Trackers:</strong> Integrate Raspberry Pi / ESP32 OBD-II telemetry hardware directly into bus cabins to transmit automated vehicle coordinates without requiring a driver smartphone screen to remain awake.</li>
        <li><strong>Parent & Student SMS Notifications:</strong> Integrate Twilio or Firebase Cloud Messaging (FCM) to push automated arrival notices when the bus is within a 2-kilometer geofence of the student's designated stop.</li>
        <li><strong>Machine Learning Route Optimization:</strong> Analyze historical monthly attendance patterns with predictive clustering models (e.g. DBSCAN or K-Means) to dynamically re-sequence bus routes based on day-of-the-week attendance trends.</li>
        <li><strong>Offline Attendance Caching (PWA):</strong> Implement Service Workers and IndexedDB client storage to allow offline attendance marking in low-cellular college transit corridors, syncing automatically upon network re-establishment.</li>
    </ol>

    <!-- SECTION 10 -->
    <div class="page-break"></div>
    <h2>10. References & Technical Bibliography</h2>
    <ol style="line-height: 1.8;">
        <li><strong>MDN Web Docs:</strong> <em>HTML5 Semantic Elements and Accessible Form Controls</em>. Mozilla Developer Network, 2026. <a href="https://developer.mozilla.org">https://developer.mozilla.org</a></li>
        <li><strong>W3C Recommendations:</strong> <em>CSS Flexible Box Layout Module Level 1 & CSS Grid Layout Module Level 2</em>. World Wide Web Consortium (W3C), 2024. <a href="https://www.w3.org/TR/css-flexbox-1/">https://www.w3.org/TR/css-flexbox-1/</a></li>
        <li><strong>Express.js Official Documentation:</strong> <em>Fast, unopinionated, minimalist web framework for Node.js</em>. Expressjs Foundation, 2026. <a href="https://expressjs.com">https://expressjs.com</a></li>
        <li><strong>MySQL 8.0 Reference Manual:</strong> <em>InnoDB Architecture, ACID Compliance, Connection Pooling, and Constraints</em>. Oracle Corporation, 2026. <a href="https://dev.mysql.com/doc/">https://dev.mysql.com/doc/</a></li>
        <li><strong>Leaflet.js Documentation:</strong> <em>An open-source JavaScript library for mobile-friendly interactive maps</em>. Vladimir Agafonkin, 2026. <a href="https://leafletjs.com">https://leafletjs.com</a></li>
        <li><strong>RFC 7519 / RFC 6234:</strong> <em>US Secure Hash Algorithms (SHA and SHA-based HMAC and HKDF)</em>. Internet Engineering Task Force (IETF).</li>
        <li><strong>Vercel Serverless Functions Specification:</strong> <em>Deploying Express.js Applications on Vercel Node.js Runtime</em>. Vercel Documentation, 2026. <a href="https://vercel.com/docs">https://vercel.com/docs</a></li>
    </ol>

    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 9.5pt;">
        End of Minor Project Report — SmartRoute College Bus Management & Attendance System
    </div>

</body>
</html>
`;

fs.writeFileSync('docs/SmartRoute_Project_Report.html', html, 'utf8');
console.log('Successfully generated docs/SmartRoute_Project_Report.html');
