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
        setupPasswordToggle();
        setupLoginPasswordToggle();
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

    // ========== FUNCIÓN PARA VERIFICAR CONTRASEÑA COMÚN ==========
    async function validarContraseñaComun(password) {
        try {
            const respuesta = await fetch('/api/registro/check-common-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });

            const resultado = await respuesta.json();

            if (resultado.success && resultado.isCommon) {
                return {
                    esComun: true,
                    mensaje: resultado.message,
                    recomendaciones: resultado.recommendations || []
                };
            }

            return {
                esComun: false,
                mensaje: 'Contraseña segura',
                recomendaciones: resultado.recommendations || []
            };
        } catch (error) {
            console.error('Error verificando contraseña común:', error);
            return {
                esComun: false,
                mensaje: 'No se pudo verificar',
                recomendaciones: []
            };
        }
    }

    // ========== FUNCIÓN PARA VALIDAR CONTRASEÑA COMÚN EN TIEMPO REAL ==========
    async function checkCommonPassword(password, elemento) {
        if (password.length < 6) return;

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
                    warningElement.innerHTML = `
                        ⚠️ <strong class="text-danger">¡CONTRASEÑA NO SEGURA!</strong><br>
                        ${resultado.message}<br>
                        <small class="text-muted">Recomendaciones: ${resultado.recommendations ? resultado.recommendations.join(' • ') : 'Elige una contraseña más única'}</small>
                    `;
                    warningElement.classList.add('text-danger', 'fw-bold');
                    warningElement.classList.remove('text-warning');
                }

                const claveRegistro = document.getElementById('claveRegistro');
                if (claveRegistro) {
                    claveRegistro.classList.add('is-invalid');
                    claveRegistro.classList.add('is-invalid-common');

                    let errorDiv = claveRegistro.parentNode.querySelector('.common-password-error');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback common-password-error';
                        claveRegistro.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = '❌ Esta contraseña está en la lista de contraseñas comunes y no es segura';
                    errorDiv.style.display = 'block';
                }
            } else {
                const warningElement = elemento.querySelector('#commonPasswordWarning');
                if (warningElement) {
                    warningElement.style.display = 'none';
                }

                const claveRegistro = document.getElementById('claveRegistro');
                if (claveRegistro && !claveRegistro.classList.contains('is-invalid-other')) {
                    if (!claveRegistro.classList.contains('is-invalid')) {
                        claveRegistro.classList.remove('is-invalid');
                    }
                    claveRegistro.classList.remove('is-invalid-common');

                    const errorDiv = claveRegistro.parentNode.querySelector('.common-password-error');
                    if (errorDiv) {
                        errorDiv.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error('Error verificando contraseña común:', error);
        }
    }

    // ========== CONFIGURAR VALIDACIONES ==========
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
            // ===== CORREGIDO: Buscar el contenedor correcto =====
            const inputGroup = claveRegistro.closest('.input-group');
            const contenedorPassword = inputGroup ? inputGroup.parentNode : claveRegistro.parentNode;
            
            // Insertar el indicador de fortaleza DESPUÉS del input-group
            if (inputGroup) {
                inputGroup.insertAdjacentElement('afterend', indicadorFortaleza);
            } else {
                contenedorPassword.appendChild(indicadorFortaleza);
            }
            
            claveRegistro.addEventListener('input', async function () {
                const password = this.value;

                actualizarIndicadorFortaleza(indicadorFortaleza, password);

                if (confirmarClave.value && password !== confirmarClave.value) {
                    confirmarClave.classList.add('is-invalid');
                } else if (confirmarClave.value) {
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
                            this.classList.add('is-invalid-other');
                        } else {
                            this.setCustomValidity('');
                            if (!this.classList.contains('is-invalid-common')) {
                                this.classList.remove('is-invalid');
                            }
                            this.classList.remove('is-invalid-other');
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

            // ===== BOTÓN GENERAR CONTRASEÑA - CORREGIDO =====
            // Crear contenedor para el botón
            const botonContainer = document.createElement('div');
            botonContainer.className = 'mt-3';
            
            const generarBtn = document.createElement('button');
            generarBtn.type = 'button';
            generarBtn.className = 'btn btn-outline-secondary w-100';
            generarBtn.style.border = '2px solid #e9ecef';
            generarBtn.style.padding = '10px 15px';
            generarBtn.style.fontWeight = '500';
            generarBtn.innerHTML = '<i class="fas fa-key me-2"></i>Generar contraseña segura';
            
            generarBtn.addEventListener('click', async function () {
                try {
                    // Cambiar estado del botón
                    const originalHTML = this.innerHTML;
                    this.disabled = true;
                    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
                    
                    const respuesta = await fetch('/api/registro/generate-password');
                    const resultado = await respuesta.json();

                    if (resultado.success) {
                        claveRegistro.value = resultado.password;
                        confirmarClave.value = resultado.password;
                        
                        // Disparar eventos para activar validaciones
                        claveRegistro.dispatchEvent(new Event('input'));
                        confirmarClave.dispatchEvent(new Event('input'));
                        
                        alert('✅ Contraseña segura generada. Cópiala y guárdala en un lugar seguro.\n\nEsta contraseña NO está en la lista de contraseñas comunes.');
                    }
                    
                    // Restaurar botón
                    this.disabled = false;
                    this.innerHTML = originalHTML;
                } catch (error) {
                    console.error('Error al generar contraseña:', error);
                    alert('❌ Error al generar la contraseña');
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-key me-2"></i>Generar contraseña segura';
                }
            });
            
            botonContainer.appendChild(generarBtn);
            
            // ===== INSERTAR EL BOTÓN DESPUÉS DEL INDICADOR DE FORTALEZA =====
            if (indicadorFortaleza.parentNode) {
                indicadorFortaleza.insertAdjacentElement('afterend', botonContainer);
            } else {
                // Fallback: insertar después del input-group
                if (inputGroup && inputGroup.parentNode) {
                    inputGroup.insertAdjacentElement('afterend', botonContainer);
                } else {
                    contenedorPassword.appendChild(botonContainer);
                }
            }
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
            <div class="d-flex justify-content-between align-items-center mt-1">
                <small>Fortaleza: <strong class="${clase}">${nivel}</strong></small>
                <small class="text-muted">${password.length}/128</small>
            </div>
            <small id="commonPasswordWarning" class="d-block mt-1 text-warning" style="display: none;"></small>
            ${mensajes.length > 0 ? `<small class="d-block text-muted mt-1"><i class="fas fa-info-circle me-1"></i>Sugerencias: ${mensajes.join(', ')}</small>` : ''}
        `;
        elemento.className = `password-strength mt-2 ${clase}`;

        if (password.length >= 6) {
            checkCommonPassword(password, elemento);
        }
    }

    // ========== VALIDACIÓN DEL FORMULARIO DE REGISTRO ==========
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

    // ========== EVENT LISTENER DEL FORMULARIO DE REGISTRO ==========
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!validarFormularioRegistro()) return;

            const password = document.getElementById('claveRegistro').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                // Deshabilitar botón y mostrar carga
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando seguridad...';

                // VERIFICAR CONTRASEÑA COMÚN ANTES DE ENVIAR
                const verificacion = await validarContraseñaComun(password);

                if (verificacion.esComun) {
                    alert(`⚠️ CONTRASEÑA NO SEGURA\n\n${verificacion.mensaje}\n\nPor favor, elige una contraseña más fuerte y única.\n\nRecomendaciones:\n• ${verificacion.recomendaciones.join('\n• ')}`);

                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;

                    const claveRegistro = document.getElementById('claveRegistro');
                    claveRegistro.classList.add('is-invalid');
                    claveRegistro.classList.add('is-invalid-common');

                    let errorDiv = claveRegistro.parentNode.querySelector('.common-password-error');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback common-password-error';
                        claveRegistro.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = '❌ Esta contraseña está en la lista de contraseñas comunes';
                    errorDiv.style.display = 'block';

                    return;
                }

                // Si la contraseña es segura, continuar con el registro
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

                const datos = {
                    nombre: document.getElementById('nombre').value.trim(),
                    apellido: document.getElementById('apellido').value.trim(),
                    correo: document.getElementById('correoRegistro').value.trim(),
                    clave: password,
                    fechaRegistro: new Date().toISOString()
                };

                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    await loginUsuario({
                        nombre: datos.nombre,
                        apellido: datos.apellido,
                        correo: datos.correo
                    });

                    alert('✅ ¡Registro exitoso! Bienvenido ' + datos.nombre);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarse'));
                    modal.hide();
                    formRegistro.reset();

                    document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                        el.classList.remove('is-valid', 'is-invalid', 'is-invalid-common', 'is-invalid-other');
                    });

                    const errors = document.querySelectorAll('.invalid-feedback');
                    errors.forEach(error => error.style.display = 'none');

                } else {
                    // Si el servidor rechazó por contraseña común
                    if (resultado.error && resultado.error.includes('común')) {
                        alert('❌ ' + resultado.error);

                        const claveRegistro = document.getElementById('claveRegistro');
                        claveRegistro.classList.add('is-invalid');
                        claveRegistro.classList.add('is-invalid-common');

                        let errorDiv = claveRegistro.parentNode.querySelector('.common-password-error');
                        if (!errorDiv) {
                            errorDiv = document.createElement('div');
                            errorDiv.className = 'invalid-feedback common-password-error';
                            claveRegistro.parentNode.appendChild(errorDiv);
                        }
                        errorDiv.textContent = '❌ ' + resultado.error;
                        errorDiv.style.display = 'block';
                    } else {
                        alert('Error: ' + (resultado.error || 'No se pudo registrar'));
                    }
                }

            } catch (error) {
                console.error('Error completo:', error);
                alert('Error al conectar con el servidor: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ========== AUTENTICACIÓN ==========
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

                    alert('✅ ¡Inicio de sesión exitoso!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalIniciarSesion'));
                    modal.hide();
                    formularioInicio.reset();
                } else {
                    alert(`❌ Error: ${resultado.error}${resultado.intentosRestantes ? `\nIntentos restantes: ${resultado.intentosRestantes}` : ''}`);
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

        window.mostrarContraseñasComunes = function () {
            mostrarContraseñasComunes();
        };

        setTimeout(agregarBotonContraseñasComunes, 1000);
    }
});

// ========== FUNCIONES GLOBALES ==========

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

// ========== FUNCIÓN PARA MOSTRAR CONTRASEÑAS COMUNES ==========
window.mostrarContraseñasComunes = async function () {
    try {
        const respuesta = await fetch('/api/registro/common-passwords');
        const resultado = await respuesta.json();

        if (resultado.success) {
            if (!document.getElementById('modalContraseñasComunes')) {
                const modalHTML = `
                    <div class="modal fade" id="modalContraseñasComunes" tabindex="-1">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header bg-warning">
                                    <h5 class="modal-title">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        ⚠️ Contraseñas Comunes a Evitar
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="alert alert-danger">
                                        <i class="fas fa-shield-alt me-2"></i>
                                        <strong>¡NO USES ESTAS CONTRASEÑAS!</strong>
                                        <p class="mb-0 mt-1 small">Estas contraseñas son las más vulnerables y frecuentemente usadas en ataques cibernéticos.</p>
                                    </div>
                                    <div class="alert alert-info">
                                        <i class="fas fa-lightbulb me-2"></i>
                                        <strong>Consejo de seguridad:</strong> 
                                        Nunca uses estas contraseñas ni variaciones de ellas. Elige una combinación única de al menos 12 caracteres con mayúsculas, minúsculas, números y símbolos.
                                    </div>
                                    <div class="common-passwords-list">
                                        ${resultado.passwords.map(pass => 
                                            `<span class="badge bg-danger me-1 mb-1 p-2">${pass}</span>`
                                        ).join('')}
                                    </div>
                                    <div class="mt-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Total en lista:</strong> 
                                            <span class="badge bg-primary">${resultado.count} contraseñas</span>
                                        </div>
                                        <div>
                                            <strong>Fuente:</strong> 
                                            <span class="badge bg-secondary">password.txt</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                        <i class="fas fa-times me-1"></i>Cerrar
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="copiarListaContraseñas()">
                                        <i class="fas fa-copy me-1"></i>Copiar Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHTML;
                document.body.appendChild(modalContainer);
            }

            const modal = new bootstrap.Modal(document.getElementById('modalContraseñasComunes'));
            modal.show();
        }
    } catch (error) {
        console.error('Error obteniendo contraseñas comunes:', error);
        alert('No se pudo cargar la lista de contraseñas comunes');
    }
};

