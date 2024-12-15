import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Referencia a los datos de la base de datos
const sensorDataRef = ref(db, "sensorData");

// Escuchar cambios en la base de datos
onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data); // Aquí puedes llamar a tus funciones para mostrar los datos
    updateRealTimeDisplay(data); // Actualiza el monitoreo en tiempo real
    // Si tienes un historial en la misma estructura de datos, puedes llamarlo aquí
    // Si el historial está en otra referencia, necesitarás obtenerlo de manera diferente
});

// Función para actualizar la interfaz de usuario con datos de monitoreo en tiempo real
function updateRealTimeDisplay(data) {
    document.querySelector('.movimiento .badge').textContent = data.movimiento ? 'Movimiento detectado' : 'Sin movimiento';
    document.querySelector('.incendio .badge').textContent = data.temperatura > 30 ? 'Alto' : 'Normal'; // Ejemplo de lógica
    document.querySelector('.lluvia .badge').textContent = data.lluvia ? 'Lluvia detectada' : 'Sin lluvia';
    document.querySelector('.rfid .badge').textContent = data.rfidAcceso ? 'Acceso permitido' : 'Acceso denegado';
}

// Si el historial está en otra parte de la base de datos, puedes crear otra referencia
const historyRef = ref(db, "eventHistory"); // Cambia "eventHistory" por la ruta correcta

// Escuchar cambios en el historial de eventos
onValue(historyRef, (snapshot) => {
    const events = snapshot.val();
    updateHistoryDisplay(events); // Actualiza el historial de eventos
});

// Función para actualizar la interfaz de usuario con el historial de eventos
function updateHistoryDisplay(events) {
    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = ''; // Limpiar la lista existente

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.innerHTML = `
            <div>
                <h3>${event.tipo}</h3>
                <p>${event.descripcion}</p>
            </div>
            <span>${event.fecha}</span>
        `;
        eventList.appendChild(eventElement);
    });
}