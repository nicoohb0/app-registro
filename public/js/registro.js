document.addEventListener('DOMContentLoaded', function() {
    // Manejar formulario de registro
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const datos = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                correo: document.getElementById('correoRegistro').value,
                clave: document.getElementById('claveRegistro').value
            };
            
            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });
                
                const resultado = await respuesta.json();
                
                if (respuesta.ok) {
                    alert('Registro exitoso!');
                    // Cerrar modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarse'));
                    modal.hide();
                    // Limpiar formulario
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
    
    // Manejar formulario de inicio de sesión
    const formularioInicio = document.getElementById('formularioInicio');
    if (formularioInicio) {
        formularioInicio.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Funcionalidad de inicio de sesión en desarrollo');
            // Aquí agregarías la lógica para autenticar
        });
    }
});