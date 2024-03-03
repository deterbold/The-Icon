//video variables
let iconVideo;
let playing = false;

//face detection variables
let faceDetection;
let capture;

//volume control
let volumeDecreaseInterval;
let volumeIncreaseInterval;



function setup() {
  createCanvas(windowWidth, windowHeight);

  // Load video from a local file in the "Data" folder
  iconVideo = createVideo('Data/theBomb.mp4');
  iconVideo.size(width, height);
  iconVideo.loop(); // Set the video to loop by default
  iconVideo.hide(); // Hide the video element


  // Create a video capture from webcam
  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide(); // Hide the capture element
  
  // Load the face-api.js model
  faceDetection = ml5.faceApi(capture, modelReady);

}

function start() {
  if (!playing) {
    // Start video
    iconVideo.play();

    // Start face detection
    faceDetection.detect(gotFaces);

    playing = true;
  }
}

//function to start the model
function modelReady() {
  console.log('Model Loaded!');
  // Start face detection
  faceDetection.detect(gotFaces);
}

//Machine vision function
function gotFaces(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  
  if (result.length === 0) {
    // If no faces detected, start decreasing volume
    if (!volumeDecreaseInterval) {
      clearInterval(volumeIncreaseInterval); // Clear increase volume interval if exists
      volumeIncreaseInterval = null;
      volumeDecreaseInterval = setInterval(decreaseVolume, 1000); // Decrease volume every second
    }
  } else {
    // If faces detected, start increasing volume
    if (!volumeIncreaseInterval) {
      clearInterval(volumeDecreaseInterval); // Clear decrease volume interval if exists
      volumeDecreaseInterval = null;
      volumeIncreaseInterval = setInterval(increaseVolume, 1000); // Increase volume every second
    }
  }
  
  // Continue face detection
  faceDetection.detect(gotFaces);
}

function draw() {
  background(220);
  image(iconVideo, 0, 0, width, height); // Draw the video onto the canvas
  console.log(iconVideo.volume());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iconVideo.size(width, height);
}

function decreaseVolume() {
  let currentVolume = iconVideo.volume();
  if (currentVolume > 0) {
    iconVideo.volume(currentVolume - (1 / 20)); // Decrease volume over 20 seconds
  }
}

function increaseVolume() {
  let currentVolume = iconVideo.volume();
  if (currentVolume < 1) {
    iconVideo.volume(currentVolume + (1 / 450)); // Increase volume over 10 seconds
  }
}

function mousePressed() {
  if (playing) {
    iconVideo.pause();
  }
   else {
     iconVideo.play();
   }
   playing = !playing;
 }