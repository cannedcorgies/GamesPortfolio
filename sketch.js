let squares = [];
let gridCols = 4;
let gridSpacing = 60;
let sizes = {
  small: 30,
  medium: 40,
  large: 55
};
let selectStretch = 1.3;
let lerpSpeed = 0.2;
let openSize = 200;

let selectedIndex = null;   // which square has been selected
let edgePositions = [];     // locations around the screen

let jsonData;   // data for the squares

let backgroundColor = 125;

let margin = 50;        // space from edge
let cornerOffset = 30;  // to prevent overlap

let imageDict = {};  // store loaded gifs to avoid reloading

let centerOffset_x = 0;
let centerOffset_y = -200;

let boxColor = 255;
let gridBox;
let widthSpacing = 100;

let textBox;
let textBoxLerpSpeed = 0.075;
let textBoxOffsetX = 100;
let textBoxOffsetY = 50;
let textBoxMargin = 20;
let font = "Roboto";
let size_text = 14;
let titleSize = 34;
let subtitleSize = 25;

let itchImage = "images/itch-io-icon.png";
let itchBox;

function preload() {

  jsonData = loadJSON("squaresData.json", () => {

    // wait for json to load...
    for (let obj of jsonData.squares) {

      if (!imageDict[obj.image]) {
        imageDict[obj.image] = loadImage(obj.image);
      }

    }

  });
}


class TextBox {

  constructor(text, boxWidth, boxHeight, color = [255, 128, 128]) {

    this.activated = false;
    this.startX = width/2 - textBoxOffsetX * 2;
    this.x = this.startX;
    this.y = height/2 + textBoxOffsetY;
    this.width = boxWidth;
    this.height = boxHeight;
    this.text = text;
    this.color = color;
    this.alpha = 0;

    this.title = "sample";
    this.subtitle = "sample subtitle";

  }

  reset() {

    this.alpha = 0;
    this.x = width/2 - textBoxOffsetX * 2;

  }

  update() {

    if (this.activated) {

      this.alpha = lerp(this.alpha, 255, textBoxLerpSpeed);
      this.x = lerp(this.x, width/2 - textBoxOffsetX, textBoxLerpSpeed);

    } else {

      this.x = this.startX;
      this.alpha = 0;

    }

  }

  display() {

    rectMode(LEFT);
    noStroke();

    let textW = this.width - textBoxMargin;
    let textH = this.getWrappedTextHeight(this.text, textW);

    // shadow
    let c = color(backgroundColor);
    if (selectedIndex == null) { c.setAlpha(0); }
    fill(c);
    rect(this.x, this.y + textBoxMargin, textW + textBoxMargin * 2, textH * 2);

    rectMode(LEFT);
    // solid textbox
    rect(this.x + textBoxMargin * 1.5, this.y - textH / 4 + textLeading(), textW, textH);
    c = color(this.color[0], this.color[1], this.color[2]);
    c.setAlpha(this.alpha);
    fill(c);
    rect(this.x, this.y + textBoxMargin, textW, textH * 1.5);

    rectMode(CENTER);
    // text
      // small text
    textSize(size_text);
    textAlign(LEFT);
    c = color(255, 255, 255);
    c.setAlpha(this.alpha);
    fill(c);
    text(this.text, this.x + textBoxMargin * 1.5, this.y - textH / 2 + textLeading(), textW);

      // title
    textSize(titleSize);
    var titleX = gridBox.currTopRight[0] + textBoxMargin; 
    var titleY = 0;
    if (selectedIndex !== null) { 
      titleY = squares[selectedIndex].y + 20;
    }
    text(this.title, titleX, titleY);

      // subtitle
    textSize(subtitleSize);
    var subX = this.x - textBoxMargin * 10;
    var subY = this.y - (textH/2 + textBoxMargin/1.5);
    c = color(backgroundColor);
    if (selectedIndex == null) { c.setAlpha(0); }
    fill(c);
    //rect(subX, subY, this.width - textBoxMargin * 1.5, subtitleSize * 2);

    c = color(255, 255, 255);
    c.setAlpha(this.alpha);
    fill(c);
    text(this.subtitle, subX, subY);

  }

