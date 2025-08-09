// ===== ADMIN AUTHENTICATION SYSTEM =====

// Configuration
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api/v1',
    endpoints: {
        login: '/auth/login-json',
        verify: '/auth/verify-token',
        refresh: '/auth/refresh',
        me: '/auth/me'
    }
};

// Storage keys
const STORAGE_KEYS = {
    token: 'admin_token',
    user: 'admin_user',
    remember: 'admin_remember'
};

// Auth manager class
class AuthManager {
    constructor() {
        this.token = null;
        this.user = null;
        this.refreshTimer = null;
        this.init();
    }

    init() {
        // Check for existing session
        const savedToken = this.getStoredToken();
        if (savedToken) {
            this.token = savedToken;
            this.verifyToken();
        }
    }

    // Storage methods
    getStoredToken() {
        return localStorage.getItem(STORAGE_KEYS.token) || 
               sessionStorage.getItem(STORAGE_KEYS.token);
    }

    storeToken(token, remember = false) {
        if (remember) {
            localStorage.setItem(STORAGE_KEYS.token, token);
            localStorage.setItem(STORAGE_KEYS.remember, 'true');
        } else {
            sessionStorage.setItem(STORAGE_KEYS.token, token);
        }
        this.token = token;
    }

    storeUser(user, remember = false) {
        const userData = JSON.stringify(user);
        if (remember) {
            localStorage.setItem(STORAGE_KEYS.user, userData);
        } else {
            sessionStorage.setItem(STORAGE_KEYS.user, userData);
        }
        this.user = user;
    }

