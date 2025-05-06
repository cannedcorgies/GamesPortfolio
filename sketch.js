let squares = [];
let gridCols = 8;
let gridSpacing = 60;
let sizes = {
  small: 30,
  medium: 40,
  large: 55
};
let selectStretch = 1.3;
let lerpSpeed = 0.2;

let selectedIndex = null;   // which square has been selected
let edgePositions = [];     // locations around the screen

let jsonData;   // data for the squares

let backgroundColor = 245;

let margin = 40;        // space from edge
let cornerOffset = 30;  // to prevent overlap

function preload() {
  jsonData = loadJSON("squaresData.json");
}

class Square {

  constructor(index, x, y, baseSize, name) {

    this.index = index;             // positioning chronologically
    this.x = x;                     // running x position
    this.y = y;                     // running y position
    this.baseX = x;                 // x position to return to
    this.baseY = y;                 // y position to return to
    this.baseSize = baseSize;       // size when not selected
    this.currentSize = baseSize;    // size when selected
    this.targetX = x;               // x position to lerp to
    this.targetY = y;               // y position to lerp to
    this.name = name;

  }

  // update attributes
  update(selectedIndex) {

    // if there is a selected square
    if (selectedIndex !== null) {

      // if this square was selected
      if (this.index === selectedIndex) {

        this.targetX = width / 2;
        this.targetY = height / 2;

      } else {  // else, lerp to edge
        
        let pos = edgePositions[this.index >= selectedIndex ? this.index - 1 : this.index]; // get position by index
        if (pos) {
          this.targetX = pos.x;
          this.targetY = pos.y;
        }

      }
    }

    // lerp to position
    this.x = lerp(this.x, this.targetX, 0.1);
    this.y = lerp(this.y, this.targetY, 0.1);

  }

  // update visuals
  display() {

    // lean towards map
      // remap mouse position
    let shiftX = map(mouseX, 0, width, -10, 10);
    let shiftY = map(mouseY, 0, height, -10, 10);
      // recalculate position based on mouse pos
    let drawX = this.x + shiftX * (this.baseSize / sizes.large);  // account for largest size possible
    let drawY = this.y + shiftY * (this.baseSize / sizes.large);

    // hover detection
    let hovered = abs(mouseX - drawX) < this.currentSize / 2 &&
                  abs(mouseY - drawY) < this.currentSize / 2;

    // smooth size lerping
    let targetSize = hovered ? this.baseSize * selectStretch : this.baseSize;
    this.currentSize = lerp(this.currentSize, targetSize, lerpSpeed);

    // draw the square
    fill(100, 150, 255, 220);
    rectMode(CENTER);
    rect(drawX, drawY, this.currentSize, this.currentSize, 6);

  }

  // mouse click DETECTION
  isClicked(mx, my) {

    let shiftX = map(mx, 0, width, -10, 10);
    let shiftY = map(my, 0, height, -10, 10);
    let drawX = this.x + shiftX * (this.baseSize / sizes.large);
    let drawY = this.y + shiftY * (this.baseSize / sizes.large);

    return abs(mx - drawX) < this.currentSize / 2 &&
           abs(my - drawY) < this.currentSize / 2;
  }

  // when unclicked
  resetPosition() {
    this.targetX = this.baseX;
    this.targetY = this.baseY;
  }
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  noStroke();

  let data = jsonData.squares; // assuming it's an array at the root level ( {squares: [__, __, __]})

  let rows = ceil(data.length / gridCols);  // round up
  let totalWidth = gridCols * gridSpacing;
  let totalHeight = rows * gridSpacing;
  let offsetX = (width - totalWidth) / 2 + gridSpacing / 2;   // should i use window dimensions instead?
  let offsetY = (height - totalHeight) / 2 + gridSpacing / 2;


  for (let i = 0; i < data.length; i++) {   // essentially, we are replacing each element

    let col = i % gridCols;
    let row = floor(i / gridCols);  // unknown

    // start positions
    let x = col * gridSpacing + offsetX;
    let y = row * gridSpacing + offsetY;
    let baseSize = sizes[data[i].size];   // fetch the appropriate size

    squares.push(new Square(i, x, y, baseSize, data[i].name));

  }

  computeEdgeTargets(squares.length - 1);

}

function draw() {

  background(backgroundColor);

  // update all squares
  for (let s of squares) {
    s.update(selectedIndex);
    s.display();
  }
  
}

function mousePressed() {

  // run mouse detection on each square -- for loop prevents multiple detections
  for (let s of squares) {

    if (s.isClicked(mouseX, mouseY)) {

      // if re-clicked the same square, reset all squares to resting states
      if (selectedIndex === s.index) {
        selectedIndex = null;

        for (let sq of squares) {
          sq.resetPosition();
        }

        return;

      }

      // otherwise, mark selected index and calculate edge positions
      selectedIndex = s.index;
      return;
    }
  }
}


function computeEdgeTargets(numSquares) {

  // reset edge positions for recalculating
  edgePositions = [];

  let perEdge = ceil(numSquares / 4); // how many squares on each side
  let i = 0;

  // skipping corners
  // top edge (left to right)
  for (let j = 0; j < perEdge && i < numSquares; j++, i++) {
    let x = map(j, 0, perEdge - 1, margin + cornerOffset, width - margin - cornerOffset);   // only x changes
    edgePositions[i] = { x, y: margin };
  }

  // right edge (top to bottom)
  for (let j = 0; j < perEdge && i < numSquares; j++, i++) {
    let y = map(j, 0, perEdge - 1, margin + cornerOffset, height - margin - cornerOffset);  // only y changes
    edgePositions[i] = { x: width - margin, y };
  }

  // bottom edge (right to left)
  for (let j = 0; j < perEdge && i < numSquares; j++, i++) {
    let x = map(j, 0, perEdge - 1, width - margin - cornerOffset, margin + cornerOffset);
    edgePositions[i] = { x, y: height - margin };
  }

  // left edge (bottom to top)
  for (let j = 0; j < perEdge && i < numSquares; j++, i++) {
    let y = map(j, 0, perEdge - 1, height - margin - cornerOffset, margin + cornerOffset);
    edgePositions[i] = { x: margin, y };
  }

}