  getWrappedTextHeight(txt, boxWidth) {
    textSize(size_text);
    textAlign(LEFT);
    let words = txt.split(' ');
    let lines = [];
    let line = "";
  
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      if (textWidth(testLine) > boxWidth && line !== '') {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line); // add the last line
  
    let lineHeight = textLeading(); // or textAscent() + textDescent()
    return lines.length * lineHeight;
  }

}

class GridBox {

  constructor(topLeft, topRight, bottomRight, bottomLeft) {

    this.topLeftRest = topLeft;
    this.topRightRest = topRight;
    this.bottomRightRest = bottomRight;
    this.bottomLeftRest = bottomLeft;

    this.currTopLeft = [...this.topLeftRest];
    this.currTopRight = [...this.topRightRest];
    this.currBottomRight = [...this.bottomRightRest];
    this.currBottomLeft = [...this.bottomLeftRest];

  }

  update(selectedIndex) {

    if (selectedIndex !== null) {

      this.currTopLeft[0] = lerp(this.currTopLeft[0], (width/2) - (openSize * squares[selectedIndex].widthMultiplier * 0.5) - widthSpacing, lerpSpeed)
      this.currTopLeft[1] = lerp(this.currTopLeft[1], height / 2 + centerOffset_y, lerpSpeed);

      this.currTopRight[0] = lerp(this.currTopRight[0], (width/2) + (openSize * squares[selectedIndex].widthMultiplier * 0.5) + widthSpacing, lerpSpeed)
      this.currTopRight[1] = lerp(this.currTopRight[1], height / 2 + centerOffset_y, lerpSpeed);

      this.currBottomRight[0] = lerp(this.currBottomRight[0], (width/2) + (openSize * squares[selectedIndex].widthMultiplier * 0.5) + widthSpacing, lerpSpeed)
      this.currBottomRight[1] = lerp(this.currBottomRight[1], height / 2 - centerOffset_y, lerpSpeed);

      this.currBottomLeft[0] = lerp(this.currBottomLeft[0], (width/2) - (openSize * squares[selectedIndex].widthMultiplier * 0.5) - widthSpacing, lerpSpeed)
      this.currBottomLeft[1] = lerp(this.currBottomLeft[1], height / 2 - centerOffset_y, lerpSpeed);

    } else {

      this.currTopLeft[0] = lerp(this.currTopLeft[0], this.topLeftRest[0], lerpSpeed);
      this.currTopLeft[1] = lerp(this.currTopLeft[1], this.topLeftRest[1], lerpSpeed);

      this.currTopRight[0] = lerp(this.currTopRight[0], this.topRightRest[0], lerpSpeed);
      this.currTopRight[1] = lerp(this.currTopRight[1], this.topRightRest[1], lerpSpeed);

      this.currBottomRight[0] = lerp(this.currBottomRight[0], this.bottomRightRest[0], lerpSpeed);
      this.currBottomRight[1] = lerp(this.currBottomRight[1], this.bottomRightRest[1], lerpSpeed);

      this.currBottomLeft[0] = lerp(this.currBottomLeft[0], this.bottomLeftRest[0], lerpSpeed);
      this.currBottomLeft[1] = lerp(this.currBottomLeft[1], this.bottomLeftRest[1], lerpSpeed);

    }

  }

  display() {

    noFill();
    stroke(boxColor);
    quad(this.currTopLeft[0], this.currTopLeft[1], this.currTopRight[0], this.currTopRight[1], this.currBottomRight[0], this.currBottomRight[1], this.currBottomLeft[0], this.currBottomLeft[1]);

  }

}

class Square {

