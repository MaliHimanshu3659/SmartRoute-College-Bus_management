/**
 * Geographic utility functions for SmartRoute
 */

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculates distance between two coordinates in meters using the Haversine formula.
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Finds the nearest bus stop from a candidate list of stops.
 */
function findNearestStop(lat, lng, stops) {
    if (!stops || stops.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const stop of stops) {
        if (stop.latitude == null || stop.longitude == null) continue;
        const dist = calculateDistanceMeters(lat, lng, parseFloat(stop.latitude), parseFloat(stop.longitude));
        if (dist < minDistance) {
            minDistance = dist;
            nearest = {
                ...stop,
                distanceMeters: Math.round(dist)
            };
        }
    }

    return nearest;
}

module.exports = {
    calculateDistanceMeters,
    findNearestStop
};

