// Import the functions you need from the SDKs you need
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxYcd_f5S4n4f4d4KW396Pan_OyNt_mRE",
  authDomain: "smartcasitadb.firebaseapp.com",
  databaseURL: "https://smartcasitadb-default-rtdb.firebaseio.com",
  projectId: "smartcasitadb",
  storageBucket: "smartcasitadb.firebasestorage.app",
  messagingSenderId: "812279541313",
  appId: "1:812279541313:web:09515456d0401ef5c6a0c0",
  measurementId: "G-PTCK7L33HN"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const sensorDataRef = ref(database, "sensorData");

onValue(sensorDataRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
  updateRealTimeDisplay(data);
});

function updateRealTimeDisplay(data) {
  // Obtener las claves de los datos
  const keys = Object.keys(data);
  if (keys.length === 0) {
    console.log("No hay datos disponibles.");
    return; // Salir si no hay datos
  }

  // Obtener la última clave
  const lastEntryKey = keys[keys.length - 1]; // Obtener la última clave
  const lastEntry = data[lastEntryKey]; // Obtener el último conjunto de datos

  console.log("Última entrada de datos:", JSON.stringify(lastEntry, null, 2)); // Imprimir la última entrada

  // Actualiza el estado de movimiento
  const movimientoBadge = document.getElementById('movimiento-badge');
  if (movimientoBadge) {
    movimientoBadge.textContent = lastEntry.movimiento === 1 ? 'Movimiento detectado' : 'Sin movimiento';
  }

  // Actualiza el estado de temperatura
  const incendioBadge = document.getElementById('incendio-badge');
  if (incendioBadge) {
    incendioBadge.textContent = lastEntry['temperatura-ambiental'] > 30 ? 'Alto' : 'Normal'; // Ejemplo de lógica
  }

  // Actualiza el estado de lluvia
  const lluviaBadge = document.getElementById('lluvia-badge');
  if (lluviaBadge) {
    lluviaBadge.textContent = lastEntry.lluvia > 0 ? 'Lluvia detectada' : 'Sin lluvia';
  }

  // Actualiza el estado de RFID
  const rfidBadge = document.getElementById('rfid-badge');
  if (rfidBadge) {
    rfidBadge.textContent = lastEntry.puerta ? 'Acceso permitido' : 'Acceso denegado'; // Cambia 'puerta' por 'rfid' si es necesario
  }
}

// Función para actualizar la interfaz de usuario con el historial de eventos
function updateHistoryDisplay(events) {
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = ''; // Limpiar la lista existente

  // Iterar sobre las lecturas de sensores y agregarlas a la lista
  for (const key in events) {
    if (events.hasOwnProperty(key)) {
      const event = events[key];
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');

      // Crear un mensaje basado en los datos del evento
      let message = `Timestamp: ${event.timestamp}<br>`;
      message += event.puerta ? 'Acceso permitido a la puerta.<br>' : 'Acceso denegado a la puerta.<br>';
      message += event.lluvia > 0 ? 'Lluvia detectada.<br>' : 'Sin lluvia.<br>';
      message += event.luz ? 'La luz está encendida.<br>' : 'La luz está apagada.<br>';

      eventElement.innerHTML = `
              <div>
                  <h3>Evento</h3>
                  <p>${message}</p>
              </div>
          `;
      eventList.appendChild(eventElement);
    }
  }
}

// Escuchar cambios en el historial de eventos
onValue(historyRef, (snapshot) => {
  const events = snapshot.val();
  console.log("Historial de eventos:", JSON.stringify(events, null, 2)); // Imprimir el historial
  updateHistoryDisplay(events); // Actualiza el historial de eventos
});

document.addEventListener('DOMContentLoaded', () => {
});