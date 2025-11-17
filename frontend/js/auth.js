/**
 * Authentication Functions
 * Login, Register, and token management
 */

// Register new user
async function register(formData) {
    try {
        const response = await ArtNest.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData),
            skipAuth: true
        });
        
        if (response.success) {
            ArtNest.showToast('Registration successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
        
        return response;
    } catch (error) {
        ArtNest.showToast(error.message || 'Registration failed', 'error');
        throw error;
    }
}

// Login user
async function login(email, password) {
    try {
        const response = await ArtNest.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true
        });
        
        if (response.success && response.data) {
            // Store token and user data
            localStorage.setItem('artnet_token', response.data.token);
            localStorage.setItem('artnet_user', JSON.stringify(response.data.user));
            
            ArtNest.showToast('Login successful!', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (response.data.user.userType === 'artist') {
                    window.location.href = 'artist-dashboard.html';
                } else {
                    window.location.href = 'venue-dashboard.html';
                }
            }, 1000);
        }
        
        return response;
    } catch (error) {
        ArtNest.showToast(error.message || 'Login failed', 'error');
        throw error;
    }
}

// Verify token on protected pages
async function verifyToken() {
    try {
        const response = await ArtNest.apiRequest('/auth/verify', {
            method: 'GET'
        });
        
        if (response.success && response.data) {
            // Update stored user data
            localStorage.setItem('artnet_user', JSON.stringify(response.data.user));
            return response.data.user;
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('artnet_token');
        localStorage.removeItem('artnet_user');
        window.location.href = 'login.html';
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const response = await ArtNest.apiRequest('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.success) {
            ArtNest.showToast('Password changed successfully!', 'success');
        }
        
        return response;
    } catch (error) {
        ArtNest.showToast(error.message || 'Failed to change password', 'error');
        throw error;
    }
}

// Handle register form
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                userType: document.getElementById('userType').value,
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value
            };
            
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!ArtNest.isValidEmail(formData.email)) {
                ArtNest.showToast('Please enter a valid email', 'error');
                return;
            }
            
            if (formData.password !== confirmPassword) {
                ArtNest.showToast('Passwords do not match', 'error');
                return;
            }
            
            const passwordValidation = ArtNest.validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                ArtNest.showToast(passwordValidation.errors[0], 'error');
                return;
            }
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            ArtNest.setLoading(submitBtn, true, 'Creating account...');
            
            try {
                await register(formData);
            } catch (error) {
                console.error('Registration error:', error);
            } finally {
                ArtNest.setLoading(submitBtn, false);
            }
        });
    }
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validation
            if (!ArtNest.isValidEmail(email)) {
                ArtNest.showToast('Please enter a valid email', 'error');
                return;
            }
            
            if (!password) {
                ArtNest.showToast('Please enter your password', 'error');
                return;
            }
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            ArtNest.setLoading(submitBtn, true, 'Logging in...');
            
            try {
                await login(email, password);
            } catch (error) {
                console.error('Login error:', error);
            } finally {
                ArtNest.setLoading(submitBtn, false);
            }
        });
    }
    
    // Password visibility toggle
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            btn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const validation = ArtNest.validatePassword(password);
            
            let strength = 'weak';
            let color = '#EF4444';
            
            if (password.length >= 6) {
                strength = 'medium';
                color = '#F59E0B';
            }
            if (validation.isValid) {
                strength = 'strong';
                color = '#10B981';
            }
            
            strengthIndicator.textContent = `Password strength: ${strength}`;
            strengthIndicator.style.color = color;
        });
    }
});

// Export functions
window.AuthService = {
    register,
    login,
    verifyToken,
    changePassword
};
