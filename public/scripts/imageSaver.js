let dirHandle = null;

export async function selectFolder() {
  if (typeof window.showDirectoryPicker !== 'function') {
    alert('Tu navegador no soporta selección de carpetas. Se usará descarga automática.');
    return;
  }

  try {
    dirHandle = await window.showDirectoryPicker();

    // Solicita permisos de lectura y escritura persistentes
    const permission = await dirHandle.requestPermission({ mode: 'readwrite' });

    if (permission !== 'granted') {
      //alert('Se necesita permiso para guardar archivos en esta carpeta.');
      dirHandle = null;
      return;
    }

    alert('Carpeta seleccionada para guardar imágenes.');
  } catch (err) {
    console.error('Error seleccionando carpeta:', err);
  }
}

export async function saveImageToFolder(blob, filename = 'motion_capture.png') {
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  if (isFirefox || typeof window.showDirectoryPicker !== 'function') {
    // Firefox o navegadores sin showDirectoryPicker => descarga automática
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  if (!dirHandle) {
    alert('Primero selecciona la carpeta para guardar las imágenes.');
    return;
  }

  try {
    // Asegura que los permisos siguen vigentes antes de guardar
    const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      alert('Permiso denegado para escribir en la carpeta seleccionada.');
      return;
    }

    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (err) {
    console.error('Error guardando la imagen:', err);
    alert('No se pudo guardar la imagen: ' + err.message);
  }
}

export function captureImage(videoElement) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
  return new Promise(resolve => {
    tempCanvas.toBlob(blob => resolve(blob), 'image/png');
  });
}
