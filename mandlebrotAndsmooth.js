// ---------- Mandelbrot: data generator ----------
function generateMandelbrotData(width, height, view) {
  const { minRe, maxRe, minIm, maxIm, maxIterations = 300 } = view;

  const iters = new Uint16Array(width * height);
  const escapeRadiusSquared = 4;

  for (let y = 0; y < height; y++) {
    const ci = maxIm - (y / height) * (maxIm - minIm);
    for (let x = 0; x < width; x++) {
      const cr = minRe + (x / width) * (maxRe - minRe);

      let a = 0, b = 0, n = 0;
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

// ---------- Mandelbrot: plotter ----------
function plotMandelbrotData(ctx, data, drawWidth, drawHeight) {
  const { iters, width, height, maxIterations } = data;

  // draw to an offscreen imageData at (width x height)
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

  // Put the small image then scale it up to canvas size (blocky preview = faster)
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const offCtx = off.getContext("2d");
  offCtx.putImageData(imageData, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, drawWidth, drawHeight);
  ctx.drawImage(off, 0, 0, drawWidth, drawHeight);
}

// ---------- helpers ----------
function pixelToComplex(x, y, width, height, view) {
  const cr = view.minRe + (x / width) * (view.maxRe - view.minRe);
  const ci = view.maxIm - (y / height) * (view.maxIm - view.minIm);
  return { cr, ci };
}

function zoomAt(view, zoomFactor, anchorCr, anchorCi) {
  return {
    ...view,
    minRe: anchorCr + (view.minRe - anchorCr) * zoomFactor,
    maxRe: anchorCr + (view.maxRe - anchorCr) * zoomFactor,
    minIm: anchorCi + (view.minIm - anchorCi) * zoomFactor,
    maxIm: anchorCi + (view.maxIm - anchorCi) * zoomFactor,
  };
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

// ---------- progressive renderer ----------
function makeProgressiveRenderer(canvas, ctx) {
  const W = canvas.width;
  const H = canvas.height;

  // quality levels (bigger = faster, blockier)
  const PREVIEW_SCALE = 4; // 4 => preview is (W/4 x H/4)
  const FINAL_SCALE = 1;   // full res

  let renderToken = 0;
  let settleTimer = null;

  function render(view, scale) {
    const token = ++renderToken;

    // Small internal render size for preview
    const rw = Math.max(1, Math.floor(W / scale));
    const rh = Math.max(1, Math.floor(H / scale));

    // OPTIONAL: reduce iterations in preview for speed
    const localView = {
      ...view,
      maxIterations: scale === PREVIEW_SCALE
        ? Math.max(80, Math.floor(view.maxIterations * 0.6))
        : view.maxIterations,
    };

    // Generate + plot
    const data = generateMandelbrotData(rw, rh, localView);

    // If a newer render started, skip drawing
    if (token !== renderToken) return;

    plotMandelbrotData(ctx, data, W, H);
  }

  function renderPreviewThenFinal(view) {
    // fast preview immediately
    render(view, PREVIEW_SCALE);

    // then full quality after user stops moving for a moment
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => render(view, FINAL_SCALE), 140);
  }

  return { renderPreviewThenFinal, renderFinal: (v) => render(v, FINAL_SCALE) };
}

// ---------- wiring ----------
const canvas = document.getElementById("mandelbrot");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

let view = {
  minRe: -2.5,
  maxRe: 1,
  minIm: -1,
  maxIm: -1 + (1 - (-2.5)) * H / W,
  maxIterations: 250,
};

const renderer = makeProgressiveRenderer(canvas, ctx);
renderer.renderFinal(view);

// wheel zoom (smooth)
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const { cr, ci } = pixelToComplex(x, y, W, H, view);

  const zoomStep = 1.18;
  const zoomFactor = e.deltaY < 0 ? 1 / zoomStep : zoomStep;

  view = zoomAt(view, zoomFactor, cr, ci);

  // increase iterations as you zoom in (helps detail)
  if (e.deltaY < 0) view.maxIterations = Math.min(2500, Math.floor(view.maxIterations * 1.06));

  renderer.renderPreviewThenFinal(view);
}, { passive: false });

// drag pan
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

  const dx = x - lastX;
  const dy = y - lastY;

  const rePerPixel = (view.maxRe - view.minRe) / W;
  const imPerPixel = (view.maxIm - view.minIm) / H;

  const deltaCr = -dx * rePerPixel;
  const deltaCi =  dy * imPerPixel;

  view = panBy(view, deltaCr, deltaCi);

  lastX = x;
  lastY = y;

  renderer.renderPreviewThenFinal(view);
});
