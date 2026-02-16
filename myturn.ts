/*
Z= Z^2 + C

Where:
- Z is a complex number (initially 0)
- C is the complex number corresponding to the pixel's position in the complex plane

C = a + bi, where:
- a is the real part (x-axis)
- b is the imaginary part (y-axis)

z^2 = a^2 + b^2i^2  = a^2 - b^2 + 2abi

So the formula can be rewritten as:
Z = (a^2 - b^2 + x) + (2ab + y)i

next a = a^2 - b^2 + Cr
next b = 2ab + Ci

The algorithm iteratively applies the formula to determine if the point escapes (i.e., if the magnitude of Z exceeds 2). 
The number of iterations it takes for Z to escape is used to determine the color of the pixel. 
If Z does not escape after a certain number of iterations, the point is considered to be in the Mandelbrot set and is typically colored black.
*/
function point(x: number ,y: number, maxSteps: number): number {
    let a = 0;
    let b = 0;
    // let steps = 0;
    
for (let i = 0; i < maxSteps; i++) 
{

    const xnew = a * a - b * b + x;
    const ynew =  2 * a * b + y;
    
    const modulusZ = xnew**2 + ynew**2;
    if (modulusZ >=4){return i}
    a= xnew ;
    b= ynew ;
}
return maxSteps;
}

function testPoint(xMath: number, yMath: number, maxSteps: number): number {
  let x: number = 0;
  let y: number = 0;
  let steps: number = 0;

  while (steps < maxSteps) {
    // The Mandelbrot formula: z = z^2 + c
    const newX: number = x * x - y * y + xMath;
    const newY: number = 2 * x * y + yMath;

    x = newX;
    y = newY;

    // Escape if |z|^2 > 4  (i.e., |z| > 2)
    if (x * x + y * y > 4) {
      return steps;
    }

    steps++;
  }

  // Didn't escape
  return maxSteps;
}

console.log("Testing points inside the Mandelbrot set:");
const inside = [
  { x: 0, y: 0 },          // main cardioid
  { x: -1, y: 0 },         // deep inside
  { x: -0.5, y: 0 },       // inside cardioid
  { x: -0.75, y: 0 },      // boundary-ish but still usually inside
  { x: -0.25, y: 0.5 },    // inside bulb area
  { x: -0.25, y: -0.5 },
];

for (let i = 0; i < inside.length; i++) {
  const { x, y } = inside[i];
  const result = point(x, y, 1000)==testPoint(x, y, 1000);
  console.log(result);
}

console.log("Testing points outside the Mandelbrot set:");
const outside = [
  { x: 1, y: 0 },
  { x: 0.5, y: 0.5 },
  { x: 0.3, y: 0.6 },
  { x: -2, y: 1 },
  { x: -2, y: -1 },
  { x: 2, y: 2 },
];


for (let i = 0; i < outside.length; i++) {
  const { x, y } = outside[i];
  const result = point(x, y, 1000)==testPoint(x, y, 1000);
  console.log(result);
}

console.log("Testing points on the boundary of the Mandelbrot set:");

const boundary = [
  { x: -0.75, y: 0.1 },
  { x: -0.7435, y: 0.1314 },
  { x: -0.70176, y: -0.3842 },
  { x: -0.835, y: -0.2321 },
  { x: 0.285, y: 0.01 },
];

for (let i = 0; i < boundary.length; i++) {
  const { x, y } = boundary[i];
  const result = point(x, y, 1000)==testPoint(x, y, 1000);
  console.log(result);
}

