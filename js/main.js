
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
});

document.querySelector('.tab-button[data-tab="camera"]').addEventListener('click', () => {
    document.querySelector('#camera').classList.add('active');
});

const activarLuzSwitch = document.querySelector('#luz-toggle');

activarLuzSwitch.addEventListener('change', (e) => {
    const estado = e.target.checked ? 'on' : 'off';
    fetch(`http://192.168.26.97/ledMotion?state=${estado}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error al enviar la solicitud: ${response.status}`);
            }
            console.log(`Luz ${estado === 'on' ? 'encendida' : 'apagada'}`);
        })
        .catch((error) => {
            setTimeout(() => {
                console.error(error);
                console.log('Error al enviar la solicitud');
            }, 2000);
        });
});

const activarBocinaSwitch = document.querySelector('#activar-bocina-switch');
activarBocinaSwitch.addEventListener('change', (e) => {
    const estado = e.target.checked ? 'on' : 'off';
    fetch(`http://192.168.26.97/buzzer?state=${estado}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error al enviar la solicitud: ${response.status}`);
            }
            console.log(`Bocina ${estado === 'on' ? 'activada' : 'desactivada'}`);
        })
        .catch((error) => {
            setTimeout(() => {
                console.error(error);
                console.log('Error al enviar la solicitud');
            }, 2000);
        });
});

const activarPuertaSwitch = document.querySelector('#puerta-toggle');

activarPuertaSwitch.addEventListener('change', (e) => {
    const estado = e.target.checked ? 90 : 0; 
    fetch(`http://192.168.26.97/servo?position=${estado}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error al enviar la solicitud: ${response.status}`);
            }
            console.log(`Puerta ${estado === 120 ? 'abierta' : 'cerrada'}`);
        })
        .catch((error) => {
            setTimeout(() => {
                console.error(error);
                console.log('Error al enviar la solicitud');
            }, 2000);
        });
});