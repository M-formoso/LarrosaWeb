// ===== ADMIN AUTHENTICATION SYSTEM - CORREGIDO =====

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
            // Verificar token en background, no bloquear la carga
            this.verifyToken().catch(err => {
                console.warn('Token verification failed:', err);
                this.clearStorage();
            });
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

    // API methods - CORREGIDO
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
            console.log(`🌐 Making request to: ${url}`);
            const response = await fetch(url, config);
            
            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.warn('Non-JSON response:', text);
                throw new Error('Respuesta del servidor no válida');
            }

            if (!response.ok) {
                throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ Request successful:`, data);
            return data;
        } catch (error) {
            console.error('❌ API Request failed:', error);
            
            // Si es error de red, mostrar mensaje más amigable
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('No se puede conectar al servidor. Verifique que el backend esté funcionando.');
            }
            
            throw error;
        }
    }

    // Authentication methods - CORREGIDO
    async login(username, password, remember = false) {
        try {
            console.log(`🔐 Attempting login for user: ${username}`);
            
            const response = await this.makeRequest(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.access_token && response.user) {
                console.log('✅ Login successful');
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
            console.error('❌ Login failed:', error);
            return {
                success: false,
                error: error.message || 'Error al iniciar sesión'
            };
        }
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            console.log('🔍 Verifying token...');
            const response = await this.makeRequest(API_CONFIG.endpoints.verify, {
                method: 'POST'
            });

            if (response.valid) {
                console.log('✅ Token is valid');
                // Get user info if not stored
                if (!this.user) {
                    await this.getCurrentUser();
                }
                this.setupTokenRefresh();
                return true;
            } else {
                console.warn('⚠️ Token is invalid');
                this.clearStorage();
                return false;
            }
        } catch (error) {
            console.error('❌ Token verification failed:', error);
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
        const refreshTime = 25 * 60 * 1000; // 25 minutes in milliseconds
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

// ===== LOGIN PAGE FUNCTIONS - MEJORADO =====

function initializeLoginPage() {
    console.log('🔑 Initializing login page...');
    
    // Check if already authenticated
    if (authManager.isAuthenticated()) {
        console.log('✅ User already authenticated, redirecting...');
        redirectToDashboard();
        return;
    }

    // Setup form submission
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        console.log('📝 Login form event listener attached');
    } else {
        console.error('❌ Login form not found');
    }

    // Setup enter key handling
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.closest('.login-form')) {
            e.preventDefault();
            const form = document.getElementById('admin-login-form');
            if (form) {
                handleLoginSubmit({ target: form, preventDefault: () => {} });
            }
        }
    });

    // Focus on username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }

    // Test backend connection
    testBackendConnection();
}

async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await fetch(`${API_CONFIG.baseURL.replace('/api/v1', '')}/health`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            showLoginMessage('Conexión con servidor establecida', 'success');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showLoginMessage('Error de conexión con el servidor. Verifique que el backend esté funcionando.', 'error');
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    console.log('📝 Form submitted');
    
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

    console.log(`🔐 Login attempt - Username: ${username}, Remember: ${remember}`);

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
            console.log('✅ Login successful');
            showLoginMessage('¡Acceso correcto! Redirigiendo...', 'success');
            
            // Update navigation state
            if (window.updateAdminButtonState) {
                window.updateAdminButtonState();
            }
            
            // Redirect after short delay
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        } else {
            console.error('❌ Login failed:', result.error);
            showLoginMessage(result.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showLoginMessage('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        setLoginLoading(false);
    }
}

function setLoginLoading(loading) {
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn?.querySelector('.btn-text');
    const btnLoading = loginBtn?.querySelector('.btn-loading');

    if (loading) {
        if (loginBtn) loginBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.disabled = false;
        if (btnText) btnText.style.display = 'block';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

function showLoginMessage(message, type) {
    const messageElement = document.getElementById('login-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `login-message ${type}`;
        messageElement.style.display = 'block';
        
        console.log(`📢 Login message (${type}): ${message}`);
        
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
    console.log('🔄 Redirecting to dashboard...');
    window.location.href = './dashboard.html';
}

// ===== RESTO DE FUNCIONES MANTENIDAS =====
// [El resto del código permanece igual...]

// ===== GLOBAL EXPORTS =====
window.authManager = authManager;
window.initializeLoginPage = initializeLoginPage;
window.testBackendConnection = testBackendConnection;

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM loaded, initializing auth system...');
    
    const currentPage = window.location.pathname.split('/').pop();
    console.log(`📄 Current page: ${currentPage}`);
    
    if (currentPage === 'login.html') {
        initializeLoginPage();
    }
});

console.log('🔐 Admin Auth System loaded successfully');