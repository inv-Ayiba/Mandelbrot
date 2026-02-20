
function testPoint(xMath, yMath, maxSteps) {
  let x = 0;
  let y = 0;
  let steps = 0;
  
  while (steps < maxSteps) {
    // The Mandelbrot secret formula
    let newX = (x * x) - (y * y) + xMath;
    let newY = (2 * x * y) + yMath;
    
    x = newX;
    y = newY;
    
    // If the numbers get bigger than 4, the point flew away!
    if ((x * x) + (y * y) > 4) {
      return steps; 
    }
    steps++;
  }
  
  // If we finish the loop, the point stayed trapped.
  return maxSteps; 
}

function drawSimpleMandelbrot() {
  const canvas = document.getElementById("mandelbrot");
  const ctx = canvas.getContext("2d");
  
  const width = canvas.width;
  const height = canvas.height;
  
  // The edges of our math map
  const leftEdge = -2.5;
  const rightEdge = 1.0;
  const topEdge = -1.5;
  const bottomEdge = 1.5;

  // Check every single pixel on the screen
  for (let pixelY = 0; pixelY < height; pixelY++) {
    for (let pixelX = 0; pixelX < width; pixelX++) {
      
      // Translate the screen pixel into a math number
      let xMath = leftEdge + (pixelX / width) * (rightEdge - leftEdge);
      let yMath = topEdge + (pixelY / height) * (bottomEdge - topEdge);
      
      // Test the math number
      let steps = testPoint(xMath, yMath, 100);
      
      // Pick a color based on the steps
      if (steps === 100) {
        ctx.fillStyle = "black"; // Trapped points are black
      } else {
        // Points that fly away get lighter the longer they survive
        let brightness = steps * 2.5; 
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`; 
      }
      
      // Draw a 1x1 rectangle (a single pixel)
      ctx.fillRect(pixelX, pixelY, 1, 1);
    }
  }
}

// Run the code
drawSimpleMandelbrot();