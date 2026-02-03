const canvas = document.getElementById("mandelbrot");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// Create image data to draw on
const imageData = ctx.createImageData(width, height);

// Define viewport in complex space
const minRe = -2.5;
const maxRe = 1;
const minIm = -1;
const maxIm = minIm + (maxRe - minRe) * height / width;

const maxIterations = 100;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {

    // 1. Map pixel (x, y) to complex plane
    let cr = minRe + (x / width) * (maxRe - minRe);
    let ci = maxIm - (y / height) * (maxIm - minIm); // top-to-bottom

    // 2. Start z = 0 + 0i
    let a = 0, b = 0;
    let n = 0;

    // 3. Loop to see if it escapes
    while (n < maxIterations) {
      let aNew = a * a - b * b + cr;
      let bNew = 2 * a * b + ci;
      a = aNew;
      b = bNew;
      if (a * a + b * b > 4) break;
      n++;
    }

    // 4. Color based on how many iterations it took
    const pixelIndex = (y * width + x) * 4;
    const shade = n === maxIterations ? 0 : (n / maxIterations) * 255;

    imageData.data[pixelIndex + 0] = shade; // R
    imageData.data[pixelIndex + 1] = shade; // G
    imageData.data[pixelIndex + 2] = shade; // B
    imageData.data[pixelIndex + 3] = 255;   // A (opaque)
  }
}

ctx.putImageData(imageData, 0, 0);
console.log("Mandelbrot set rendering complete.");