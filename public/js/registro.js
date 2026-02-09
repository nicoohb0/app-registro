
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar .d-flex');
    const sectionBienvenida = document.getElementById('sectionBienvenida');
    const userAvatar = document.getElementById('userAvatar');
    const nombreUsuario = document.getElementById('nombreUsuario');
    const saludoUsuario = document.getElementById('saludoUsuario');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    const ultimaFecha = document.getElementById('ultimaFecha');
    let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado')) || null;

    init();

    function init() {
        actualizarUI();
        configurarEventos();
        configurarValidaciones();
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

    function configurarValidaciones() {
        const claveRegistro = document.getElementById('claveRegistro');
        const confirmarClave = document.getElementById('confirmarClave');
        const nombre = document.getElementById('nombre');
        const apellido = document.getElementById('apellido');
        const indicadorFortaleza = document.createElement('div');
        indicadorFortaleza.className = 'password-strength mt-2';

        if (nombre) {
            nombre.addEventListener('input', function () {
                const valor = this.value.trim();
                const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

                if (!regex.test(valor)) {
                    this.value = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                }

                if (this.value.length > 15) {
                    this.value = this.value.substring(0, 15);
                }

                validarCampoTexto(this, 'nombreError');
            });

            nombre.addEventListener('blur', function () {
                validarCampoTexto(this, 'nombreError');
            });
        }

        if (apellido) {
            apellido.addEventListener('input', function () {
                const valor = this.value.trim();
                const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

                if (!regex.test(valor)) {
                    this.value = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                }

                if (this.value.length > 15) {
                    this.value = this.value.substring(0, 15);
                }

                validarCampoTexto(this, 'apellidoError');
            });

            apellido.addEventListener('blur', function () {
                validarCampoTexto(this, 'apellidoError');
            });
        }

        if (claveRegistro && confirmarClave) {
            claveRegistro.parentNode.appendChild(indicadorFortaleza);
            claveRegistro.addEventListener('input', async function () {
                const password = this.value;

                const tieneMinuscula = /[a-z]/.test(password);
                const tieneMayuscula = /[A-Z]/.test(password);
                const tieneNumero = /\d/.test(password);
                const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
                const longitudOk = password.length >= 12;

                actualizarIndicadorFortaleza(indicadorFortaleza, password);

                if (confirmarClave.value && password !== confirmarClave.value) {
                    confirmarClave.classList.add('is-invalid');
                } else {
                    confirmarClave.classList.remove('is-invalid');
                }

                if (password.length >= 8) {
                    try {
                        const respuesta = await fetch('/api/registro/validate-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password: password })
                        });

                        const resultado = await respuesta.json();

                        if (!resultado.isValid) {
                            this.setCustomValidity(resultado.errors.join('. '));
                            this.classList.add('is-invalid');
                        } else {
                            this.setCustomValidity('');
                            this.classList.remove('is-invalid');
                        }
                    } catch (error) {
                        console.error('Error en validación:', error);
                    }
                }
            });

            confirmarClave.addEventListener('input', function () {
                if (claveRegistro.value !== this.value) {
                    this.setCustomValidity('Las contraseñas no coinciden');
                    this.classList.add('is-invalid');
                } else {
                    this.setCustomValidity('');
                    this.classList.remove('is-invalid');
                }
            });

            const generarBtn = document.createElement('button');
            generarBtn.type = 'button';
            generarBtn.className = 'btn btn-sm btn-outline-secondary mt-2';
            generarBtn.innerHTML = '<i class="fas fa-key me-1"></i>Generar contraseña segura';
            generarBtn.addEventListener('click', async function () {
                try {
                    const respuesta = await fetch('/api/registro/generate-password');
                    const resultado = await respuesta.json();

                    if (resultado.success) {
                        claveRegistro.value = resultado.password;
                        confirmarClave.value = resultado.password;
                        claveRegistro.dispatchEvent(new Event('input'));
                        alert('Contraseña generada. Cópiala y guárdala en un lugar seguro.');
                    }
                } catch (error) {
                    console.error('Error al generar contraseña:', error);
                }
            });

            claveRegistro.parentNode.appendChild(generarBtn);
        }
    }

    function actualizarIndicadorFortaleza(elemento, password) {
        if (!password) {
            elemento.innerHTML = '';
            elemento.className = 'password-strength mt-2';
            return;
        }

        const longitud = password.length;
        const tieneMinuscula = /[a-z]/.test(password);
        const tieneMayuscula = /[A-Z]/.test(password);
        const tieneNumero = /\d/.test(password);
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

        let fuerza = 0;
        let mensajes = [];

        if (longitud >= 12) fuerza += 2;
        else if (longitud >= 8) fuerza += 1;

        if (tieneMinuscula) fuerza += 1;
        if (tieneMayuscula) fuerza += 1;
        if (tieneNumero) fuerza += 1;
        if (tieneEspecial) fuerza += 1;

        let nivel = '';
        let clase = '';

        if (fuerza >= 6) {
            nivel = 'Muy fuerte';
            clase = 'strength-very-strong';
        } else if (fuerza >= 4) {
            nivel = 'Fuerte';
            clase = 'strength-strong';
        } else if (fuerza >= 2) {
            nivel = 'Moderada';
            clase = 'strength-moderate';
        } else {
            nivel = 'Débil';
            clase = 'strength-weak';
        }

        if (longitud < 12) mensajes.push(`${12 - longitud} caracteres más para el mínimo`);
        if (!tieneMinuscula) mensajes.push('Agrega minúsculas');
        if (!tieneMayuscula) mensajes.push('Agrega mayúsculas');
        if (!tieneNumero) mensajes.push('Agrega números');
        if (!tieneEspecial) mensajes.push('Agrega caracteres especiales');

        elemento.innerHTML = `
            <div class="strength-bar ${clase}">
                <div class="strength-fill" style="width: ${Math.min(100, fuerza * 16.66)}%"></div>
            </div>
            <small class="d-block mt-1">Fortaleza: <strong>${nivel}</strong></small>
            ${mensajes.length > 0 ? `<small class="d-block text-muted">Sugerencias: ${mensajes.join(', ')}</small>` : ''}
        `;
        elemento.className = `password-strength mt-2 ${clase}`;
    }

    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function (e) {
            e.preventDefault();

            console.log('Enviando formulario de registro...');

            if (!validarFormularioRegistro()) return;

            const datos = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                correo: document.getElementById('correoRegistro').value.trim(),
                clave: document.getElementById('claveRegistro').value,
                fechaRegistro: new Date().toISOString()
            };

            console.log('Datos a enviar:', datos);

            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                console.log('Respuesta del servidor:', respuesta);

                const resultado = await respuesta.json();
                console.log('Resultado:', resultado);

                if (resultado.success) {
                    await loginUsuario({
                        nombre: datos.nombre,
                        apellido: datos.apellido,
                        correo: datos.correo
                    });

                    alert('¡Registro exitoso! Bienvenido ' + datos.nombre);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarse'));
                    modal.hide();
                    formRegistro.reset();
                } else {
                    alert('Error: ' + (resultado.error || 'No se pudo registrar'));
                }
            } catch (error) {
                console.error('Error completo:', error);
                alert('Error al conectar con el servidor: ' + error.message);
            }
        });
    }

    const formularioInicio = document.getElementById('formularioInicio');
    if (formularioInicio) {
        formularioInicio.addEventListener('submit', async function (e) {
            e.preventDefault();

            const correo = document.getElementById('correoUsuario').value.trim();
            const clave = document.getElementById('claveUsuario').value;

            try {
                const respuesta = await fetch('/api/registro/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, clave })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    loginUsuario(resultado.usuario);

                    alert('¡Inicio de sesión exitoso!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalIniciarSesion'));
                    modal.hide();
                    formularioInicio.reset();
                } else {
                    alert(`Error: ${resultado.error}${resultado.intentosRestantes ? `\nIntentos restantes: ${resultado.intentosRestantes}` : ''}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }

    async function loginUsuario(usuario) {
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

    function mostrarUsuarioLogueado() {
        let dropdownContainer = document.querySelector('.dropdown-usuario');

        if (!dropdownContainer) {
            dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'dropdown dropdown-usuario';
            navbar.innerHTML = '';
            navbar.appendChild(dropdownContainer);
        }

        const nombreCompleto = `${usuarioLogueado.nombre} ${usuarioLogueado.apellido}`;
        const iniciales = `${usuarioLogueado.nombre.charAt(0)}${usuarioLogueado.apellido.charAt(0)}`.toUpperCase();

        dropdownContainer.innerHTML = `
            <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false">
                <div class="avatar-circle-sm me-2">
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
                    <a class="dropdown-item" href="#" onclick="mostrarCambiarClave()">
                        <i class="fas fa-key me-2"></i>Cambiar Contraseña
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
        const horaActual = new Date().getHours();
        let saludo = '';

        if (horaActual < 12) saludo = '¡Buenos días';
        else if (horaActual < 19) saludo = '¡Buenas tardes';
        else saludo = '¡Buenas noches';

        saludoUsuario.textContent = `${saludo},`;
        nombreUsuario.textContent = usuarioLogueado.nombre;
        const mensajes = [
            'Tu seguridad es nuestra prioridad',
            'Cuenta protegida con criptografía de última generación',
            '¡Es genial verte de nuevo!',
            'Acceso seguro confirmado',
            'Protegemos tus datos con encriptación avanzada'
        ];

        mensajeBienvenida.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
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
        const iniciales = `${usuarioLogueado.nombre.charAt(0)}${usuarioLogueado.apellido.charAt(0)}`.toUpperCase();
        userAvatar.innerHTML = iniciales;
    }

    function ocultarBienvenida() {
        if (sectionBienvenida) {
            sectionBienvenida.style.display = 'none';
        }
    }

    function configurarEventos() {
        window.cerrarSesion = function () {
            logoutUsuario();
        };

        window.mostrarPerfil = function () {
            alert('Perfil de ' + usuarioLogueado.nombre + '\n\nFuncionalidad en desarrollo');
        };

        window.mostrarReservas = function () {
            alert('Mostrando reservas de ' + usuarioLogueado.nombre + '\n\nFuncionalidad en desarrollo');
        };

        window.mostrarCambiarClave = function () {
            alert('Para cambiar tu contraseña:\n1. Ve a tu perfil\n2. Selecciona "Seguridad"\n3. Actualiza tu contraseña\n\nFuncionalidad en desarrollo');
        };

        window.irAPerfil = function () {
            mostrarPerfil();
        };
    }

    function validarFormularioRegistro() {
        if (!validarNombreApellido()) {
            alert('Por favor, corrige los campos de nombre y apellido');
            return false;
        }

        const clave = document.getElementById('claveRegistro').value;
        const confirmarClave = document.getElementById('confirmarClave').value;

        if (clave !== confirmarClave) {
            alert('Las contraseñas no coinciden');
            return false;
        }

        if (clave.length < 12) {
            alert('La contraseña debe tener al menos 12 caracteres');
            return false;
        }

        const tieneMinuscula = /[a-z]/.test(clave);
        const tieneMayuscula = /[A-Z]/.test(clave);
        const tieneNumero = /\d/.test(clave);
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(clave);

        if (!tieneMinuscula || !tieneMayuscula || !tieneNumero || !tieneEspecial) {
            alert('La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales');
            return false;
        }

        return true;
    }
});

function validarNombreApellido() {
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const nombreError = document.getElementById('nombreError');
    const apellidoError = document.getElementById('apellidoError');
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;

    let esValido = true;

    if (nombre) {
        if (!regex.test(nombre.value.trim())) {
            nombre.classList.add('is-invalid');
            nombreError.textContent = 'Solo letras (máximo 15 caracteres, sin números o caracteres especiales)';
            esValido = false;
        } else {
            nombre.classList.remove('is-invalid');
            nombre.classList.add('is-valid');
        }
    }

    if (apellido) {
        if (!regex.test(apellido.value.trim())) {
            apellido.classList.add('is-invalid');
            apellidoError.textContent = 'Solo letras (máximo 15 caracteres, sin números o caracteres especiales)';
            esValido = false;
        } else {
            apellido.classList.remove('is-invalid');
            apellido.classList.add('is-valid');
        }
    }

    return esValido;
}

function validarCampoTexto(campo, idError) {
    const errorElement = document.getElementById(idError);
    const valor = campo.value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;

    if (valor === '') {
        campo.classList.remove('is-valid');
        campo.classList.remove('is-invalid');
        if (errorElement) errorElement.style.display = 'none';
        return;
    }

    if (regex.test(valor)) {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
        if (errorElement) errorElement.style.display = 'none';
    } else {
        campo.classList.remove('is-valid');
        campo.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = 'Solo letras (máximo 15 caracteres)';
            errorElement.style.display = 'block';
        }
    }
}

async function enviarRegistro(datos) {
    try {
        const token = await grecaptcha.execute('TU_SITE_KEY', { action: 'submit' });
        datos.recaptchaToken = token;
        const respuesta = await fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
    } catch (error) {
        console.error('Error CAPTCHA:', error);
    }
}

// ... (código existente hasta la función actualizarIndicadorFortaleza)

    function actualizarIndicadorFortaleza(elemento, password) {
        if (!password) {
            elemento.innerHTML = '';
            elemento.className = 'password-strength mt-2';
            return;
        }

        const longitud = password.length;
        const tieneMinuscula = /[a-z]/.test(password);
        const tieneMayuscula = /[A-Z]/.test(password);
        const tieneNumero = /\d/.test(password);
        const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

        let fuerza = 0;
        let mensajes = [];

        if (longitud >= 12) fuerza += 2;
        else if (longitud >= 8) fuerza += 1;

        if (tieneMinuscula) fuerza += 1;
        if (tieneMayuscula) fuerza += 1;
        if (tieneNumero) fuerza += 1;
        if (tieneEspecial) fuerza += 1;

        let nivel = '';
        let clase = '';

        if (fuerza >= 6) {
            nivel = 'Muy fuerte';
            clase = 'strength-very-strong';
        } else if (fuerza >= 4) {
            nivel = 'Fuerte';
            clase = 'strength-strong';
        } else if (fuerza >= 2) {
            nivel = 'Moderada';
            clase = 'strength-moderate';
        } else {
            nivel = 'Débil';
            clase = 'strength-weak';
        }

        if (longitud < 12) mensajes.push(`${12 - longitud} caracteres más para el mínimo`);
        if (!tieneMinuscula) mensajes.push('Agrega minúsculas');
        if (!tieneMayuscula) mensajes.push('Agrega mayúsculas');
        if (!tieneNumero) mensajes.push('Agrega números');
        if (!tieneEspecial) mensajes.push('Agrega caracteres especiales');

        // ========== NUEVO: Chequear contra contraseñas comunes ==========
        elemento.innerHTML = `
            <div class="strength-bar ${clase}">
                <div class="strength-fill" style="width: ${Math.min(100, fuerza * 16.66)}%"></div>
            </div>
            <small class="d-block mt-1">Fortaleza: <strong>${nivel}</strong></small>
            <small class="d-block mt-1 text-warning" id="commonPasswordWarning" style="display: none;">
                ⚠️ Esta contraseña podría ser común
            </small>
            ${mensajes.length > 0 ? `<small class="d-block text-muted">Sugerencias: ${mensajes.join(', ')}</small>` : ''}
        `;
        elemento.className = `password-strength mt-2 ${clase}`;

        // Verificar si es contraseña común
        if (password.length >= 6) {
            checkCommonPassword(password, elemento);
        }
    }

    // ========== NUEVA FUNCIÓN: Verificar contraseña común ==========
    async function checkCommonPassword(password, elemento) {
        try {
            const respuesta = await fetch('/api/registro/check-common-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });

            const resultado = await respuesta.json();
            
            if (resultado.success && resultado.isCommon) {
                const warningElement = elemento.querySelector('#commonPasswordWarning');
                if (warningElement) {
                    warningElement.style.display = 'block';
                    warningElement.innerHTML = `⚠️ <strong>Advertencia de seguridad:</strong> Esta contraseña está en la lista de contraseñas comunes.`;
                    warningElement.classList.add('text-danger');
                    warningElement.classList.remove('text-warning');
                }
                
                // Agregar mensaje adicional
                const existingMessages = elemento.querySelectorAll('.text-muted');
                if (existingMessages.length > 0) {
                    const lastMessage = existingMessages[existingMessages.length - 1];
                    lastMessage.innerHTML += '<br>🚫 <strong>Se recomienda:</strong> Elegir una contraseña más única y compleja';
                    lastMessage.classList.add('text-danger');
                }
            }
        } catch (error) {
            console.error('Error verificando contraseña común:', error);
        }
    }

// ... (resto del código existente)

    // ========== NUEVA FUNCIÓN PARA EL BOTÓN DE CONTRASEÑAS COMUNES ==========
    async function mostrarContraseñasComunes() {
        try {
            const respuesta = await fetch('/api/registro/common-passwords');
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                const passwordsList = resultado.passwords.join(', ');
                alert(`📋 Lista de contraseñas comunes detectadas:\n\n${passwordsList}\n\nTotal: ${resultado.count} contraseñas\n\n⚠️ Evita usar estas contraseñas por seguridad.`);
            }
        } catch (error) {
            console.error('Error obteniendo contraseñas comunes:', error);
            alert('No se pudo cargar la lista de contraseñas comunes');
        }
    }

    // Agregar botón para ver contraseñas comunes
    function agregarBotonContraseñasComunes() {
        const formulario = document.getElementById('formRegistro');
        if (formulario) {
            const botonDiv = document.createElement('div');
            botonDiv.className = 'text-center mt-3';
            botonDiv.innerHTML = `
                <button type="button" class="btn btn-outline-info btn-sm" onclick="mostrarContraseñasComunes()">
                    <i class="fas fa-exclamation-triangle me-1"></i>Ver contraseñas comunes a evitar
                </button>
                <p class="small text-muted mt-1">Conoce qué contraseñas son vulnerables</p>
            `;
            formulario.appendChild(botonDiv);
        }
    }

// ... (al final del DOMContentLoaded, después de configurar eventos)

    function configurarEventos() {
        // ... (eventos existentes)

        window.mostrarContraseñasComunes = function () {
            mostrarContraseñasComunes();
        };

        // Agregar botón después de que se cargue el DOM
        setTimeout(agregarBotonContraseñasComunes, 1000);
    }

// ... (resto del código)

// ========== NUEVA FUNCIÓN GLOBAL ==========
window.mostrarContraseñasComunes = async function () {
    try {
        const respuesta = await fetch('/api/registro/common-passwords');
        const resultado = await respuesta.json();
        
        if (resultado.success) {
            // Crear modal para mostrar las contraseñas
            const modalHTML = `
                <div class="modal fade" id="modalContraseñasComunes" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-warning">
                                <h5 class="modal-title">⚠️ Contraseñas Comunes a Evitar</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p class="text-danger"><strong>Advertencia:</strong> Estas contraseñas son vulnerables y frecuentemente usadas en ataques.</p>
                                <div class="alert alert-info">
                                    <i class="fas fa-lightbulb me-2"></i>
                                    <strong>Consejo:</strong> No uses estas contraseñas ni variaciones de ellas.
                                </div>
                                <div class="common-passwords-list">
                                    ${resultado.passwords.map(pass => 
                                        `<span class="badge bg-danger me-1 mb-1">${pass}</span>`
                                    ).join('')}
                                </div>
                                <div class="mt-3">
                                    <p><strong>Total en lista:</strong> ${resultado.count} contraseñas</p>
                                    <p><strong>Fuente:</strong> Archivo password.txt del sistema</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="button" class="btn btn-primary" onclick="copiarListaContraseñas()">
                                    <i class="fas fa-copy me-1"></i>Copiar Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar modal al DOM si no existe
            if (!document.getElementById('modalContraseñasComunes')) {
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHTML;
                document.body.appendChild(modalContainer);
            }
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalContraseñasComunes'));
            modal.show();
        }
    } catch (error) {
        console.error('Error obteniendo contraseñas comunes:', error);
        alert('No se pudo cargar la lista de contraseñas comunes');
    }
};

window.copiarListaContraseñas = async function () {
    try {
        const respuesta = await fetch('/api/registro/common-passwords');
        const resultado = await respuesta.json();
        
        if (resultado.success) {
            const texto = `LISTA DE CONTRASEÑAS COMUNES A EVITAR:\n\n${resultado.passwords.join('\n')}\n\nTotal: ${resultado.count} contraseñas\n\n⚠️ No uses estas contraseñas por seguridad.`;
            
            await navigator.clipboard.writeText(texto);
            alert('Lista copiada al portapapeles');
        }
    } catch (error) {
        alert('Error al copiar la lista');
    }
};

window.generarContraseñaSegura = async function () {
    try {
        const respuesta = await fetch('/api/registro/generate-password');
        const resultado = await respuesta.json();

        if (resultado.success) {
            return resultado.password;
        }
    } catch (error) {
        console.error('Error:', error);
    }
    return null;
};

window.validarFortalezaContraseña = async function (password) {
    try {
        const respuesta = await fetch('/api/registro/validate-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });

        return await respuesta.json();
    } catch (error) {
        console.error('Error:', error);
        return { isValid: false, error: 'Error de conexión' };
    }
};