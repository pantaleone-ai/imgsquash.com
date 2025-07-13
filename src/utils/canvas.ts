// Canvas utility functions
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function applyWatermark(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const watermarkText = 'imgsquash.com';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = 'rgba(128, 128, 128, 0.25)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rotate the canvas
  const angle = -45 * Math.PI / 180;

  // Repeat the watermark multiple times
  for (let x = -canvas.width; x < canvas.width * 2; x += 300) {
    for (let y = -canvas.height; y < canvas.height * 2; y += 150) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
    }
  }
}