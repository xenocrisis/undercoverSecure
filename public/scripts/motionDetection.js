export function startMotionDetectionInZone(video, canvas, statusElement, zone, onMotionCallback) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let lastImageData = null;

  function checkMotion() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(zone.x, zone.y, zone.width, zone.height);

    if (lastImageData) {
      let diff = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        diff += Math.abs(imageData.data[i] - lastImageData.data[i]);
        diff += Math.abs(imageData.data[i + 1] - lastImageData.data[i + 1]);
        diff += Math.abs(imageData.data[i + 2] - lastImageData.data[i + 2]);
      }

      const avgDiff = diff / (imageData.data.length / 4);

      if (avgDiff > 22) {
        statusElement.textContent = "Estado: Movimiento Detectado";
        if (onMotionCallback) onMotionCallback();  // Siempre se llama
      } else {
        statusElement.textContent = "Estado: Sin movimiento";
      }
    }

    lastImageData = imageData;
  }

  setInterval(checkMotion, 90);
}
