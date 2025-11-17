/**
 * Keep-Alive Service
 * Pings the backend every 14 minutes to prevent Render from sleeping
 */

const BACKEND_URL = 'https://artnest-backend-fdk6.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

function pingBackend() {
    fetch(`${BACKEND_URL}/api/auth/health`)
        .then(res => console.log('✅ Backend ping successful'))
        .catch(err => console.log('❌ Backend ping failed:', err));
}

// Ping immediately when page loads
pingBackend();

// Then ping every 14 minutes
setInterval(pingBackend, PING_INTERVAL);

console.log('🔄 Keep-alive service started');
