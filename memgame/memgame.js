class Memgame {
  //GENERAL NOTES:
  //TODO: Add more ML. "Repeat" - repeat sequence or "Whole" - show all colors and sound

  //TODO: Apply effects? Maybe for now just reduce the time appearing each section, and I'll try to add waveforms if possible.

  //TODO: Create visuals instead of squares.

  //FIX: It finds undefined for the pitch inside this section, but still plays, it doesn't happen in the test section above. Why? :(
  //at the lines 169/170

  constructor(num_cosocos, polysynth, right_answer, wrong_answer) {
    this.sorted_pitches= shuffle(["A3","C4","D4","E4","G4","A4","C5","D5","E5","G5","A5","C6"]);// A minor pentatonic scale
    this.polySynthesizer = polysynth;
    this.right_answer = right_answer;
    this.wrong_answer = wrong_answer;

    this.cosoco_dict = {} // COlorSOundCOmbinantion - COSOCO c:

    this.n_cosocos = num_cosocos;

    for (let k = 0; k < num_cosocos; k++) {
      this.cosoco_dict[k] = [
        [random(255), random(255), random(255)], this.sorted_pitches[k], 0.2
      ]
    }

    // general use counter
    this.counter = 0; // later it will be = millis() - prevents slight delays

    // intro
    this.intro_cosoco_counter = 0;
    this.show_intro_cosocos = false;
    this.intro_counter_set = false;

    // testing
    this.test_cosoco_counter = 0;
    this.start_test_cosocos = false;
    this.show_test_cosocos = false;
    this.test_counter_set = false;
    this.test_cosoco = 0;
    this.answergiven = true;
    this.cosoco_dict_tbg = {}; // to be guessed
    this.test_colour = 0;
    this.test_sound = 0;
    this.game_finished = false;

    // Speech Rec
    this.continuous = false;
    this.interim = false;
    this.speechRecOn = false;


  }

  gotSpeech() {
    if (this.speechRec.resultValue) {
      this.wordHeard = this.speechRec.resultString;
    }
  }

  introduce_cosocos() {

    // every x seconds show a cosoco

    if (!this.intro_counter_set) {
      this.counter = millis();
      this.intro_counter_set = true;
    }

    if ((millis() >= 3000 + this.counter && this.intro_cosoco_counter < this.n_cosocos) || this.intro_cosoco_counter == 0) {

      this.show_intro_cosocos = true;
      this.intro_cosoco_counter++;
      this.counter = millis();

    } else if (millis() >= 2000 + this.counter) {

      this.show_intro_cosocos = false;

      if (this.intro_cosoco_counter == this.n_cosocos) {
        this.intro_cosoco_counter++;
        this.start_test_cosocos = true;
      }

    }

    if (this.show_intro_cosocos) {
      fill(color(this.cosoco_dict[this.intro_cosoco_counter - 1][0]));
      noStroke();
      rect(100, 100, 200, 200);
      textSize(32);
      text(this.cosoco_dict[this.intro_cosoco_counter - 1][1], 150, 390);

      let midiNote = this.cosoco_dict[this.intro_cosoco_counter - 1][1];
      this.polySynthesizer.play(midiNote, 0.3, 0, 1);
      console.log(this.intro_cosoco_counter);
    }

  }

  play() {
    userStartAudio();

    // if introducing
    if (!this.start_test_cosocos) {
      this.introduce_cosocos();
    }

    // if testing
    if (this.start_test_cosocos && !this.game_finished) {
      this.test_user();
    }

  }

  test_user() {

    if (!this.test_counter_set) {
      this.counter = millis();
      this.cosoco_dict_tbg = {...this.cosoco_dict};
      //Object.assign(this.cosoco_dict_tbg,this.cosoco_dict); // optional way to copy dicts
      this.test_counter_set = true;
    }

    if (millis() >= 3000 + this.counter && this.answergiven) { //answerGiven = true

      // set show_test_cosoco = true
      this.show_test_cosocos = true;

      // test color - from tbg cosocos
      let tbg_keys = Object.keys(this.cosoco_dict_tbg);
      let random_cosoco = Math.floor(Math.random() * tbg_keys.length);
      this.test_colour = tbg_keys[random_cosoco];

      // test sound
      // prob calculated based on cosoco[testcolor].prob
      let prob = this.cosoco_dict[this.test_colour][2];
      if (prob > Math.random()) {
        this.test_sound = this.test_colour;
      } else {
        let other_cosocos = [...Object.keys(this.cosoco_dict)];
        if (other_cosocos.length > 1) {
          other_cosocos.splice(this.test_colour,1);
        }
        let diff_random_cosoco = Math.floor(Math.random() * other_cosocos.length);
        this.test_sound = other_cosocos[diff_random_cosoco];
        //console.log("SOUND DIFF FROM COLOUR; COLOUR: ", this.test_colour, "; SOUND: ", this.test_sound, " ;", "Other cosocos: ", other_cosocos)
      }

      this.counter = millis();

      this.answergiven = false;

    } else if (millis() >= 2000 + this.counter && !this.answergiven) {

      this.show_test_cosocos = false;

    }

    if (this.show_test_cosocos && !this.answergiven) {
      fill(color(this.cosoco_dict[this.test_colour][0]));
      noStroke();
      rect(100, 100, 200, 200);
      textSize(32);
      text(this.cosoco_dict[this.test_sound][1], 150, 390);

      this.polySynthesizer.play(this.cosoco_dict[this.test_sound][1], 0.3, 0, 0.01);
      console.log(this.polySynthesizer.play(this.cosoco_dict[this.test_sound][1], 0.5, 0, 0.8));

      //console.log("in_test_rect");
    }

    if (!this.answergiven) {

      if (!this.speechRecOn) {
        this.speechRec = new p5.SpeechRec('en-US');
        this.speechRec.start(this.continuous, this.interim);
        this.speechRecOn = true;
      }

      if (this.speechRec.resultString == "yes" || keyIsDown(LEFT_ARROW)) {//yes its the cosoco ive seen before
        this.answergiven = true;
        this.counter = millis();

        // is testsound = testcolor -> correct, pop cosoco out of tbg
        this.checkAnswer("left");
        this.speechRecOn = false;

      } else if (this.speechRec.resultString == "no" || keyIsDown(RIGHT_ARROW)) {//no, its not the cosoco ive seen before
        this.answergiven = true;
        this.counter = millis();

        this.checkAnswer("right");
        this.speechRecOn = false;

      }

    }

  }

  checkAnswer(input) {

    if (this.test_colour == this.test_sound) {
      if (input == "left") {
        console.log("Correct, this really is a cosoco! Nice!");
        // remove from tbg
        delete this.cosoco_dict_tbg[this.test_colour];

        this.right_answer.play();

        if (Object.entries(this.cosoco_dict_tbg).length === 0) {
          this.game_finished = true;
        }

        return;
      } else {
        console.log("Incorrect, this is not cosoco!");
        this.wrong_answer.play();
        return;
      }
    } else {
      if (input == "right") {
        console.log("Correct, this is not a cosoco!");

        this.right_answer.play();

        // increase prob
        if (this.cosoco_dict[this.test_colour][2] < 0.7) {
          this.cosoco_dict[this.test_colour][2] += 0.2;
        }
        return;
      } else {
        console.log("Incorrect, this is a cosoco!");
        this.wrong_answer.play();
        return;
      }
    }

  }

}
