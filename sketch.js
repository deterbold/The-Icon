//video variables
let iconVideo;
let playing = false;

//face detection variables
let faceDetection;
let capture;
let faceSeen = false;

//volume control
let volumeDecreaseInterval;
let volumeIncreaseInterval;

//pulse
let pulseSize = 20; // Initial size of the pulse ellipse
let pulseColor = "green"; // Initial color of the pulse ellipse

// Initial brightness of the video feed
let initialBrightness = 255;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Load video from a local file in the "Data" folder
  iconVideo = createVideo("Data/theBomb.mp4");
  iconVideo.size(width, height);
  iconVideo.loop(); // Set the video to loop by default
  iconVideo.hide(); // Hide the video element

  // Load the face-api.js model
  faceDetection = ml5.faceApi(modelReady);

  document.getElementById("startButton").addEventListener("click", start);
}

function start() {
  if (!playing) {
    // Create a video capture from webcam
    capture = createCapture(VIDEO, function () {
      capture.size(width, height);
      capture.hide(); // Hide the capture element

      // Start video
      iconVideo.play();

      // Start face detection
      faceDetection.detect(capture, gotFaces);

      playing = true;
      document.getElementById("startButton").style.display = "none";
    });
  }
}

//function to start the model
function modelReady() {
  console.log("Model Loaded!");
  document.getElementById("startButton").style.display = "block";
}

//Machine vision function
function gotFaces(error, result) {
  if (error) {
    console.error(error);
    return;
  }

  if (result.length === 0) {
    faceSeen = false;
    // If no faces detected, start decreasing volume
    if (!volumeDecreaseInterval) {
      clearInterval(volumeIncreaseInterval); // Clear increase volume interval if exists
      volumeIncreaseInterval = null;
      volumeDecreaseInterval = setInterval(decreaseVolume, 1000); // Decrease volume every second
    }
    // Darken the video feed based on volume level
    let currentVolume = iconVideo.volume();
    let currentBrightness = map(currentVolume, 0, 1, 0, 255);
    console.log("Current Brightness: ", currentBrightness); // Adjust brightness inversely proportional to volume
    tint(255, currentBrightness); // Apply tint with decreasing brightness
  } else {
    faceSeen = true;
    // If faces detected, start increasing volume
    if (!volumeIncreaseInterval) {
      clearInterval(volumeDecreaseInterval); // Clear decrease volume interval if exists
      volumeDecreaseInterval = null;
      volumeIncreaseInterval = setInterval(increaseVolume, 1000); // Increase volume every second
    }
    let currentVolume = iconVideo.volume();
    let currentBrightness = map(currentVolume, 0, 1, initialBrightness, 255);
    console.log("Current Brightness: ", currentBrightness); // Adjust brightness inversely proportional to volume
    tint(255, currentBrightness); // Apply tint with decreasing brightness

    //drawFaces(result); // Draw detected faces (for debugging purposes
  }

  faceDetection.detect(capture, gotFaces);
}

function draw() {
  background(0);
  image(iconVideo, 0, 0, width, height); // Draw the video onto the canvas
  console.log("Volume: ", iconVideo.volume());
  // Draw the pulse ellipse if the camera is on
  if (capture && capture.loadedmetadata) {
    drawPulse();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iconVideo.size(width, height);
}

function decreaseVolume() {
  let currentVolume = iconVideo.volume();
  if (currentVolume > 0) {
    iconVideo.volume(currentVolume - 1 / 20); // Decrease volume over 20 seconds
  }
}

function increaseVolume() {
  let currentVolume = iconVideo.volume();
  if (currentVolume < 1) {
    iconVideo.volume(currentVolume + 1 / 10); // Increase volume over 10 seconds
  }
}

function drawPulse() {
  // Set pulse ellipse properties
  fill(pulseColor);
  noStroke();

  // Calculate position of the ellipse at the top center of the window
  let x = width / 2;
  let y = 50;

  // Draw the pulse ellipse
  ellipse(x, y, pulseSize, pulseSize);

  if (faceSeen) {
    pulseSize = map(sin(frameCount / 10), -1, 1, 10, 20); // Pulse between 40 and 60 pixels in size
    pulseColor = "green"; // Set pulse color to green
  } else {
    pulseSize = 30; // Pulse between 40 and 60 pixels in size
    pulseColor = "red"; // Set pulse color to red
  }
}
