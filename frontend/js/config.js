// API Configuration
// Change this to your network IP when accessing from other devices
const API_CONFIG = {
    // For local development (same computer)
    LOCAL_URL: 'http://localhost:3000',
    
    // For cloud deployment (accessible from anywhere)
    NETWORK_URL: 'https://artnet-production.up.railway.app',
    
    // Current mode - set to 'NETWORK_URL' for cloud access
    CURRENT_MODE: 'NETWORK_URL'
};

// Get the API base URL
window.API_BASE_URL = API_CONFIG[API_CONFIG.CURRENT_MODE];

console.log('🌐 API Base URL:', window.API_BASE_URL);
