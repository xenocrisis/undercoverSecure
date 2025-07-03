// cameraControl.js
export let stream = null;
export let cameraOn = false;
let statusElement = null;  // variable privada dentro del módulo

export function setStatusElement(el) {
  statusElement = el;
}

export function setMotionStatus(text) {
  if (statusElement) {
    statusElement.textContent = `Estado: ${text}`;
  }
}

export async function startCamera(video, placeholder, btnActivate) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.classList.remove('hidden');
    placeholder.style.display = 'none';
    cameraOn = true;
    setMotionStatus('Cámara activada');
    btnActivate.textContent = 'Desactivar Cámara';
  } catch (err) {
    alert('No se pudo activar la cámara: ' + err.message);
    setMotionStatus(`Error: ${err.message}`);
  }
}

export function stopCamera(video, placeholder, btnActivate, cancelarSeleccionZona) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
  video.classList.add('hidden');
  placeholder.style.display = 'block';
  cameraOn = false;
  setMotionStatus('Cámara desactivada');
  btnActivate.textContent = 'Activar Cámara';
  cancelarSeleccionZona();
}
