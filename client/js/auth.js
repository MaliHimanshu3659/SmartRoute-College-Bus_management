/**
 * SmartRoute Authentication & Session Management
 */

let currentUser = null;

async function checkAuth(requiredRole = null) {
    const isPublicPage = ['/index.html', '/login.html', '/signup.html', '/'].some(p =>
        window.location.pathname.endsWith(p) || window.location.pathname === '/'
    );

    try {
        const data = await fetchApi('/auth/me');

        if (data && data.authenticated && data.user) {
            currentUser = data.user;

            // If user is logged in and on login/signup, redirect to appropriate dashboard
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
                redirectToDashboard(currentUser.role);
                return;
            }

            // Role restriction check
            if (requiredRole && currentUser.role !== requiredRole) {
                alert(`Access denied. This page requires '${requiredRole}' privileges.`);
                redirectToDashboard(currentUser.role);
                return;
            }

            updateSidebarUser(currentUser);
        } else if (!isPublicPage) {
            window.location.href = '/login.html';
        }
    } catch (err) {
        if (!isPublicPage) {
            window.location.href = '/login.html';
        }
    }
}

function redirectToDashboard(role) {
    if (role === 'driver') {
        window.location.href = '/driver-dashboard.html';
    } else {
        window.location.href = '/student-dashboard.html';
    }
}

function updateSidebarUser(user) {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (nameEl) nameEl.textContent = user.fullName || user.username;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) {
        const initials = (user.fullName || user.username)
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        avatarEl.textContent = initials || 'SR';
    }
}

async function handleLogout() {
    try {
        await fetchApi('/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (err) {
        window.location.href = '/login.html';
    }
}

// Global hook for logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

