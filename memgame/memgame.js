class Memgame {
  //GENERAL NOTES:
  //TODO: Add more ML. "Repeat" - repeat sequence or "Whole" - show all colors and sound

  //TODO: Apply effects? Maybe for now just reduce the time appearing each section, and I'll try to add waveforms if possible.

  //TODO: Create visuals instead of squares.

  constructor(num_cosocos, polysynth, right_answer, wrong_answer) {
    this.sorted_pitches = shuffle(["A3", "C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6"]); // A minor pentatonic scale
    this.polySynthesizer = polysynth;
    this.right_answer = right_answer;
    this.wrong_answer = wrong_answer;

    this.cosoco_dict = {} // COlorSOundCOmbinantion - COSOCO c:

    this.n_cosocos = num_cosocos;

    if (num_cosocos < 7) {
      this.colour_thresh = 120;
    } else if (num_cosocos > 7 && num_cosocos < 15) {
      this.colour_thresh = 70;
    } else if (num_cosocos > 15 && num_cosocos < 20) {
      this.colour_thresh = 40;
    } else {
      this.colour_thresh = 20;
    }

    var color_not_diff;
    var color_cosoco;
    for (let k = 0; k < num_cosocos; k++) {

      color_not_diff = true;

      if (k > 0) {
        while (color_not_diff) {
          color_cosoco = [random(255), random(255), random(255)];
          color_not_diff = this.check_colours(color_cosoco);
        }
      } else {
        color_cosoco = [random(255), random(255), random(255)];
      }

      this.cosoco_dict[k] = [
        color_cosoco, this.sorted_pitches[k], 0.2
      ]
    }

    // general use counter
    this.counter = 0; // later it will be = millis() - prevents slight delays

    // intro
    this.intro_cosoco_counter = 0;
    this.show_intro_cosocos = false;
    this.intro_counter_set = false;

    // between intro and testing - give option to repeat cosocos set
    this.allow_repeat = false;
    this.repeat_counter_set = false;

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
    this.answers_started = false;
    this.answer_eval = "";

    // Speech Rec
    this.continuous = false;
    this.interim = false;
    this.speechRecOn = false;


  }

  check_colours(colour) {

    for (let i = 0; i < Object.keys(this.cosoco_dict).length; i++) {
      let diff_red = pow(this.cosoco_dict[i][0][0] - colour[0], 2);
      let diff_green = pow(this.cosoco_dict[i][0][1] - colour[1], 2);
      let diff_blue = pow(this.cosoco_dict[i][0][2] - colour[2], 2);

      let diff_color = sqrt(diff_red + diff_green + diff_blue);

      if (diff_color < this.colour_thresh) {
        return true;
      }
    }
    return false;
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

        // allow repeat = true
        this.allow_repeat = true;

        //this.start_test_cosocos = true; //remove
      }

    }

    if (this.show_intro_cosocos) {
      fill(color(this.cosoco_dict[this.intro_cosoco_counter - 1][0]));
      noStroke();
      rect(100, 100, 200, 200);
      //textSize(32);
      //text(this.cosoco_dict[this.intro_cosoco_counter - 1][1], 150, 390);

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

    // allow repeat
    if (this.allow_repeat) {

      if (!this.repeat_counter_set) {
        this.counter = millis();
        this.repeat_counter_set = true;
      }

      if (!this.speechRecOn) {
        this.speechRec = new p5.SpeechRec('en-US');
        this.speechRec.start(this.continuous, this.interim);
        this.speechRecOn = true;
      }

      if (this.speechRec.resultString == "repeat" || keyIsDown(LEFT_ARROW)) {
        this.intro_cosoco_counter = 0;
        this.show_intro_cosocos = false;
        this.intro_counter_set = false;
        this.allow_repeat = false;
        this.speechRecOn = false;

      } else if (this.speechRec.resultString == "play" || keyIsDown(RIGHT_ARROW)) {
        this.start_test_cosocos = true;
        this.allow_repeat = false;
        this.speechRecOn = false;
      }

      textAlign(CENTER, CENTER);
      fill(color(0, 0, 0));
      textSize(32);
      text("Say 'Repeat' if you wish\nto hear the set again.", 200, 100);
      text("Say 'Play' if you wish\nto start the round.", 200, 250);
      textAlign(CENTER, BOTTOM);
      textSize(16);
      text("Alternatively use Left key (<-) to repeat,\nRight key (->) to play", 200, 350);

      // after some time reset speechRec 
      if (millis() >= 5000 + this.counter) {
        this.speechRecOn = false;
        this.counter = millis();
      }

      //console.log(this.speechRec.resultString);
    }

    // if testing
    if (this.start_test_cosocos && !this.game_finished) {
      this.test_user();
    }

  }

  test_user() {

    if (!this.test_counter_set) {
      this.counter = millis();
      this.cosoco_dict_tbg = {
        ...this.cosoco_dict
      };
      //Object.assign(this.cosoco_dict_tbg,this.cosoco_dict); // optional way to copy dicts
      this.test_counter_set = true;
    }

    if (!this.show_test_cosocos && this.answergiven && this.answers_started) {

      textAlign(CENTER, CENTER);
      fill(color(0, 0, 0));
      textSize(24);
      text(this.answer_eval, 200, 200)

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
          other_cosocos.splice(this.test_colour, 1);
        }
        let diff_random_cosoco = Math.floor(Math.random() * other_cosocos.length);
        this.test_sound = other_cosocos[diff_random_cosoco];
        //console.log("SOUND DIFF FROM COLOUR; COLOUR: ", this.test_colour, "; SOUND: ", this.test_sound, " ;", "Other cosocos: ", other_cosocos)
      }

      this.counter = millis();

      this.answergiven = false;
      this.answers_started = true;

    } else if (millis() >= 2000 + this.counter && !this.answergiven) {

      this.show_test_cosocos = false;

    }

    if (this.show_test_cosocos && !this.answergiven) {
      fill(color(this.cosoco_dict[this.test_colour][0]));
      noStroke();
      rect(100, 100, 200, 200);
      //textSize(32);
      //text(this.cosoco_dict[this.test_sound][1], 150, 390);

      this.polySynthesizer.play(this.cosoco_dict[this.test_sound][1], 0.3, 0, 0.01);
      console.log(this.cosoco_dict[this.test_sound][1]);

      //console.log("in_test_rect");
    }

    if (!this.answergiven) {

      if (!this.speechRecOn) {
        this.speechRec = new p5.SpeechRec('en-US');
        this.speechRec.start(this.continuous, this.interim);
        this.speechRecOn = true;
      }

      if (this.speechRec.resultString == "yes" || keyIsDown(LEFT_ARROW)) { //yes its the cosoco ive seen before
        this.answergiven = true;
        this.counter = millis();

        // is testsound = testcolor -> correct, pop cosoco out of tbg
        this.checkAnswer("left");
        this.speechRecOn = false;
        console.log(this.speechRec.resultString);

      } else if (this.speechRec.resultString == "no" || keyIsDown(RIGHT_ARROW)) { //no, its not the cosoco ive seen before
        this.answergiven = true;
        this.counter = millis();

        this.checkAnswer("right");
        this.speechRecOn = false;
        console.log(this.speechRec.resultString);
      }

      // after some time reset speechRec 
      if (millis() >= 6000 + this.counter) {
        this.speechRecOn = false;
        this.counter = millis();
      }

      // Instructions
      if (!this.show_test_cosocos) {
        textAlign(CENTER, CENTER);
        fill(color(0, 0, 0));
        textSize(32);
        text("Say 'Yes' if you think\nthis is a cosoco.", 200, 100);
        text("Say 'No' if you don't think\nthis is a cosoco.", 200, 250);
        textAlign(CENTER, BOTTOM);
        textSize(16);
        text("Alternatively use Left key (<-) for 'Yes',\nand Right key (->) for 'No'", 200, 350);
      }

    }

  }

  checkAnswer(input) {

    if (this.test_colour == this.test_sound) {
      if (input == "left") {
        this.answer_eval = "Correct, this really\nis a cosoco! Nice!";
        console.log("Correct, this really is a cosoco! Nice!");
        // remove from tbg
        delete this.cosoco_dict_tbg[this.test_colour];

        this.right_answer.play();

        if (Object.entries(this.cosoco_dict_tbg).length === 0) {
          this.game_finished = true;
        }

        return;
      } else {
        this.answer_eval = "Incorrect, this is cosoco!";
        console.log("Incorrect, this is cosoco!");
        this.wrong_answer.play();
        return;
      }
    } else {
      if (input == "right") {
        this.answer_eval = "Correct, this is not a cosoco!";
        console.log("Correct, this is not a cosoco!");
        this.right_answer.play();

        // increase prob
        if (this.cosoco_dict[this.test_colour][2] < 0.7) {
          this.cosoco_dict[this.test_colour][2] += 0.2;
        }
        return;
      } else {
        this.answer_eval = "Incorrect, this\nis not a cosoco!";
        console.log("Incorrect, this is not a cosoco!");
        this.wrong_answer.play();
        return;
      }
    }

  }

}