function preload() {
  chess = new Chess();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  chess.reload();
}

function draw() {
  chess.location();
}

function mouseMoved() {
  chess.moved = true;
  return false;
}

function touchMoved() {
  chess.moved = true;
  return false;
}

function mouseReleased() {
  chess.clicked = true;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chess.reload();
}