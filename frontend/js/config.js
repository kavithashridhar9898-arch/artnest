// API Configuration
// Change this to your network IP when accessing from other devices
const API_CONFIG = {
    // For local development (same computer)
    LOCAL_URL: 'http://localhost:3000',
    
    // For network access (other devices on same WiFi)
    // Replace YOUR_IP with the IP shown when server starts
    NETWORK_URL: 'http://YOUR_IP:3000',
    
    // Current mode - change to 'NETWORK_URL' for other devices
    CURRENT_MODE: 'LOCAL_URL'
};

// Get the API base URL
window.API_BASE_URL = API_CONFIG[API_CONFIG.CURRENT_MODE];

console.log('🌐 API Base URL:', window.API_BASE_URL);
