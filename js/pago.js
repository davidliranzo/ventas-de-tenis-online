cargarEventListeners();
// Crear la base de datos IndexedDB
let db;

const request = indexedDB.open('miTienda', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains('datosFormulario')) {
        db.createObjectStore('datosFormulario', { keyPath: 'id', autoIncrement: true });
    }

    if (!db.objectStoreNames.contains('datosCarrito')) {
        db.createObjectStore('datosCarrito', { keyPath: 'id', autoIncrement: true });
    }
};

function transferirLocalStorageAIndexedDB() {
    // Obtener datos del carrito desde localStorage
    let carritoDesdeLocalStorage = JSON.parse(localStorage.getItem('carrito'));

    if (carritoDesdeLocalStorage && carritoDesdeLocalStorage.length > 0) {
        const transaction = db.transaction(['datosCarrito'], 'readwrite');
        const store = transaction.objectStore('datosCarrito');

        carritoDesdeLocalStorage.forEach(item => {
            store.add(item);
        });

        transaction.oncomplete = function() {
            console.log('Datos transferidos de localStorage a IndexedDB.');
            // Limpiar localStorage si es necesario
            localStorage.removeItem('carrito');
        };

        transaction.onerror = function(event) {
            console.error('Error al transferir datos a IndexedDB:', event.target.errorCode);
        };
    } else {
        console.log('No hay datos en localStorage para transferir.');
    }
}
request.onsuccess = function(event) {
    db = event.target.result;
    transferirLocalStorageAIndexedDB();
};

request.onerror = function(event) {
    console.error('Error al abrir la base de datos:', event.target.errorCode);
};

    // Variables globales
    const carrito = document.querySelector('#carrito');
    const contenedorCarrito = document.querySelector('#lista-carrito tbody');
    let articulosCarrito = [];

    // Cargar eventos
    function cargarEventListeners() {
        // Muestra los cursos del local storage
        document.addEventListener('DOMContentLoaded', () => {
            articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carritoHTML();
        });


         // Función para guardar datos del carrito en IndexedDB
    function guardarDatosCarrito() {
        const transaction = db.transaction(['datosCarrito'], 'readwrite');
        const store = transaction.objectStore('datosCarrito');

        articulosCarrito.forEach(curso => {
            store.add(curso);
        });

        transaction.oncomplete = function() {
            console.log('Datos del carrito guardados en IndexedDB.');
        };

        transaction.onerror = function(event) {
            console.error('Error al guardar datos del carrito:', event.target.errorCode);
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];

        carritoHTML();
    })

    // Función para mostrar el carrito en el HTML
    function carritoHTML() {
        limpiarHTML();

        articulosCarrito.forEach(curso => {
            const { imagen, titulo, precio, cantidad } = curso;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td> <img src="${imagen}" width="100"> </td>
                <td> ${titulo} </td>
                <td> ${precio} </td>
                <td> ${cantidad} </td>
            `;
            contenedorCarrito.appendChild(row);

            
        });
        
        sincronizarStorage();
        
    }
   

    // Función para sincronizar el carrito con LocalStorage
    function sincronizarStorage() {
        localStorage.setItem('carrito', JSON.stringify(articulosCarrito));
    }

    // Función para limpiar HTML del carrito
    function limpiarHTML() {
        while (contenedorCarrito.firstChild) {
            contenedorCarrito.removeChild(contenedorCarrito.firstChild);
        }
    }

    function transferirLocalStorageAIndexedDB() {
        // Obtener datos del carrito desde localStorage
        let carritoDesdeLocalStorage = JSON.parse(localStorage.getItem('carrito'));

        if (carritoDesdeLocalStorage && carritoDesdeLocalStorage.length > 0) {
            const transaction = db.transaction(['datosCarrito'], 'readwrite');
            const store = transaction.objectStore('datosCarrito');

            carritoDesdeLocalStorage.forEach(item => {
                store.add(item);
            });

            transaction.oncomplete = function() {
                console.log('Datos transferidos de localStorage a IndexedDB.');
                // Limpiar localStorage si es necesario
                localStorage.removeItem('carrito');
            };

            transaction.onerror = function(event) {
                console.error('Error al transferir datos a IndexedDB:', event.target.errorCode);
            };
        } else {
            console.log('No hay datos en localStorage para transferir.');
        }
    }


        // Manejo del envío del formulario
        document.getElementById('formulario-cliente').addEventListener('submit', function(event) {
            event.preventDefault(); // Evita el envío del formulario por defecto

            // Obtener valores de los campos
            const nombre = document.getElementById('nombre').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const tarjeta = document.getElementById('tarjeta').value.trim();
            const fechaMes = document.getElementById('fecha-mes').value;
            const fechaAnio = document.getElementById('fecha-anio').value;
            const cvc = document.getElementById('cvc').value.trim();

            // Validaciones
            let isValid = true;
            let errorMessage = '';

            if (nombre.length < 3) {
                errorMessage += 'El nombre debe tener al menos 3 caracteres.\n';
                isValid = false;
            }

            if (direccion.length < 5) {
                errorMessage += 'La dirección debe tener al menos 5 caracteres.\n';
                isValid = false;
            }

            if (!/^\d{10}$/.test(telefono)) {
                errorMessage += 'El teléfono debe tener exactamente 10 dígitos.\n';
                isValid = false;
            }

            if (!/^\d{16}$/.test(tarjeta)) {
                errorMessage += 'El número de tarjeta debe tener exactamente 16 dígitos.\n';
                isValid = false;
            }

            if (!fechaMes || !fechaAnio) {
                errorMessage += 'Seleccione una fecha de expiración válida.\n';
                isValid = false;
            }

            if (!/^\d{3,4}$/.test(cvc)) {
                errorMessage += 'El CVC debe tener exactamente 3 o 4 dígitos.\n';
                isValid = false;
            }

            if (isValid) {
                guardarDatosFormulario(nombre, direccion, telefono, tarjeta, fechaMes, fechaAnio, cvc);
                guardarDatosCarrito();
                localStorage.clear();
                alert('Su compra fue completada exitosamente.');
                this.submit();
                window.location.href = 'index.html'; // Redirige a una nueva página
            } else {
                alert(errorMessage);
            }
        });
    }

    // Función para mostrar el carrito desde IndexedDB
    function mostrarCarrito() {
        const transaction = db.transaction(['datosCarrito'], 'readonly');
        const store = transaction.objectStore('datosCarrito');
        const request = store.getAll();

        request.onsuccess = function(event) {
            articulosCarrito = event.target.result;
            carritoHTML();
        };

        request.onerror = function(event) {
            console.error('Error al recuperar datos del carrito:', event.target.errorCode);
        };
    }

    // Función para guardar datos del formulario en IndexedDB
    function guardarDatosFormulario(nombre, direccion, telefono, tarjeta, fechaMes, fechaAnio, cvc) {
        const datosFormulario = {
            nombre,
            direccion,
            telefono,
            tarjeta,
            fecha: `${fechaMes}/${fechaAnio}`,
            cvc,
        };

        const transaction = db.transaction(['datosFormulario'], 'readwrite');
        const store = transaction.objectStore('datosFormulario');
        store.add(datosFormulario);

        transaction.oncomplete = function() {
            console.log('Datos del formulario guardados en IndexedDB.');
        };

        transaction.onerror = function(event) {
            console.error('Error al guardar datos del formulario:', event.target.errorCode);
        };
    }

   