    clearStorage() {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.remember);
        sessionStorage.removeItem(STORAGE_KEYS.token);
        sessionStorage.removeItem(STORAGE_KEYS.user);
        this.token = null;
        this.user = null;
    }

    // API methods
    async makeRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(username, password, remember = false) {
        try {
            const response = await this.makeRequest(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.access_token && response.user) {
                this.storeToken(response.access_token, remember);
                this.storeUser(response.user, remember);
                this.setupTokenRefresh();
                
                return {
                    success: true,
                    user: response.user,
                    token: response.access_token
                };
            } else {
                throw new Error('Respuesta de login inválida');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Error al iniciar sesión'
            };
        }
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await this.makeRequest(API_CONFIG.endpoints.verify, {
                method: 'POST'
            });

            if (response.valid) {
                // Get user info if not stored
                if (!this.user) {
                    await this.getCurrentUser();
                }
                this.setupTokenRefresh();
                return true;
            } else {
                this.clearStorage();
                return false;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.clearStorage();
            return false;
        }
    }

    async getCurrentUser() {
        try {
            const response = await this.makeRequest(API_CONFIG.endpoints.me);
            this.user = response;
            
            const remember = localStorage.getItem(STORAGE_KEYS.remember) === 'true';
            this.storeUser(response, remember);
            
            return response;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    async refreshToken() {
        if (!this.token) return false;

        try {
            const response = await this.makeRequest(API_CONFIG.endpoints.refresh, {
                method: 'POST'
            });

            if (response.access_token) {
                const remember = localStorage.getItem(STORAGE_KEYS.remember) === 'true';
                this.storeToken(response.access_token, remember);
                this.setupTokenRefresh();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return false;
        }
    }

    setupTokenRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        // Set up refresh timer (refresh 5 minutes before expiry)
        const refreshTime = 55 * 60 * 1000; // 55 minutes in milliseconds
        this.refreshTimer = setTimeout(() => {
            this.refreshToken();
        }, refreshTime);
    }

    logout() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        this.clearStorage();
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = './login.html';
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    isAdmin() {
        return this.user && (this.user.is_superuser || this.user.is_admin);
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }
}

// Global auth instance
const authManager = new AuthManager();

// ===== LOGIN PAGE FUNCTIONS =====

function initializeLoginPage() {
    // Check if already authenticated
    if (authManager.isAuthenticated()) {
        redirectToDashboard();
        return;
    }

    // Setup form submission
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Setup enter key handling
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.closest('.login-form')) {
            e.preventDefault();
            handleLoginSubmit(e);
        }
    });

    // Focus on username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target.closest ? event.target : event.target.closest('form');
    if (!form) return;

    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

    // Validation
    if (!username || !password) {
        showLoginMessage('Por favor completa todos los campos', 'error');
        return;
    }

    // Show loading state
    setLoginLoading(true);
    clearLoginMessage();

    try {
        const result = await authManager.login(username, password, remember);

        if (result.success) {
            showLoginMessage('¡Acceso correcto! Redirigiendo...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        } else {
            showLoginMessage(result.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginMessage('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        setLoginLoading(false);
    }
}

function setLoginLoading(loading) {
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function showLoginMessage(message, type) {
    const messageElement = document.getElementById('login-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `login-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                clearLoginMessage();
            }, 3000);
        }
    }
}

function clearLoginMessage() {
    const messageElement = document.getElementById('login-message');
    if (messageElement) {
        messageElement.style.display = 'none';
        messageElement.textContent = '';
        messageElement.className = 'login-message';
    }
}

function redirectToDashboard() {
    window.location.href = './dashboard.html';
}

// ===== ADMIN PANEL FUNCTIONS =====

function initializeAdminPanel() {
    // Check authentication
    if (!authManager.isAuthenticated()) {
        window.location.href = './login.html';
        return;
    }

    // Check admin permissions
    if (!authManager.isAdmin()) {
        showMessage('No tienes permisos de administrador', 'error');
        setTimeout(() => {
            authManager.logout();
        }, 3000);
        return;
    }

    // Setup user menu
    setupUserMenu();
    
    // Setup logout buttons
    setupLogoutHandlers();
    
    // Setup navigation
    setupNavigation();
}

function setupUserMenu() {
    const user = authManager.getUser();
    if (!user) return;

    // Update user display
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');

    if (userAvatar) {
        userAvatar.textContent = user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = user.full_name || user.username;
    }

    if (userRole) {
        userRole.textContent = user.is_superuser ? 'Administrador' : 'Usuario';
    }
}

function setupLogoutHandlers() {
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

function handleLogout(event) {
    event.preventDefault();
    
    if (confirm('¿Estás seguro que quieres cerrar sesión?')) {
        showLoadingOverlay('Cerrando sesión...');
        
        setTimeout(() => {
            authManager.logout();
        }, 1000);
    }
}

function setupNavigation() {
    // Setup active nav link highlighting
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// ===== UTILITY FUNCTIONS =====

function showMessage(message, type = 'info', duration = 5000) {
    // Create or update message element
    let messageElement = document.getElementById('admin-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'admin-message';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(messageElement);
    }

    // Set message and styling
    messageElement.textContent = message;
    messageElement.className = `admin-message ${type}`;
    
    // Color scheme
    const colors = {
        success: { bg: '#10b981', text: '#ffffff' },
        error: { bg: '#ef4444', text: '#ffffff' },
        warning: { bg: '#f59e0b', text: '#ffffff' },
        info: { bg: '#3b82f6', text: '#ffffff' }
    };
    
    const color = colors[type] || colors.info;
    messageElement.style.backgroundColor = color.bg;
    messageElement.style.color = color.text;
    
    // Show message
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-hide
    setTimeout(() => {
        messageElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, duration);
}

function showLoadingOverlay(message = 'Cargando...') {
    // Remove existing overlay
    hideLoadingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 16px; font-size: 1rem;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ===== API HELPER =====
function makeAuthenticatedRequest(endpoint, options = {}) {
    return authManager.makeRequest(endpoint, options);
}

// ===== PAGE PROTECTION =====
function requireAuth() {
    if (!authManager.isAuthenticated()) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!authManager.isAdmin()) {
        showMessage('Acceso denegado: Se requieren permisos de administrador', 'error');
        setTimeout(() => {
            authManager.logout();
        }, 3000);
        return false;
    }
    return true;
}

// ===== GLOBAL EXPORTS =====
window.authManager = authManager;
window.initializeLoginPage = initializeLoginPage;
window.initializeAdminPanel = initializeAdminPanel;
window.makeAuthenticatedRequest = makeAuthenticatedRequest;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.showMessage = showMessage;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Auto-initialize based on page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        initializeLoginPage();
    } else if (currentPage.includes('admin') || window.location.pathname.includes('/admin/')) {
        initializeAdminPanel();
    }
});

console.log('🔐 Admin Auth System loaded successfully');