  constructor(index, x, y, baseSize, name, text, imagePath, color, link, subtitle) {

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
    this.currWidth = baseSize;
    this.text = text;
    this.color = color;
    this.subtitle = subtitle;

    this.img = imageDict[imagePath];
    this.widthMultiplier = this.img.width/this.img.height;
    this.link = link;

  }

  // update attributes
  update(selectedIndex) {

    // if there is a selected square
    if (selectedIndex !== null) {

      // if this square was selected
      if (this.index === selectedIndex) {

        this.targetX = width / 2;
        this.targetY = height / 2 + centerOffset_y;

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
  display(selectedIndex) {

    // lean towards map
      // remap mouse position
    let shiftX = map(mouseX, 0, width, -10, 10);
    let shiftY = map(mouseY, 0, height, -10, 10);
    if (selectedIndex == this.index) { shiftX = shiftY = 0; }
      // recalculate position based on mouse pos
    let drawX = this.x + shiftX * (this.baseSize / sizes.large);  // account for largest size possible
    let drawY = this.y + shiftY * (this.baseSize / sizes.large);

    // hover detection
    let hovered = abs(mouseX - drawX) < this.currWidth / 2 &&
                  abs(mouseY - drawY) < this.currentSize / 2;

    // smooth size lerping
    let targetSize = hovered ? this.baseSize * selectStretch : this.baseSize;
    if (selectedIndex === this.index) { targetSize = hovered ? openSize * selectStretch : openSize; }
    this.currentSize = lerp(this.currentSize, targetSize, lerpSpeed);

    if (selectedIndex === this.index) { this.currWidth = lerp(this.currWidth, this.currentSize * this.widthMultiplier, lerpSpeed);}
    else { this.currWidth = lerp(this.currWidth, this.currentSize, lerpSpeed); }

    // center crop the image to fill square without squeezing
    let cropSize = min(this.img.width, this.img.height);
    let xOffset = (this.img.width - cropSize) / 2;
    let yOffset = (this.img.height - cropSize) / 2;

    // create a square crop of the original image
    let cropped = this.img.get(xOffset, yOffset, cropSize, cropSize);
    if (selectedIndex === this.index) { cropped = this.img.get((this.img.width - cropSize * this.widthMultiplier) / 2, yOffset, cropSize * this.widthMultiplier, cropSize); }
    cropped.setFrame(this.img.getCurrentFrame());
    cropped.resize(this.currentSize * this.widthMultiplier, this.currentSize);

    // create a mask (rounded square)
    let mask = createGraphics(this.currWidth, this.currentSize);
    mask.noStroke();
    mask.fill(255);
    mask.rect(0, 0, this.currWidth, this.currentSize, this.currentSize * 0.2); // Rounded corners (30% radius)

    // apply the mask
    cropped.mask(mask);

    imageMode(CENTER);
    if (hovered || selectedIndex === this.index) { image(this.img, -1000, -1000, 0, 0); }    // source image
    //if (selectedIndex === this.index)
    image(cropped, drawX, drawY, this.currWidth, this.currentSize);

  }

  // mouse click DETECTION
  isClicked(mx, my) {

    let shiftX = map(mx, 0, width, -10, 10);
    let shiftY = map(my, 0, height, -10, 10);
    let drawX = this.x + shiftX * (this.baseSize / sizes.large);
    let drawY = this.y + shiftY * (this.baseSize / sizes.large);

    return abs(mx - drawX) < this.currWidth / 2 &&
           abs(my - drawY) < this.currentSize / 2;
  }

  // when unclicked
  resetPosition() {
    this.targetX = this.baseX;
    this.targetY = this.baseY;
  }
}

class ItchLink extends Square {

  constructor(index, x, y, baseSize, name, text, imagePath, color, link, subtitle) {

    super(index, x, y, baseSize, name, text, imagePath, color, link);
    this.y = height/2;
    this.img = loadImage(itchImage);

  }

  update() {

    if (selectedIndex != null) { fill(backgroundColor); }
    rect(this.x, this.y, this.currentSize + textBoxMargin, this.currentSize + textBoxMargin);

    this.x = gridBox.currTopRight[0];
    // lean towards map
    // remap mouse position
    let shiftX = map(mouseX, 0, width, -10, 10);
    let shiftY = map(mouseY, 0, height, -10, 10);
    if (selectedIndex == this.index) { shiftX = shiftY = 0; }
      // recalculate position based on mouse pos
    let drawX = this.x + shiftX * (this.baseSize / sizes.large);  // account for largest size possible
    let drawY = this.y + shiftY * (this.baseSize / sizes.large);

    // hover detection
    let hovered = abs(mouseX - drawX) < this.currWidth / 2 &&
                  abs(mouseY - drawY) < this.currentSize / 2;

    // smooth size lerping
    let targetSize = hovered ? this.baseSize * selectStretch : this.baseSize;
    this.currentSize = lerp(this.currentSize, targetSize, lerpSpeed);
    if (selectedIndex == null) { this.currentSize = 1; }

    this.currWidth = lerp(this.currWidth, this.currentSize, lerpSpeed);

    // center crop the image to fill square without squeezing
    let cropSize = min(this.img.width, this.img.height);
    let xOffset = (this.img.width - cropSize) / 2;
    let yOffset = (this.img.height - cropSize) / 2;
    
    // create a square crop of the original image
    let cropped = this.img.get(xOffset, yOffset, cropSize, cropSize);
    cropped.resize(this.currentSize * this.widthMultiplier, this.currentSize);

    // create a mask (rounded square)
    let mask = createGraphics(this.currentSize, this.currentSize);
    mask.noStroke();
    mask.fill(backgroundColor);
    mask.rect(0, 0, this.currentSize, this.currentSize, this.currentSize * 0.2); // Rounded corners (30% radius)

    // apply the mask
    cropped.mask(mask);

    imageMode(CENTER);

    image(cropped, this.x, this.y, this.currentSize, this.currentSize);

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

    console.log(data[i].text);
    squares.push(new Square(i, x, y, baseSize, data[i].name, data[i].text, data[i].image, data[i].color, data[i].link, data[i].subtitle));

  }

  computeEdgeTargets(squares.length - 1);

  if (gridCols > squares.length) { gridCols = squares.length; } else {gridCols -= 1;}

  console.log(gridCols);
  gridBox = new GridBox([squares[0].x, squares[0].y], 
    [squares[gridCols].x, squares[gridCols].y], 
    [squares[gridCols].x, squares[squares.length - 1].y], 
    [squares[0].x, squares[squares.length - 1].y])

  textBox = new TextBox("hello blah blah blah", 500, 200);

  itchBox = new ItchLink(0, 400, 400, sizes.medium, "itch button", "uduaifgdka", "images/sheep.gif", backgroundColor, squares[0].link, "the awesome");

}

function draw() {

  background(backgroundColor);
  gridBox.update(selectedIndex);
  gridBox.display();
  // update all squares
  for (i = 0; i < squares.length; i++) {

    if (i === selectedIndex) { continue; }
    squares[i].update(selectedIndex);
    squares[i].display(selectedIndex);

  }

  // update textbox
  textBox.update();
  textBox.display();

  // draw above everything
  if (selectedIndex !== null) {

    textBox.activated = true;
    squares[selectedIndex].update(selectedIndex);
    squares[selectedIndex].display(selectedIndex);

  } else {

    textBox.activated = false;

  }

  itchBox.update();
  
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
      textBox.reset();
      textBox.text = s.text;
      textBox.title = s.name;
      textBox.subtitle = s.subtitle;
      textBox.color = s.color;
      return;
    }
  }

  // check itch
  if (itchBox.isClicked(mouseX, mouseY) && selectedIndex != null) {

    window.open(squares[selectedIndex].link);

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
