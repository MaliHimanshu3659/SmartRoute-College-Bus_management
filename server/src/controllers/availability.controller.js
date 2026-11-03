const { query } = require('../config/database');
const { findNearestStop } = require('../utils/geo.utils');

/**
 * Get student's current availability for today and recent history
 */
async function getMyAvailability(req, res) {
    try {
        const studentId = req.session.user.id;
        const todayDate = new Date().toISOString().split('T')[0];

        // 1. Today's availability
        const todayRecords = await query(
            `SELECT a.*, s.stop_name, s.scheduled_time, s.latitude as stop_lat, s.longitude as stop_lng,
                    att.id as attendance_id, att.marked_at, att.source as attendance_source
             FROM student_availability a
             LEFT JOIN bus_stops s ON a.bus_stop_id = s.id
             LEFT JOIN attendance_records att ON att.student_id = a.student_id AND att.attendance_date = a.availability_date
             WHERE a.student_id = ? AND a.availability_date = ?`,
            [studentId, todayDate]
        );

        // 2. Recent history (last 15 records)
        const historyRecords = await query(
            `SELECT a.*, s.stop_name, s.scheduled_time,
                    att.id as attendance_id, att.marked_at, att.source as attendance_source
             FROM student_availability a
             LEFT JOIN bus_stops s ON a.bus_stop_id = s.id
             LEFT JOIN attendance_records att ON att.student_id = a.student_id AND att.attendance_date = a.availability_date
             WHERE a.student_id = ?
             ORDER BY a.availability_date DESC
             LIMIT 15`,
            [studentId]
        );

        return res.json({
            success: true,
            today: todayRecords[0] || null,
            history: historyRecords
        });
    } catch (err) {
        console.error('[Availability Controller] getMyAvailability error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving availability.' });
    }
}

/**
 * Submit or update daily availability
 */
async function submitAvailability(req, res) {
    try {
        const studentId = req.session.user.id;
        const { useBus, stopId, latitude, longitude } = req.body;

        const normalizedUseBus = (useBus || '').toString().trim().toUpperCase();
        if (normalizedUseBus !== 'YES' && normalizedUseBus !== 'NO') {
            return res.status(400).json({
                success: false,
                message: "Please choose 'YES' or 'NO' for bus usage."
            });
        }

        const todayDate = new Date().toISOString().split('T')[0];
        let validatedStopId = null;
        let finalLat = null;
        let finalLng = null;
        let matchedStopName = null;

        if (normalizedUseBus === 'YES') {
            const allStops = await query(`SELECT * FROM bus_stops WHERE is_active = 1`);

            if (latitude != null && longitude != null) {
                const latNum = parseFloat(latitude);
                const lngNum = parseFloat(longitude);
                if (isNaN(latNum) || isNaN(lngNum)) {
                    return res.status(400).json({ success: false, message: 'Coordinates must be valid numbers.' });
                }
                finalLat = latNum;
                finalLng = lngNum;

                // Match to nearest bus stop
                const nearest = findNearestStop(latNum, lngNum, allStops);
                if (nearest) {
                    validatedStopId = nearest.id;
                    matchedStopName = nearest.stop_name;
                }
            }

            if (!validatedStopId && stopId) {
                const stopMatch = allStops.find(s => s.id === parseInt(stopId, 10));
                if (!stopMatch) {
                    return res.status(400).json({ success: false, message: 'Selected pickup stop does not exist.' });
                }
                validatedStopId = stopMatch.id;
                matchedStopName = stopMatch.stop_name;
                finalLat = parseFloat(stopMatch.latitude);
                finalLng = parseFloat(stopMatch.longitude);
            }

            if (!validatedStopId) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a designated pickup stop or choose a location on the map.'
                });
            }
        }

        // Use upsert to cleanly respect unique constraint uq_student_daily_avail
        await query(
            `INSERT INTO student_availability 
             (student_id, availability_date, use_bus, bus_stop_id, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                use_bus = VALUES(use_bus),
                bus_stop_id = VALUES(bus_stop_id),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                updated_at = CURRENT_TIMESTAMP`,
            [studentId, todayDate, normalizedUseBus, validatedStopId, finalLat, finalLng]
        );

        return res.json({
            success: true,
            message: normalizedUseBus === 'YES'
                ? `Bus marked: YES for stop '${matchedStopName}'.`
                : "Bus marked: NO for today. Stop skipped.",
            data: {
                availabilityDate: todayDate,
                useBus: normalizedUseBus,
                stopId: validatedStopId,
                stopName: matchedStopName,
                latitude: finalLat,
                longitude: finalLng
            }
        });
    } catch (err) {
        console.error('[Availability Controller] submitAvailability error:', err);
        return res.status(500).json({ success: false, message: 'Server error saving availability.' });
    }
}

/**
 * Get comprehensive student dashboard statistics
 */
