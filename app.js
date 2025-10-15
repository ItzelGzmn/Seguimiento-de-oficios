// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Aplicación iniciada');
    checkAuth();
});

// Verificar si el usuario está autenticado
async function checkAuth() {
    try {
        console.log('🔍 Verificando autenticación...');
        const response = await fetch('/auth/check', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        console.log('📊 Respuesta de autenticación:', data);
        
        if (data.loggedIn && data.user) {
            showDashboard(data.user);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        showMessage('Error de conexión con el servidor', 'error');
        showLogin(); // Mostrar login como fallback
    }
}

// Mostrar el dashboard cuando el usuario está autenticado
function showDashboard(user) {
    console.log('👤 Usuario autenticado:', user);
    
    // Ocultar login, mostrar dashboard
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    
    // Mostrar burbuja de usuario
    const bubble = document.getElementById('userBubble');
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    const email = document.getElementById('userEmail');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Actualizar información del usuario
    if (user.nombre && user.apellidos) {
        name.textContent = `${user.nombre} ${user.apellidos}`;
        welcomeMessage.textContent = `¡Bienvenido, ${user.nombre} ${user.apellidos}!`;
    } else {
        name.textContent = 'Usuario';
        welcomeMessage.textContent = '¡Bienvenido al sistema!';
    }
    
    email.textContent = user.email || 'usuario@ejemplo.com';
    
    // Generar avatar con iniciales y color único
    const initials = getInitials(user.nombre, user.apellidos);
    avatar.textContent = initials;
    
    const color = getRandomColor(user.nombre);
    avatar.style.backgroundColor = color;
    
    bubble.style.display = 'flex';
    
    console.log('🏠 Dashboard mostrado');
}

// Obtener iniciales del nombre
function getInitials(nombre, apellidos) {
    if (!nombre) return 'U';
    
    const firstInitial = nombre.charAt(0);
    const lastInitial = apellidos ? apellidos.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

// Generar color único basado en el nombre
function getRandomColor(str) {
    if (!str) return '#3B82F6';
    
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
        '#F97316', '#6366F1', '#14B8A6', '#EAB308'
    ];
    
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
}

// Mostrar formulario de login
function showLogin() {
    console.log('🔐 Mostrando formulario de login');
    
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('userBubble').style.display = 'none';
    
    // Limpiar mensajes
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('loginMessage').className = 'message';
}

// Manejar el envío del formulario de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📨 Enviando formulario de login');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    
    // Validaciones básicas
    if (!email || !password) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Mostrar loading
    loginBtn.disabled = true;
    loginBtn.textContent = 'Ingresando...';
    
    try {
        console.log('🔄 Enviando petición de login...');
        
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del login:', data);
        
        if (data.success) {
            showMessage('¡Login exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                showDashboard(data.user);
            }, 1500);
        } else {
            showMessage(data.message || 'Error en el login', 'error');
            console.error('❌ Error de login:', data.message);
        }
    } catch (error) {
        console.error('❌ Error en login:', error);
        showMessage('Error de conexión con el servidor', 'error');
    } finally {
        // Restaurar botón
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar';
    }
});

// Cerrar sesión
async function logout() {
    console.log('🚪 Cerrando sesión...');
    
    if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        return;
    }
    
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del logout:', data);
        
        if (data.success) {
            showMessage('Sesión cerrada correctamente', 'success');
            setTimeout(() => {
                showLogin();
                document.getElementById('loginForm').reset();
            }, 1000);
        } else {
            showMessage(data.message || 'Error al cerrar sesión', 'error');
        }
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showMessage('Error al cerrar sesión', 'error');
    }
}

// Mostrar mensajes al usuario
function showMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    console.log(`💬 Mensaje [${type}]:`, message);
    
    // Auto-ocultar mensajes después de 5 segundos
    setTimeout(() => {
        if (messageDiv.textContent === message) {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }
    }, 5000);
}

// Navegación (puedes personalizar estas funciones)
function goToOficios() {
    console.log('📄 Navegando a oficios...');
    alert('Aquí irías a la gestión de oficios');
    // window.location.href = '/oficios.html';
}

function goToUsuarios() {
    console.log('👥 Navegando a usuarios...');
    alert('Aquí irías a la gestión de usuarios');
    // window.location.href = '/usuarios.html';
}

// Función para probar la conexión con el servidor
async function testConnection() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('🏥 Estado del servidor:', data);
        return data.status === 'OK';
    } catch (error) {
        console.error('❌ Error conectando con el servidor:', error);
        return false;
    }
}

// Verificar conexión al cargar
document.addEventListener('DOMContentLoaded', async function() {
    const isConnected = await testConnection();
    if (!isConnected) {
        showMessage('No se pudo conectar con el servidor', 'error');
    }
});

// función para verificar sesión periódicamente
setInterval(checkAuth, 5 * 60 * 1000); // Cada 5 minutos

// Exportar funciones para debugging (opcional)
window.appDebug = {
    checkAuth,
    testConnection,
    showDashboard,
    showLogin,
    getInitials,
    getRandomColor
};

console.log('🚀 app.js cargado correctamente');