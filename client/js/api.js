/**
 * SmartRoute Frontend API Client
 * Centralized Fetch API communication with Express backend
 */

const API_BASE = '/api';

async function fetchApi(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const defaultHeaders = {
        'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, {
            credentials: 'same-origin',
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        });

        const contentType = response.headers.get('content-type') || '';
        let data = {};

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { rawText: text };
            }
        }

        if (!response.ok) {
            if (response.status === 401 && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
                // Not authenticated, redirect to login
                window.location.href = '/login.html';
                return null;
            }
            const errorMsg = data.message || `Request failed with status ${response.status}`;
            const err = new Error(errorMsg);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    } catch (err) {
        console.error(`[API Error] ${endpoint}:`, err);
        throw err;
    }
}

/**
 * Display alert or toast notification on the page
 */
function showAlert(message, type = 'info', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}">
            <span>${message}</span>
        </div>
    `;

    setTimeout(() => {
        if (container.innerHTML.includes(message)) {
            container.innerHTML = '';
        }
    }, 5000);
}

/**
 * Format ISO or YYYY-MM-DD date string into readable format (e.g. "Tue, 03 Nov 2026")
 */
function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const parts = dateInput.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12);
        return d.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format time string (e.g. "08:30 AM")
 */
function formatTime(dateInput) {
    if (!dateInput) return '--';
    if (typeof dateInput === 'string' && (dateInput.includes('AM') || dateInput.includes('PM'))) {
        return dateInput;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

