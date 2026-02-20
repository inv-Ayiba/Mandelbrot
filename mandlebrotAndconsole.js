function generateMandelbrotData(width, height, opts = {}) {
  const {
    minRe = -2.5,
    maxRe = 1,
    minIm = -1,
    // keep aspect ratio the same way you had it:
    maxIm = minIm + (maxRe - minRe) * height / width,
    maxIterations = 100,
    escapeRadiusSquared = 4,
  } = opts;

  // iteration count per pixel (0..maxIterations)
  const iters = new Uint16Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Map pixel (x, y) to complex plane
      const cr = minRe + (x / width) * (maxRe - minRe);
      const ci = maxIm - (y / height) * (maxIm - minIm);

      // z = 0
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

  return {
    iters,
    width,
    height,
    maxIterations,
  };
}

function plotMandelbrotData(ctx, data, opts = {}) {
  const { iters, width, height, maxIterations } = data;

  const {
    insideShade = 0,   // black
    outsideMax = 255,  // white
  } = opts;

  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < iters.length; i++) {
    const n = iters[i];

    // Same shading logic you had:
    const shade =
      n === maxIterations ? insideShade : (n / maxIterations) * outsideMax;

    const p = i * 4;
    imageData.data[p + 0] = shade; // R
    imageData.data[p + 1] = shade; // G
    imageData.data[p + 2] = shade; // B
    imageData.data[p + 3] = 255;   // A
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---- usage ----
const canvas = document.getElementById("mandelbrot");
const ctx = canvas.getContext("2d");

const mandelbrotData = generateMandelbrotData(canvas.width, canvas.height, {
  maxIterations: 100,
  // you can override viewport here if you want
});

plotMandelbrotData(ctx, mandelbrotData);
console.log("ctx, mandelbrotData : ",ctx, mandelbrotData)
console.log("Mandelbrot set rendering complete.");
