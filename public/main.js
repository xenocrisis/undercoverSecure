import { startCamera, stopCamera, cameraOn, setMotionStatus, setStatusElement } from './scripts/cameraControl.js';
import { ZoneSelector } from './scripts/zoneSelector.js';
import { startMotionDetectionInZone } from './scripts/motionDetection.js';
import { selectFolder, saveImageToFolder, captureImage } from './scripts/imageSaver.js';

const btnActivate = document.getElementById('btnActivate');
const btnSelectZone = document.getElementById('btnSelectZone');
const btnSelectFolder = document.getElementById('btnSelectFolder');
const video = document.getElementById('video');
const placeholder = document.getElementById('placeholder');
const motionStatus = document.getElementById('motionStatus');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('canvas');

setStatusElement(motionStatus); // <-- Aquí asignas el elemento una sola vez

const zoneSelector = new ZoneSelector(overlay, video, canvas, motionStatus, onZoneSelected);

btnActivate.addEventListener('click', async () => {
  if (!cameraOn) {
    await startCamera(video, placeholder, btnActivate);
  } else {
    stopCamera(video, placeholder, btnActivate, () => zoneSelector.cancelarSeleccionZona());
  }
});

btnSelectZone.addEventListener('click', () => {
  if (!cameraOn) {
    alert('Primero activa la cámara');
    return;
  }
  zoneSelector.iniciarSeleccionZona();
});

btnSelectFolder.addEventListener('click', () => {
  selectFolder();
});

let motionInterval = null;
let lastSaveTime = 0;

function onZoneSelected(video, canvas, statusElement, zone) {
  if (motionInterval) clearInterval(motionInterval);

  motionInterval = startMotionDetectionInZone(video, canvas, statusElement, zone, onMotionDetectedSaveImage);
}

function getFormattedTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}.png`;
}

async function onMotionDetectedSaveImage() {
  const now = Date.now();
  if (now - lastSaveTime < 200) return;
  lastSaveTime = now;

  setMotionStatus('Movimiento detectado.');
  const blob = await captureImage(video);
  const filename = getFormattedTimestamp();
  await saveImageToFolder(blob, filename);
  setMotionStatus('Imagen guardada.');
}

// Stealth toggle
const disableStealth = document.getElementById('disableStealth');
const container = document.querySelector('.container');
const fakeWeb = document.getElementById('fakeWeb');
const btnStealth = document.getElementById('btnStealth');

function toggleStealth() {
  const stealthActive = container.classList.contains('stealth-hidden');

  if (stealthActive) {
    const storedPin = localStorage.getItem('pin');

    if (storedPin) {
      const enteredPin = prompt("Introduce el PIN para salir del modo Stealth:");
      if (enteredPin !== storedPin) {
        //alert("PIN incorrecto. No se puede desactivar Stealth.");

        // Captura y guarda imagen de quien intentó fallidamente
        captureImage(video).then(async (blob) => {
          const filename = `failed_pin_${getFormattedTimestamp()}`;
          await saveImageToFolder(blob, filename);
        });

        return;
      }
    } else {
      const newPin = prompt("Crea un PIN para proteger el modo Stealth:");
      if (!newPin) {
        alert("Debes establecer un PIN.");
        return;
      }
      localStorage.setItem('pin', newPin);
      alert("PIN guardado. Usa este PIN para salir de Stealth en el futuro.");
    }

    container.classList.remove('stealth-hidden');
    fakeWeb.style.display = 'none';
    btnStealth.textContent = 'Activar Stealth';
    document.title = "UnderCover Sec 100 🚷";

  } else {
    container.classList.add('stealth-hidden');
    fakeWeb.style.display = 'block';
    btnStealth.textContent = 'Desactivar Stealth';
    document.title = "BonoboType | A minimalistic, customizable suspicious typing test";
  }
}

disableStealth.addEventListener('click', toggleStealth);
btnStealth.addEventListener('click', toggleStealth);