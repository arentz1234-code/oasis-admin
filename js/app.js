// Oasis Admin Portal - Login Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginBtn = document.getElementById('login-btn');
    const passwordForm = document.getElementById('password-form');
    const step1 = document.getElementById('login-step-1');
    const step2 = document.getElementById('login-step-2');
    const errorMsg = document.getElementById('error-msg');

    // Click to login button
    loginBtn.addEventListener('click', function() {
        step1.classList.remove('active');
        step2.classList.add('active');
        document.getElementById('password').focus();
    });

    // Password form submission
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === CONFIG.PASSWORD) {
            // Set session
            const session = {
                loggedIn: true,
                timestamp: Date.now()
            };
            localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.textContent = 'Invalid password. Please try again.';
            errorMsg.classList.add('show');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
});

// Check if user is logged in with valid session
function isLoggedIn() {
    const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);
    if (!sessionData) return false;

    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        const elapsed = now - session.timestamp;

        // Check if session is still valid (within duration)
        if (session.loggedIn && elapsed < CONFIG.SESSION_DURATION) {
            return true;
        } else {
            // Session expired, clear it
            localStorage.removeItem(CONFIG.SESSION_KEY);
            return false;
        }
    } catch (e) {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        return false;
    }
}