async function getDashboardStats(req, res) {
    try {
        const studentId = req.session.user.id;
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 1. Today's availability
        const todayRows = await query(
            `SELECT a.*, s.stop_name, s.scheduled_time,
                    att.id as attendance_id, att.marked_at
             FROM student_availability a
             LEFT JOIN bus_stops s ON a.bus_stop_id = s.id
             LEFT JOIN attendance_records att ON att.student_id = a.student_id AND att.attendance_date = a.availability_date
             WHERE a.student_id = ? AND a.availability_date = ?`,
            [studentId, todayDate]
        );
        const todayRecord = todayRows[0] || null;

        // 2. All records this month for student
        const monthRecords = await query(
            `SELECT availability_date, use_bus, bus_stop_id 
             FROM student_availability 
             WHERE student_id = ? 
               AND YEAR(availability_date) = ? 
               AND MONTH(availability_date) = ?`,
            [studentId, currentYear, currentMonth]
        );

        const presentCount = monthRecords.filter(r => r.use_bus === 'YES').length;
        const absentCount = monthRecords.filter(r => r.use_bus === 'NO').length;
        const daysMarked = presentCount + absentCount;
        const attendanceRate = daysMarked > 0 ? Math.round((presentCount / daysMarked) * 100) : 0;

        // 3. Active riders count college-wide today
        const activeRidersRows = await query(
            `SELECT COUNT(*) as count FROM student_availability WHERE availability_date = ? AND use_bus = 'YES'`,
            [todayDate]
        );
        const activeRidersCount = activeRidersRows[0]?.count || 0;

        // 4. Working days week cards (Monday to Friday of current week)
        const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
        const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);

        const weekCards = [];
        const daysOfWeekNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

        for (let i = 0; i < 5; i++) {
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + i);
            const iso = dayDate.toISOString().split('T')[0];
            const isToday = iso === todayDate;

            const rec = monthRecords.find(r => {
                const rIso = new Date(r.availability_date).toISOString().split('T')[0];
                return rIso === iso;
            });

            weekCards.push({
                label: daysOfWeekNames[i],
                day: dayDate.getDate(),
                dateStr: iso,
                state: rec ? (rec.use_bus === 'YES' ? 'present' : 'absent') : '',
                isToday
            });
        }

        // 5. Default route info
        const routes = await query(`SELECT * FROM routes WHERE is_active = 1 LIMIT 1`);
        const primaryRoute = routes[0] || {
            route_name: 'Rampura to Campus',
            bus_name: 'Campus Route 01',
            departure_time: '08:10 AM',
            arrival_time: '09:20 AM'
        };

        return res.json({
            success: true,
            todayRecord,
            attendanceRate,
            presentCount,
            absentCount,
            daysMarked,
            activeRidersCount,
            weekCards,
            primaryRoute
        });
    } catch (err) {
        console.error('[Availability Controller] getDashboardStats error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving statistics.' });
    }
}

/**
 * Get and update student profile
 */
async function getProfile(req, res) {
    try {
        const studentId = req.session.user.id;
        const profiles = await query(
            `SELECT u.username, u.email, u.full_name, p.* 
             FROM users u
             LEFT JOIN student_profiles p ON u.id = p.user_id
             WHERE u.id = ?`,
            [studentId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        return res.json({ success: true, profile: profiles[0] });
    } catch (err) {
        console.error('[Availability Controller] getProfile error:', err);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
}

async function updateProfile(req, res) {
    try {
        const studentId = req.session.user.id;
        const {
            fullName,
            enrollmentNumber,
            mobileNumber,
            address,
            parentName,
            parentMobileNumber,
            studyYear,
            branch,
            program,
            specialization
        } = req.body;

        if (fullName) {
            await query(`UPDATE users SET full_name = ? WHERE id = ?`, [fullName.trim(), studentId]);
            req.session.user.fullName = fullName.trim();
        }

        await query(
            `INSERT INTO student_profiles 
             (user_id, enrollment_number, mobile_number, address, parent_name, parent_mobile_number, study_year, branch, program, specialization)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                enrollment_number = VALUES(enrollment_number),
                mobile_number = VALUES(mobile_number),
                address = VALUES(address),
                parent_name = VALUES(parent_name),
                parent_mobile_number = VALUES(parent_mobile_number),
                study_year = VALUES(study_year),
                branch = VALUES(branch),
                program = VALUES(program),
                specialization = VALUES(specialization),
                updated_at = CURRENT_TIMESTAMP`,
            [
                studentId,
                enrollmentNumber || null,
                mobileNumber || null,
                address || null,
                parentName || null,
                parentMobileNumber || null,
                studyYear || null,
                branch || null,
                program || null,
                specialization || null
            ]
        );

        return res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('[Availability Controller] updateProfile error:', err);
        return res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
}

module.exports = {
    getMyAvailability,
    submitAvailability,
    getDashboardStats,
    getProfile,
    updateProfile
};
