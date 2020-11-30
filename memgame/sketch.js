var game;
var n_cosocos;
var round_finished_counter_set = false;

let song, right_answer, wrong_answer;
let polySynthesizer = new p5.PolySynth();

function preload() {
  song = loadSound('assets/DivineMetatron.wav');
  right_answer = loadSound('assets/check.wav');
  wrong_answer = loadSound('assets/wrong.wav');
}

function setup() {
  createCanvas(400, 400);

  n_cosocos = 3;
  game = new Memgame(n_cosocos, polySynthesizer, right_answer, wrong_answer);
  
  song.loop();
  song.play();
}

function draw() {
  background(220);

  // leftkey or say "yes" - its a cosoco
  // rightkey or say "no" - its not a cosoco

  if (!game.game_finished) {
    game.play();
  } else {

    if (!round_finished_counter_set) {
      game.counter = millis();
      round_finished_counter_set = true;

    }

    fill(color(0, 0, 0));
    textSize(32);
    text("Round finished!", 100, 200);

    textSize(16);
    text("Number of cososcos: " + game.n_cosocos + ".", 100, 220);

    if (millis() >= 3000 + game.counter) {
      n_cosocos++;
      game = new Memgame(n_cosocos, polySynthesizer, right_answer, wrong_answer);
      round_finished_counter_set = false;
    }

  }

}
