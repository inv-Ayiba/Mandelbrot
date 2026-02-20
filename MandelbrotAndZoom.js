function generateMandelbrotData(width, height, view) {
  const { minRe, maxRe, minIm, maxIm, maxIterations = 200 } = view;

  const iters = new Uint16Array(width * height);
  const escapeRadiusSquared = 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cr = minRe + (x / width) * (maxRe - minRe);
      const ci = maxIm - (y / height) * (maxIm - minIm);

      let a = 0, b = 0;
      let n = 0;

      while (n < maxIterations) {
        const aNew = a * a - b * b + cr;
        const bNew = 2 * a * b + ci;
        a = aNew;
        b = bNew;

        if (a * a + b * b > escapeRadiusSquared) break;
        n++;
      }

      iters[y * width + x] = n;
    }
  }

  return { iters, width, height, maxIterations };
}

function plotMandelbrotData(ctx, data) {
  const { iters, width, height, maxIterations } = data;
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < iters.length; i++) {
    const n = iters[i];
    const shade = n === maxIterations ? 0 : (n / maxIterations) * 255;

    const p = i * 4;
    imageData.data[p + 0] = shade;
    imageData.data[p + 1] = shade;
    imageData.data[p + 2] = shade;
    imageData.data[p + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

// --- helpers for zooming/panning ---
function pixelToComplex(x, y, width, height, view) {
  const cr = view.minRe + (x / width) * (view.maxRe - view.minRe);
  const ci = view.maxIm - (y / height) * (view.maxIm - view.minIm);
  return { cr, ci };
}

function zoomAt(view, zoomFactor, anchorCr, anchorCi) {
  // zoomFactor < 1 => zoom in, > 1 => zoom out
  const newMinRe = anchorCr + (view.minRe - anchorCr) * zoomFactor;
  const newMaxRe = anchorCr + (view.maxRe - anchorCr) * zoomFactor;
  const newMinIm = anchorCi + (view.minIm - anchorCi) * zoomFactor;
  const newMaxIm = anchorCi + (view.maxIm - anchorCi) * zoomFactor;

  return { ...view, minRe: newMinRe, maxRe: newMaxRe, minIm: newMinIm, maxIm: newMaxIm };
}

function panBy(view, deltaCr, deltaCi) {
  return {
    ...view,
    minRe: view.minRe + deltaCr,
    maxRe: view.maxRe + deltaCr,
    minIm: view.minIm + deltaCi,
    maxIm: view.maxIm + deltaCi,
  };
}

// --- wiring it up ---
const canvas = document.getElementById("mandelbrot");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// initial viewport (keeps aspect ratio)
let view = {
  minRe: -2.5,
  maxRe: 1,
  minIm: -1,
  maxIm: -1 + (1 - (-2.5)) * height / width,
  maxIterations: 200,
};

function render() {
  const data = generateMandelbrotData(width, height, view);
  plotMandelbrotData(ctx, data);
}

render();

// Wheel zoom toward cursor
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const { cr, ci } = pixelToComplex(x, y, width, height, view);

  // smaller step = smoother zoom
  const zoomStep = 1.15;
  const zoomFactor = e.deltaY < 0 ? 1 / zoomStep : zoomStep;

  view = zoomAt(view, zoomFactor, cr, ci);

  // optional: increase iterations as you zoom in
  view.maxIterations = Math.min(2000, Math.floor(view.maxIterations * (e.deltaY < 0 ? 1.05 : 0.98)));

  render();
}, { passive: false });

// Drag to pan
let dragging = false;
let lastX = 0, lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

window.addEventListener("mouseup", () => dragging = false);

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const x = e.offsetX;
  const y = e.offsetY;

  // convert pixel delta to complex delta
  const dx = x - lastX;
  const dy = y - lastY;

  const rePerPixel = (view.maxRe - view.minRe) / width;
  const imPerPixel = (view.maxIm - view.minIm) / height;

  // dragging right should move view left (so subtract)
  const deltaCr = -dx * rePerPixel;
  const deltaCi =  dy * imPerPixel; // y axis is inverted on canvas

  view = panBy(view, deltaCr, deltaCi);

  lastX = x;
  lastY = y;

  render();
});
