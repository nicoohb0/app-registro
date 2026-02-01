// js/registro.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const navbar = document.querySelector('.navbar .d-flex');
    const sectionBienvenida = document.getElementById('sectionBienvenida');
    const userAvatar = document.getElementById('userAvatar');
    const nombreUsuario = document.getElementById('nombreUsuario');
    const saludoUsuario = document.getElementById('saludoUsuario');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    const ultimaFecha = document.getElementById('ultimaFecha');
    
    // Estado de usuario
    let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado')) || null;
    
    // Inicializar
    init();
    
    function init() {
        actualizarUI();
        configurarEventos();
    }
    
    function actualizarUI() {
        if (usuarioLogueado) {
            mostrarUsuarioLogueado();
            mostrarBienvenida();
        } else {
            mostrarBotonesLogin();
            ocultarBienvenida();
        }
    }
    
    // ========== MANEJO DE FORMULARIOS ==========
    
    // 1. Formulario de Registro
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validarFormularioRegistro()) return;
            
            const datos = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                correo: document.getElementById('correoRegistro').value.trim(),
                clave: document.getElementById('claveRegistro').value,
                fechaRegistro: new Date().toISOString()
            };
            
            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });
                
                const resultado = await respuesta.json();
                
                if (respuesta.ok) {
                    // Auto-login después del registro
                    const usuario = {
                        id: resultado.insertedId || Date.now(),
                        nombre: datos.nombre,
                        apellido: datos.apellido,
                        correo: datos.correo,
                        ultimoAcceso: new Date().toISOString()
                    };
                    
                    loginUsuario(usuario);
                    
                    alert('¡Registro exitoso! Bienvenido ' + datos.nombre);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarse'));
                    modal.hide();
                    formRegistro.reset();
                } else {
                    alert('Error: ' + (resultado.error || 'No se pudo registrar'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
    
    // 2. Formulario de Inicio de Sesión
    const formularioInicio = document.getElementById('formularioInicio');
    if (formularioInicio) {
        formularioInicio.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const correo = document.getElementById('correoUsuario').value.trim();
            const clave = document.getElementById('claveUsuario').value;
            
            try {
                // Obtener todos los usuarios registrados
                const respuesta = await fetch('/api/registro');
                const usuarios = await respuesta.json();
                
                // Buscar usuario por correo (en producción deberías verificar la contraseña hasheada)
                const usuarioEncontrado = Array.isArray(usuarios) ? 
                    usuarios.find(u => u.correo === correo) : null;
                
                if (usuarioEncontrado) {
                    // En producción: verificar contraseña hasheada
                    // Por ahora, asumimos que la contraseña es correcta
                    
                    const usuario = {
                        id: usuarioEncontrado._id || usuarioEncontrado.id,
                        nombre: usuarioEncontrado.nombre,
                        apellido: usuarioEncontrado.apellido,
                        correo: usuarioEncontrado.correo,
                        ultimoAcceso: new Date().toISOString()
                    };
                    
                    loginUsuario(usuario);
                    
                    alert('¡Inicio de sesión exitoso!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalIniciarSesion'));
                    modal.hide();
                    formularioInicio.reset();
                } else {
                    alert('Correo o contraseña incorrectos');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
    
    // ========== FUNCIONES DE AUTENTICACIÓN ==========
    
    function loginUsuario(usuario) {
        usuarioLogueado = usuario;
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        actualizarUI();
    }
    
    function logoutUsuario() {
        usuarioLogueado = null;
        localStorage.removeItem('usuarioLogueado');
        actualizarUI();
        alert('Sesión cerrada correctamente');
    }
    
    // ========== FUNCIONES DE UI ==========
    
    function mostrarUsuarioLogueado() {
        // Crear o actualizar dropdown de usuario
        let dropdownContainer = document.querySelector('.dropdown-usuario');
        
        if (!dropdownContainer) {
            dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'dropdown dropdown-usuario';
            navbar.innerHTML = '';
            navbar.appendChild(dropdownContainer);
        }
        
        const nombreCompleto = `${usuarioLogueado.nombre} ${usuarioLogueado.apellido}`;
        const iniciales = `${usuarioLogueado.nombre.charAt(0)}${usuarioLogueado.apellido.charAt(0)}`.toUpperCase();
        const colorUsuario = generarColorDesdeNombre(usuarioLogueado.nombre);
        
        dropdownContainer.innerHTML = `
            <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false">
                <div class="avatar-circle-sm me-2" style="background: ${colorUsuario}">
                    ${iniciales}
                </div>
                <span class="d-none d-md-inline">${nombreCompleto}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <h6 class="dropdown-header">Mi Cuenta</h6>
                </li>
                <li>
                    <a class="dropdown-item" href="#" onclick="mostrarPerfil()">
                        <i class="fas fa-user-circle me-2"></i>Mi Perfil
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="#" onclick="mostrarReservas()">
                        <i class="fas fa-calendar-alt me-2"></i>Mis Reservas
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()">
                        <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </a>
                </li>
            </ul>
        `;
    }
    
    function mostrarBotonesLogin() {
        navbar.innerHTML = `
            <button type="button" class="btn btn-outline-light me-2" data-bs-toggle="modal"
                data-bs-target="#modalIniciarSesion">
                <i class="fas fa-sign-in-alt me-1"></i>Iniciar Sesión
            </button>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                data-bs-target="#modalRegistrarse">
                <i class="fas fa-user-plus me-1"></i>Registrarse
            </button>
        `;
    }
    
    function mostrarBienvenida() {
        if (!sectionBienvenida) return;
        
        sectionBienvenida.style.display = 'block';
        sectionBienvenida.classList.add('fade-in');
        
        // Actualizar contenido
        const horaActual = new Date().getHours();
        let saludo = '';
        
        if (horaActual < 12) saludo = '¡Buenos días';
        else if (horaActual < 19) saludo = '¡Buenas tardes';
        else saludo = '¡Buenas noches';
        
        saludoUsuario.textContent = `${saludo},`;
        nombreUsuario.textContent = usuarioLogueado.nombre;
        
        // Mensaje personalizado según la hora
        const mensajes = [
            'Esperamos que tengas una excelente experiencia',
            'Que tengas un día maravilloso',
            '¡Es genial verte de nuevo!',
            'Listo para comenzar',
            'Tu día va a ser increíble'
        ];
        
        mensajeBienvenida.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
        
        // Formatear fecha del último acceso
        const fecha = new Date(usuarioLogueado.ultimoAcceso || new Date());
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        ultimaFecha.textContent = fecha.toLocaleDateString('es-ES', opciones);
        
        // Avatar con iniciales
        const iniciales = `${usuarioLogueado.nombre.charAt(0)}${usuarioLogueado.apellido.charAt(0)}`.toUpperCase();
        const colorUsuario = generarColorDesdeNombre(usuarioLogueado.nombre);
        
        userAvatar.innerHTML = iniciales;
        userAvatar.style.backgroundColor = colorUsuario;
        userAvatar.style.setProperty('--color-usuario', colorUsuario);
    }
    
    function ocultarBienvenida() {
        if (sectionBienvenida) {
            sectionBienvenida.style.display = 'none';
        }
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    function configurarEventos() {
        // Agregar eventos globales
        window.cerrarSesion = function() {
            logoutUsuario();
        };
        
        window.mostrarPerfil = function() {
            alert('Perfil de ' + usuarioLogueado.nombre + '\n\nFuncionalidad en desarrollo');
        };
        
        window.mostrarReservas = function() {
            alert('Mostrando reservas de ' + usuarioLogueado.nombre + '\n\nFuncionalidad en desarrollo');
        };
        
        window.irAPerfil = function() {
            mostrarPerfil();
        };
    }
    
    function validarFormularioRegistro() {
        const clave = document.getElementById('claveRegistro').value;
        const confirmarClave = document.getElementById('confirmarClave').value;
        
        if (clave !== confirmarClave) {
            alert('Las contraseñas no coinciden');
            return false;
        }
        
        if (clave.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        return true;
    }
    
    function generarColorDesdeNombre(nombre) {
        // Genera un color basado en el nombre del usuario
        let hash = 0;
        for (let i = 0; i < nombre.length; i++) {
            hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colores = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#fa709a', '#fee140', '#a8edea', '#fed6e3'
        ];
        
        return colores[Math.abs(hash) % colores.length];
    }
});