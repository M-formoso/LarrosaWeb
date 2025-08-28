// ===== CORRECCIÓN COMPLETA DEL SISTEMA DE AUTENTICACIÓN =====

// Configuration - ACTUALIZADA
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api/v1',
    endpoints: {
        login: '/auth/login-json',
        verify: '/auth/verify-token',
        refresh: '/auth/refresh',
        me: '/auth/me'
    }
};

// Auth manager class - CORREGIDA
class AuthManager {
    constructor() {
        this.token = null;
        this.user = null;
        this.refreshTimer = null;
        this.init();
    }

    init() {
        console.log('🔐 Initializing AuthManager...');
        const savedToken = this.getStoredToken();
        if (savedToken) {
            this.token = savedToken;
            console.log('✅ Found saved token');
        }
    }

    // Storage methods - CORREGIDAS
    getStoredToken() {
        return localStorage.getItem('admin_token') || 
               sessionStorage.getItem('admin_token');
    }

    storeToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_remember', 'true');
        } else {
            sessionStorage.setItem('admin_token', token);
        }
        this.token = token;
        console.log('💾 Token stored successfully');
    }

    storeUser(user, remember = false) {
        const userData = JSON.stringify(user);
        if (remember) {
            localStorage.setItem('admin_user', userData);
        } else {
            sessionStorage.setItem('admin_user', userData);
        }
        this.user = user;
        console.log('👤 User data stored successfully');
    }

    clearStorage() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_remember');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        this.token = null;
        this.user = null;
        console.log('🗑️ Storage cleared');
    }

    // API methods - MEJORADAS
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
            console.log(`🌐 Making request to: ${url}`, {
                method: config.method || 'GET',
                hasAuth: !!this.token
            });

            const response = await fetch(url, config);
            
            // Manejar respuestas no-JSON
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.warn('⚠️ Non-JSON response:', text);
                throw new Error('Respuesta del servidor no válida');
            }

            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status, data);
                throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ Request successful:`, data);
            return data;

        } catch (error) {
            console.error('❌ API Request failed:', error);
            
            // Errores de red más específicos
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('❌ No se puede conectar al servidor. ¿Está el backend funcionando en localhost:8000?');
            }
            
            throw error;
        }
    }

    // Login method - COMPLETAMENTE REESCRITA
    async login(username, password, remember = false) {
        try {
            console.log(`🔐 Attempting login for user: ${username}`);
            
            const response = await this.makeRequest(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password: password 
                })
            });

            if (response.access_token && response.user) {
                console.log('✅ Login successful:', response.user);
                
                this.storeToken(response.access_token, remember);
                this.storeUser(response.user, remember);
                this.setupTokenRefresh();
                
                return {
                    success: true,
                    user: response.user,
                    token: response.access_token
                };
            } else {
                console.error('❌ Invalid login response:', response);
                throw new Error('Respuesta de login inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Login failed:', error);
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }

    // Helper para mensajes de error más claros
    getErrorMessage(error) {
        if (error.message.includes('No se puede conectar')) {
            return 'No se puede conectar al servidor. Verifique que el backend esté funcionando.';
        }
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            return 'Usuario o contraseña incorrectos';
        }
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
            return 'Acceso denegado. Contacte al administrador.';
        }
        return error.message || 'Error al iniciar sesión';
    }

    // Token verification - MEJORADA
    async verifyToken() {
        if (!this.token) {
            console.log('❌ No token to verify');
            return false;
        }

        try {
            console.log('🔍 Verifying token...');
            const response = await this.makeRequest(API_CONFIG.endpoints.verify, {
                method: 'POST'
            });

            if (response.valid) {
                console.log('✅ Token is valid');
                
                // Obtener datos del usuario si no los tenemos
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
            
            const remember = localStorage.getItem('admin_remember') === 'true';
            this.storeUser(response, remember);
            
            return response;
        } catch (error) {
            console.error('❌ Failed to get current user:', error);
            return null;
        }
    }

    setupTokenRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        // Refrescar token cada 25 minutos (antes de que expire a los 30)
        const refreshTime = 25 * 60 * 1000;
        this.refreshTimer = setTimeout(async () => {
            console.log('🔄 Auto-refreshing token...');
            await this.refreshToken();
        }, refreshTime);
    }

    async refreshToken() {
        if (!this.token) return false;

        try {
            const response = await this.makeRequest(API_CONFIG.endpoints.refresh, {
                method: 'POST'
            });

            if (response.access_token) {
                const remember = localStorage.getItem('admin_remember') === 'true';
                this.storeToken(response.access_token, remember);
                this.setupTokenRefresh();
                console.log('✅ Token refreshed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        console.log('🚪 Logging out...');
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        this.clearStorage();
        
        // Redirect solo si no estamos ya en login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = './login.html';
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
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

// ===== LOGIN PAGE FUNCTIONS - COMPLETAMENTE REESCRITAS =====

// Global auth instance
const authManager = new AuthManager();

function initializeLoginPage() {
    console.log('🔑 Initializing login page...');
    
    // Verificar si ya está autenticado
    if (authManager.isAuthenticated()) {
        console.log('✅ User already authenticated, verifying token...');
        authManager.verifyToken().then(valid => {
            if (valid) {
                redirectToDashboard();
            }
        });
        return;
    }

    // Setup del formulario
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        console.log('📝 Login form event listener attached');
    } else {
        console.error('❌ Login form not found');
    }

    // Autocompletado si hay usuario recordado
    const savedUsername = localStorage.getItem('admin_last_username');
    if (savedUsername) {
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.value = savedUsername;
            document.getElementById('password')?.focus();
        }
    } else {
        document.getElementById('username')?.focus();
    }

    // Test de conexión al backend
    testBackendConnection();
}

async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const healthURL = API_CONFIG.baseURL.replace('/api/v1', '') + '/health';
        const response = await fetch(healthURL);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            showLoginMessage('✅ Conectado al servidor', 'success');
            
            // Ocultar mensaje de éxito después de 2 segundos
            setTimeout(() => {
                clearLoginMessage();
            }, 2000);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showLoginMessage('❌ Error de conexión con el servidor. Verifique que el backend esté funcionando en localhost:8000', 'error');
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    console.log('📝 Login form submitted');
    
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username')?.trim();
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

    console.log(`🔐 Login attempt:`, { username, remember });

    // Validación
    if (!username || !password) {
        showLoginMessage('❌ Por favor completa todos los campos', 'error');
        return;
    }

    // Estado de carga
    setLoginLoading(true);
    clearLoginMessage();

    try {
        const result = await authManager.login(username, password, remember);

        if (result.success) {
            console.log('✅ Login successful', result.user);
            
            // Guardar último username usado
            localStorage.setItem('admin_last_username', username);
            
            showLoginMessage('✅ ¡Acceso correcto! Redirigiendo...', 'success');
            
            // Actualizar estado de navegación
            if (window.updateAdminButtonState) {
                window.updateAdminButtonState();
            }
            
            // Redirect con delay para mostrar mensaje
            setTimeout(() => {
                redirectToDashboard();
            }, 1500);
        } else {
            console.error('❌ Login failed:', result.error);
            showLoginMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showLoginMessage('❌ Error inesperado. Inténtalo de nuevo.', 'error');
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
            }, 4000);
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

// ===== ADMIN PANEL FUNCTIONS =====

function initializeAdminPanel() {
    console.log('📊 Initializing admin panel...');
    
    // Verificar autenticación
    if (!authManager.isAuthenticated()) {
        console.log('❌ Not authenticated, redirecting to login...');
        window.location.href = './login.html';
        return;
    }

    // Verificar token
    authManager.verifyToken().then(valid => {
        if (!valid) {
            console.log('❌ Invalid token, redirecting to login...');
            window.location.href = './login.html';
            return;
        }

        // Cargar datos del dashboard
        loadDashboardData();
        setupEventListeners();
        updateUserInfo();
    });
}

function updateUserInfo() {
    const user = authManager.getUser();
    if (user) {
        // Actualizar avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.textContent = user.username.charAt(0).toUpperCase();
        }

        // Actualizar nombre y rol
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        
        if (userName) userName.textContent = user.full_name || user.username;
        if (userRole) userRole.textContent = user.is_superuser ? 'Administrador' : 'Usuario';
    }
}

async function loadDashboardData() {
    try {
        showLoadingOverlay('Cargando datos del dashboard...');
        
        // Cargar estadísticas
        const stats = await authManager.makeRequest('/vehicles/stats');
        updateStatsCards(stats);
        
        // Cargar vehículos recientes
        const recentVehicles = await authManager.makeRequest('/vehicles/?limit=5');
        updateRecentVehicles(recentVehicles.vehicles);
        
        hideLoadingOverlay();
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showMessage('Error cargando datos del dashboard: ' + error.message, 'error');
        hideLoadingOverlay();
    }
}

// ===== UTILITY FUNCTIONS =====

function requireAdmin() {
    if (!authManager.isAuthenticated()) {
        console.log('❌ Authentication required, redirecting...');
        window.location.href = './login.html';
        return false;
    }
    return true;
}

async function makeAuthenticatedRequest(endpoint, options = {}) {
    return await authManager.makeRequest(endpoint, options);
}

function showLoadingOverlay(message = 'Cargando...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        const text = overlay.querySelector('p');
        if (text) text.textContent = message;
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showMessage(message, type = 'info') {
    console.log(`📢 Message (${type}): ${message}`);
    
    // Crear o mostrar notificación
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ===== GLOBAL EXPORTS =====
window.authManager = authManager;
window.initializeLoginPage = initializeLoginPage;
window.initializeAdminPanel = initializeAdminPanel;
window.requireAdmin = requireAdmin;
window.makeAuthenticatedRequest = makeAuthenticatedRequest;
window.testBackendConnection = testBackendConnection;

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM loaded, initializing auth system...');
    
    const currentPage = window.location.pathname.split('/').pop();
    console.log(`📄 Current page: ${currentPage}`);
    
    if (currentPage === 'login.html') {
        initializeLoginPage();
    } else if (currentPage === 'dashboard.html') {
        initializeAdminPanel();
    }
});

console.log('🔐 Admin Auth System loaded successfully - v2.0');