let cr = -0.75; // real part of c
let ci = 0.1;   // imaginary part of c

let a = 0; // real part of z
let b = 0; // imaginary part of z

const maxIterations = 100;

for (let i = 0; i < maxIterations; i++) {
  let aNew = a * a - b * b + cr;
  let bNew = 2 * a * b + ci;

  a = aNew;
  b = bNew;

  let magnitudeSquared = a * a + b * b;
  console.log(`Iteration ${i}: z = ${a.toFixed(4)} + ${b.toFixed(4)}i | |z|² = ${magnitudeSquared.toFixed(4)}`);

  if (magnitudeSquared > 4) {
    console.log(`Escaped at iteration ${i}`);
    break;
  }
}

if (a * a + b * b <= 4) {
  console.log("Did NOT escape — likely in Mandelbrot set");
}
