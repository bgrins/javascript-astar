
// Define colors
const rgbToCoords = (r, g, b) => [r / 255.0, g / 255.0, b / 255.0];
const yellowish = new Color("srgb", rgbToCoords(255, 194, 10));
const blueish = new Color("srgb", rgbToCoords(12, 123, 220));
const minColor = new Color("white");
const maxColor = new Color("darkgray");

// Global for the Two canvas
const two = new Two({
                  fullscreen: false,
                  fitted: true,
                  autostart: true
}).appendTo(document.querySelector("#the-canvas"));

// 25x25 graph with random weights between 0..10
// zero is a wall
const gridWidth = 25;
const gridHeight = 25;

cols = Array.from({ length: gridWidth}, (x, y) => {
  return Array.from({ length: gridHeight }, (x, y) => Math.floor(Math.random() * 11));
});

graph = new Graph(cols);

// Infer square size from canvas dimensions
const squareSize = Math.min(two.width / gridWidth, two.height / gridHeight);
const squareWidth = squareSize, squareHeight = squareSize;

// Convert a grid coordinate to a screen coordinate.
const gridToScreen = function(gridX, gridY) {
  const centerScreenX = two.width / 2.0;
  const centerScreenY = two.height / 2.0;

  const centerGridX = gridWidth / 2;
  const centerGridY = gridHeight / 2;

  // Adjust 0,0 to be the top-left corner, not the center.
  const xOffset = gridX - centerGridX;
  const yOffset = gridY - centerGridY;
  
  return [
    centerScreenX + xOffset * squareWidth,
    centerScreenY + yOffset * squareHeight
  ];
};

// Find min & max weight for color gradient
const minWeight = Math.min(...graph.nodes.map(n => n.weight));
const maxWeight = Math.max(...graph.nodes.map(n => n.weight));

// Determine a square's fill color.
const squareToColor = function(square) {
  const colorRange = minColor.range(maxColor, { space: "srgb" });
  const weightPercent = (square.weight - minWeight) / (maxWeight - minWeight);

  return square.weight == 0 ? [0, 0, 0] : colorRange(weightPercent).coords;
};

// Create a rectangle per grid square.

var board = [];

graph.nodes.forEach(square => {
  const middleX = two.width / 2;
  const middleY = two.height / 2;
  
  const [squareX, squareY] = gridToScreen(square.x, square.y);

  const gridRect = two.makeRectangle(squareX - squareWidth * 0.5, squareY + squareHeight * 0.5, squareWidth, squareHeight);
  const [colorR, colorG, colorB] = squareToColor(square);
  gridRect.fill = `rgb(${colorR * 255}, ${colorG * 255}, ${colorB * 255})`;

  board.push(gridRect);
});

/*two.bind('update', function() {
  rect.rotation += 0.001;
});*/

