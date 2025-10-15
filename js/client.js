// Almacenar el token
let authToken = null;

// Función para hacer requests autenticados
async function authFetch(url, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, options);
    
    // Si el token expiró
    if (response.status === 403) {
        // Redirigir a login
        window.location.href = '/login.html';
    }
    
    return response;
}

// En el login, guardar el token
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/inicio.html';
            } else {
                showAlert('Error: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            showAlert('Error de conexión', 'error');
        }
    });
}

