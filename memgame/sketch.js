var game;
var n_cosocos;
var round_finished_counter_set = false;
var intro_made = false;
var intro_counter = 0;

let song, right_answer, wrong_answer;
let polySynthesizer = new p5.PolySynth();
let clicked = false;
let slider;

function preload() {
  song = loadSound('assets/DivineMetatron.mp3');
  right_answer = loadSound('assets/check.wav');
  wrong_answer = loadSound('assets/wrong.wav');
}

function setup() {
  createCanvas(400, 400);
  slider = createSlider(0,1,0.5,0.01);

  n_cosocos = 3;
  game = new Memgame(n_cosocos, polySynthesizer, right_answer, wrong_answer);

  song.loop();
  song.play();

}

function draw() {
  background(220);
  song.setVolume(slider.value());
  right_answer.setVolume(slider.value());
  wrong_answer.setVolume(slider.value());

  if (!clicked) {
    textAlign(CENTER, 150);
    textSize(32);
    fill(color(0, 0, 0));
    text('VediSonor Memory Game', 200, 150);
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(color(0, 0, 0));
    text('Click to Start', 200, 200);
  }

  // leftkey or say "yes" - its a cosoco
  // rightkey or say "no" - its not a cosoco
  if (clicked) {

    //explain rules
    if (!intro_made) {
      frameRate(8);
      make_intro();
    } else {

      if (!game.game_finished) {
        game.play();
      } else {

        if (!round_finished_counter_set) {
          game.counter = millis();
          round_finished_counter_set = true;
        }

        textAlign(CENTER, CENTER);
        textSize(32);
        fill(color(0, 0, 0));
        text("Round finished!", 200, 150);
        textSize(16);
        fill(color(0, 0, 0));
        text("Number of cosocos: " + game.n_cosocos + ".", 200, 200);


        if (millis() >= 3000 + game.counter) {
          n_cosocos++;
          game = new Memgame(n_cosocos, polySynthesizer, right_answer, wrong_answer);
          round_finished_counter_set = false;
        }
      }
    }
  }
}

function mouseClicked() {
  if (!clicked) {
    clicked = true;
  }
}

function make_intro() {

  var text_arr = [
    "Welcome to VediSonor, where\nyour ability to remember\nCOlour-SOund COmbinationS\n(cosocos) will be tested!",
    "This game has multiple rounds.\nIn each round there are two stages:\nan introduction stage\nand a playing stage.",
    "In the introduction stage\na set of cosocos will be given\nto you - remember them!",
    "In the playing stage,\nyou will be tested on your\nability to remember cosocos.",
    "Cosocos will be given to you\nthat may or may not have been\nthe ones that were given to you\nin the introduction.",
    "If you think that the cosoco\nis part of the introduction set\nsay 'Yes', otherwise say 'No'.",
    "At the end of the introduction,\nyou may repeat the set by saying\n'Repeat' or you can go\ninto the playing stage by\n saying 'Play'.",
    "The first round will have 3 cosocos.\nThe subsequent rounds will\nhave +1 cosocos.",
    "Please speak clearly and\nloudly for the voice commands.\nIf the command is not\nregistered, please wait\nand try again. Alternatively,\n you can use the arrow keys.",
    "Are you ready? Click -> to continue!"
  ];

  textAlign(CENTER, CENTER);
  textSize(24);
  fill(color(0, 0, 0));
  text(text_arr[intro_counter], 200, 150);
  
  textAlign(CENTER,BOTTOM);
  textSize(16);
  text("Left key (<-) to go back, Right key (->) to go foward", 200, 350);

  if (keyIsDown(RIGHT_ARROW)) {
    intro_counter++;
  } else if (keyIsDown(LEFT_ARROW)) {
    if (intro_counter > 0) {
      intro_counter--;      
    }
  }

  if (intro_counter == text_arr.length) {
    frameRate(60);
    intro_made = true;
  }

}
