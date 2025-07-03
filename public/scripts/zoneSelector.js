// zoneSelector.js
export class ZoneSelector {
  constructor(overlay, video, canvas, statusElement, startMotionDetectionCallback) {
    this.overlay = overlay;
    this.video = video;
    this.canvas = canvas;
    this.statusElement = statusElement;
    this.startMotionDetectionCallback = startMotionDetectionCallback;

    this.isSelecting = false;
    this.highlight = null;
    this.startX = 0;
    this.startY = 0;
    this.selectedZone = null;

    this.overlay.style.pointerEvents = 'none';
    this.overlay.style.cursor = 'default';

    this.overlay.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.overlay.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  setMotionStatus(text) {
    this.statusElement.textContent = `Estado: ${text}`;
  }

  iniciarSeleccionZona() {
    if (this.isSelecting) {
      this.cancelarSeleccionZona();
      return;
    }

    this.isSelecting = true;
    this.overlay.style.pointerEvents = "auto";
    this.overlay.style.cursor = "crosshair";

    if (this.highlight) {
      this.overlay.removeChild(this.highlight);
      this.highlight = null;
    }

    this.highlight = document.createElement("div");
    Object.assign(this.highlight.style, {
      position: "absolute",
      border: "2px dashed #22c55e",
      backgroundColor: "rgba(34,197,94,0.3)",
      pointerEvents: "none"
    });
    this.overlay.appendChild(this.highlight);
  }

  cancelarSeleccionZona() {
    this.isSelecting = false;
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.cursor = "default";

    if (this.highlight) {
      this.overlay.removeChild(this.highlight);
      this.highlight = null;
    }

    this.selectedZone = null;
    this.setMotionStatus('Zona no delimitada');
  }

  onMouseDown(e) {
    if (!this.isSelecting) return;

    const rect = this.overlay.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    Object.assign(this.highlight.style, {
      left: `${this.startX}px`,
      top: `${this.startY}px`,
      width: "0px",
      height: "0px",
    });

    this.overlay.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove(e) {
    const rect = this.overlay.getBoundingClientRect();
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;

    const x = Math.min(currentX, this.startX);
    const y = Math.min(currentY, this.startY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    Object.assign(this.highlight.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  onMouseUp() {
    if (!this.isSelecting) return;

    this.overlay.removeEventListener("mousemove", this.onMouseMove.bind(this));
    this.isSelecting = false;
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.cursor = "default";

    const rect = this.highlight.getBoundingClientRect();
    const overlayRect = this.overlay.getBoundingClientRect();

    const x = rect.left - overlayRect.left;
    const y = rect.top - overlayRect.top;
    const width = rect.width;
    const height = rect.height;

    // Escalamos según tamaño real del video
    const scaleX = this.video.videoWidth / this.overlay.clientWidth;
    const scaleY = this.video.videoHeight / this.overlay.clientHeight;

    this.selectedZone = {
      x: x * scaleX,
      y: y * scaleY,
      width: width * scaleX,
      height: height * scaleY,
    };

    console.log("Zona seleccionada (real):", this.selectedZone);
    this.startMotionDetectionCallback(this.video, this.canvas, this.statusElement, this.selectedZone);
  }
}