// ========== FUNCIÓN PARA COPIAR LISTA DE CONTRASEÑAS ==========
window.copiarListaContraseñas = async function () {
    try {
        const respuesta = await fetch('/api/registro/common-passwords');
        const resultado = await respuesta.json();

        if (resultado.success) {
            const texto = `LISTA DE CONTRASEÑAS COMUNES A EVITAR\n${'='.repeat(50)}\n\n` +
                          `${resultado.passwords.join('\n')}\n\n${'='.repeat(50)}\n` +
                          `Total: ${resultado.count} contraseñas\n\n` +
                          `⚠️ ADVERTENCIA: No uses NINGUNA de estas contraseñas ni variaciones de ellas.\n` +
                          `Tu seguridad es lo más importante.`;

            await navigator.clipboard.writeText(texto);
            alert('✅ Lista copiada al portapapeles');
        }
    } catch (error) {
        console.error('Error al copiar:', error);
        alert('Error al copiar la lista');
    }
};

// ========== FUNCIÓN PARA AGREGAR BOTÓN DE CONTRASEÑAS COMUNES ==========
function agregarBotonContraseñasComunes() {
    const formulario = document.getElementById('formRegistro');
    if (formulario) {
        if (!document.querySelector('.btn-contraseñas-comunes')) {
            const botonDiv = document.createElement('div');
            botonDiv.className = 'text-center mt-3 btn-contraseñas-comunes';
            botonDiv.innerHTML = `
                <button type="button" class="btn btn-outline-warning btn-sm" onclick="mostrarContraseñasComunes()">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Ver contraseñas comunes a evitar
                </button>
                <p class="small text-muted mt-2 mb-0">
                    <i class="fas fa-info-circle me-1"></i>
                    El sistema rechazará automáticamente cualquier contraseña de esta lista
                </p>
            `;
            formulario.appendChild(botonDiv);
        }
    }
}

