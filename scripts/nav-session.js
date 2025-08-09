// ===== INDICADOR DE SESIÓN ADMIN EN NAVEGACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    updateAdminButtonState();
});

function updateAdminButtonState() {
    const adminButton = document.querySelector('.btn-admin');
    if (!adminButton) return;

    // Verificar si hay token de admin almacenado
    const hasAdminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    
    if (hasAdminToken) {
        // Mostrar estado "logueado"
        adminButton.classList.add('logged-in');
        adminButton.title = 'Panel de Administración (Sesión activa)';
        
        // Cambiar el texto si existe
        const buttonText = adminButton.querySelector('span');
        if (buttonText) {
            buttonText.textContent = 'Panel';
        }
        
        // Cambiar destino a dashboard en lugar de login
        adminButton.href = '../admin/dashboard.html';
    } else {
        // Estado normal - ir a login
        adminButton.classList.remove('logged-in');
        adminButton.title = 'Panel de Administración';
        adminButton.href = '../admin/login.html';
        
        const buttonText = adminButton.querySelector('span');
        if (buttonText) {
            buttonText.textContent = 'Admin';
        }
    }
}

// Escuchar cambios en el localStorage para actualizar el estado
window.addEventListener('storage', function(e) {
    if (e.key === 'admin_token') {
        updateAdminButtonState();
    }
});

// Función global para actualizar desde otros scripts
window.updateAdminButtonState = updateAdminButtonState;