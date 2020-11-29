var game;
var n_cosocos;
var round_finished_counter_set = false;

function setup() {
  createCanvas(400, 400);

  n_cosocos = 3;
  game = new Memgame(n_cosocos);
  
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
      game = new Memgame(n_cosocos);
      round_finished_counter_set = false;
    }

  }

}