// ========== FUNCIÓN PARA TOGGLE DE CONTRASEÑA ==========
function setupPasswordToggle() {
    const toggleClave = document.getElementById('toggleClaveRegistro');
    const claveInput = document.getElementById('claveRegistro');
    
    if (toggleClave && claveInput) {
        toggleClave.addEventListener('click', function() {
            const type = claveInput.getAttribute('type') === 'password' ? 'text' : 'password';
            claveInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    const toggleConfirmar = document.getElementById('toggleConfirmarClave');
    const confirmarInput = document.getElementById('confirmarClave');
    
    if (toggleConfirmar && confirmarInput) {
        toggleConfirmar.addEventListener('click', function() {
            const type = confirmarInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmarInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

function setupLoginPasswordToggle() {
    const toggleLogin = document.getElementById('toggleClaveUsuario');
    const loginInput = document.getElementById('claveUsuario');
    
    if (toggleLogin && loginInput) {
        toggleLogin.addEventListener('click', function() {
            const type = loginInput.getAttribute('type') === 'password' ? 'text' : 'password';
            loginInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

// ========== FUNCIÓN PARA GENERAR CONTRASEÑA SEGURA ==========
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

// ========== FUNCIÓN PARA VALIDAR FORTALEZA DE CONTRASEÑA ==========
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