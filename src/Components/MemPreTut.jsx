import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";

import butterfly from "./ani-stim/butterfly.jpg";
import ladybug from "./ani-stim/ladybug.jpg";
import snail from "./ani-stim/snail.jpg";
import frog from "./ani-stim/frog.jpg";
import beetle from "./ani-stim/beetle.jpg";
import ant from "./ani-stim/ant.jpg";
import camel from "./ani-stim/camel.jpg";
import owl from "./ani-stim/owl.jpg";
import tiger from "./ani-stim/tiger.jpg";
import panther from "./ani-stim/panther.jpg";
import bear from "./ani-stim/bear.jpg";
import snake from "./ani-stim/snake.jpg";
import gorilla from "./ani-stim/gorilla.jpg";
import spider from "./ani-stim/spider.jpg";
import buffalo from "./ani-stim/buffalo.jpg";

import astrodude from "./img/astronaut.png";
import style from "./style/memTaskStyle.module.css";
import { DATABASE_URL } from "./config.jsx";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE PRE TASK (PICTURE NAMING) FOR THE TASK
// Session includes:
// 1) Introduction to cover story
// 2) NEW!! Task to name the pictures correctly

class MemPreTut extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    ////////////////
    var stateWord = [
      "butterfly",
      "ladybug",
      "snail",
      "frog",
      "beetle",
      "ant",
      "owl",
      "tiger",
      "panther",
      "bear",
      "snake",
      "gorilla",
      "spider",
      "camel",
      "buffalo",
    ];

    var statePic = [
      butterfly,
      ladybug,
      snail,
      frog,
      beetle,
      ant,
      owl,
      tiger,
      panther,
      bear,
      snake,
      gorilla,
      spider,
      camel,
      buffalo,
    ];

    statePic = statePic.filter(function (val) {
      return val !== undefined;
    });

    stateWord = stateWord.filter(function (val) {
      return val !== undefined;
    });

    // --- Declare variables OUTSIDE the if/else ---
    let userID,
      prolificID,
      date,
      startTime,
      condition,
      memCorrectPer,
      perCorrectPer;

    var debug = true; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 100;
      memCorrectPer = 0.9;
      perCorrectPer = 0;
      stateWord = stateWord.slice(0, 2);
      statePic = statePic.silce(0, 2);
      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      memCorrectPer = this.props.state.memCorrectPer;
      perCorrectPer = this.props.state.perCorrectPer;
    }

    // number of trials is dependent on statePic array

    var stateNum = stateWord.length; //26

    var trialNumTotal = 102; // it shouldn't go past 102 this...

    //the stim position
    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      // demo paramters
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      //section paramters
      sectionTime: sectionTime,
      section: "pretutorial",

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimChoiceTimeLag: 300, //1500
      respFbTimeLag: 700, //
      fbTimeLag: 500, //500 correct or wrong

      // stimuli
      stateWord: stateWord,
      statePic: statePic,
      stateNum: stateNum,
      stimNumLeft: stateNum,

      stateWordArray: stateWord,
      statePicArray: statePic,
      choicePosList: choicePos,

      //trial parameters
      trialNumTotal: trialNumTotal,

      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      //trial by trial paramters
      trialNum: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      choicePos: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      choice: null,

      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1
      taskScreen: false,
      taskSection: null,
      debug: debug,

      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keyup", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    this.handleInstruct = this.handleInstruct.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.handleNextResp = this.handleNextResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.renderImages = this.renderImages.bind(this);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// KEYBOARD HANDLES ////

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 5) {
      // from page 2 to 5, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 4
    ) {
      // from page 1 to 4, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 5) {
      setTimeout(
        function () {
          this.preTutorBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 6) {
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleResp(keyPressed, timePressed) {
    var respTime = timePressed - (this.state.trialTime + this.state.fixTime);

    var choiceCor = this.state.choiceCor; // what the actual answer is
    var choice;
    var correct;
    var response;
    if (keyPressed === 1 && choiceCor === "left") {
      choice = "left";
      response = true;
      correct = 1;
    } else if (keyPressed === 2 && choiceCor === "right") {
      choice = "right";
      response = true;
      correct = 1;
    } else if (keyPressed === 1 && choiceCor === "right") {
      choice = "left";
      response = false;
      correct = 0;
    } else if (keyPressed === 2 && choiceCor === "left") {
      choice = "right";
      response = false;
      correct = 0;
    } else {
      choice = null;
      response = false;
      correct = 0;
      console.log("No response made!");
    }

    console.log("response: " + response);
    console.log("correct: " + correct);

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
    });

    setTimeout(
      function () {
        this.ifCorrect();
      }.bind(this),
      0
    );
  }

  ifCorrect() {
    var correct = this.state.correct;
    var stimShown = this.state.stimShown[0];
    var stimWordShown = this.state.stimWordShown[0];

    var stateWordArray = this.state.stateWordArray;
    var statePicArray = this.state.statePicArray;
    var stateWordArrayLeft;
    var statePicArrayLeft;

    console.log("stateWordArray: " + stateWordArray);
    console.log("stateWordArray: " + stateWordArray.length);
    //  console.log("statePicArray: " + statePicArray.length);
    //  console.log("stimShown: " + stimShown);
    console.log("stimWordShown: " + stimWordShown);

    if (correct === 1) {
      //remove the correct stimlus from the array
      stateWordArrayLeft = stateWordArray.filter(function (val) {
        return val !== stimWordShown;
      });
      statePicArrayLeft = statePicArray.filter(function (val) {
        return val !== stimShown;
      });

      console.log("CORRECT!!");
    } else {
      //if not correct, keep it in
      stateWordArrayLeft = stateWordArray;
      statePicArrayLeft = statePicArray;
      console.log("INCORRECT!!");
    }
    console.log("stateWordArrayLeft: " + stateWordArrayLeft);
    console.log("stateWordArrayLeft: " + stateWordArrayLeft.length);
    //  console.log("statePicArrayLeft: " + statePicArrayLeft.length);

    this.setState({
      stateWordArray: stateWordArrayLeft,
      statePicArray: statePicArrayLeft,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      0
    );
  }

  handleNextResp(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (whichButton === 3) {
      var rewFbTime =
        Math.round(performance.now()) -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        rewFbTime: rewFbTime,
      });

      document.removeEventListener("keyup", this._handleNextRespKey);
      setTimeout(
        function () {
          this.renderPreTutorSave();
        }.bind(this),
        0
      );
    }
  }

  // handle key keyPressed
  _handleInstructKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        keyPressed = 1;
        this.handleInstruct(keyPressed);
        break;
      case 39:
        //    this is right arrow
        keyPressed = 2;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleBeginKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleBegin(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleRespKey = (event) => {
    var keyPressed;
    var timePressed;
    var leftKey = this.state.respKeyCode[0];
    var rightKey = this.state.respKeyCode[1];

    switch (event.keyCode) {
      case leftKey:
        //    this is left choice
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      case rightKey:
        //    this is right choice
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleNextRespKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleNextResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    var taskCond;

    if (this.state.condition === 1) {
      //perception task started first
      taskCond = (
        <span>
          After we powered up the spaceship, we unforunately found that some
          things have been displaced!
        </span>
      );
    } else {
      taskCond = (
        <span>
          Welcome to spaceship!
          <br /> <br />
          The ship has been damaged with an asteriod hit and we are glad you are
          here to help.
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        <span>
          {taskCond}
          <br />
          <br />
          We have some animals on board, and in the collision, they have
          scattered to various parts of the spaceship. We need your assistance
          in reallocating them back to their pods.
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={280} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>We have a variety of animals on board:</span>
        <br />
        <br />
        <span>
          <center>
            {this.renderImages(this.state.stateNum, this.state.statePic)}
          </center>
        </span>
        <br />
        <span>
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          As there are many animals, we will first get you familar with what
          they are called. We will show you one picture at one time. You will
          have to <strong>select the correct name</strong> of the animal that is
          shown.
        </span>
        <br />
        <br />
        <span>
          <center>
            For instance:
            <br />
            <br />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[3]}
              alt="stim1"
            />
            <br />
            <br />
            <br />
            <br />
            <span className={style.choiceWordChosen}>
              {this.state.stateWord[3]}
            </span>{" "}
            <span className={style.choiceWord}>{this.state.stateWord[11]}</span>
          </center>
          <br />
          <br />
          As the animal in the picture is a {this.state.stateWord[3]}, you would
          select the <strong>left</strong> word in this case.
        </span>
        <span>
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          <strong>Press W</strong> to choose the word on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the word on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          If you are <strong>correct</strong>, the word that you selected will
          have its outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the word that you selected will
          have its outline turn{" "}
          <font color="red">
            <strong>red</strong>
          </font>
          .
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          There are {this.state.stateNum} animals in total.
          <br />
          <br />
          This naming task will continue until{" "}
          <strong>you have selected the right name for every animal</strong>.
          <br />
          <br />
          You will be brought to the main task once you have successfully learnt
          all the names of the animals.
          <br />
          <br />
          As a reminder:
          <br />
          <br />
          <strong>Press W</strong> to choose the animal on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the animal on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to begin.
            <br />
            <br />[<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text6 = (
      <div>
        <span>
          Well done! You are familar with what the animals are called.
          <br />
          <br />
          Let us move on to the main task.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
      case 4:
        return <div>{instruct_text4}</div>;
      case 5:
        return <div>{instruct_text5}</div>;
      case 6:
        return <div>{instruct_text6}</div>;

      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  preTutorBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    // push to render fixation for the first trial
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      0
    );
  }

  preTutorEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 6,
      taskSection: null,
    });
  }

  preTutorFail() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 7,
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the choice

    // shuffle the  list of stimuli
    var stim = this.state.statePicArray; //here i using an array that is "cut" down after every successful answer
    var stimWord = this.state.stateWordArray;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    var stimNumLeft = stim.length; //this should change if correct on prev trial
    console.log("trialNum: " + trialNum);
    console.log("stimNumLeft: " + stimNumLeft);

    var stimPick;
    var stimWordPick;
    var stimPickShown;
    var stimWordPickShown;
    var choicePickShown;
    var choiceWordPickShown;

    if (stimNumLeft > 1) {
      //pick the number of stim to be shown, plus 1 more for the other option of 2AFC
      //here, I cut out the last two elements in the array
      var stimPickNum = 2;
      stimPick = stim.slice([-stimPickNum]);
      stimWordPick = stimWord.slice([-stimPickNum]);

      //console.log("stimPick: " + stimPick);
      console.log("stimWordPick: " + stimWordPick);

      //this is the stim that is shown - cut the first option out
      stimPickShown = stimPick.slice(0, 1);
      stimWordPickShown = stimWordPick.slice(0, 1);

      //  utils.shuffleSame(stimPickShown, stimWordPickShown); //shuffle the order shown

      //    stimPickShown = stimPickShown.filter(function (val) {
      //      return val !== undefined;
      //    });
      //    stimWordPickShown = stimWordPickShown.filter(function (val) {
      //      return val !== undefined;
      //    });

      //this is the stim for the 2AFC - this takes the last two...stimPick is actually already length=2
      choicePickShown = stimPick.slice(-2);
      choiceWordPickShown = stimWordPick.slice(-2);
    } else if (stimNumLeft === 1) {
      //if there is only one more stimulus in the array, then...
      stimPick = stim;
      stimWordPick = stimWord;

      //this is the stim that is shown - cut the first option out (no cutting here actually since stim.length is 1)
      stimPickShown = stimPick.slice(0, 1);
      stimWordPickShown = stimWordPick.slice(0, 1);

      //this is the stim for the 2AFC - I add one pic and one word at the end for the alternative ans
      choicePickShown = stimPick.concat("bee");
      choiceWordPickShown = stimWordPick.concat("bee");

      console.log("stimPick " + stimPick);

      console.log("stimWordPickShown " + stimWordPickShown);
      console.log("choiceWordPickShown " + choiceWordPickShown);
    } else {
      //if there is NO MORE!!
      stimPick = 0;
      stimWordPick = 0;

      //this is the stim that is shown - cut the first option out (no cutting here actually since stim.length is 1)
      stimPickShown = 0;
      stimWordPickShown = 0;

      //this is the stim for the 2AFC - I add one pic and one word at the end for the alternative ans
      choicePickShown = [0, 0];
      choiceWordPickShown = [0, 0];
    }

    //    console.log("stimPickShown: " + stimPickShown);
    console.log("stimWordPickShown: " + stimWordPickShown);

    //    console.log("choicePickShown: " + choicePickShown);
    console.log("choiceWordPickShown: " + choiceWordPickShown);

    // have to do shuffling of the answers
    var choiceShownWordLeft;
    var choiceShownWordRight;
    var choiceCor;
    if (choicePos === 1) {
      choiceShownWordLeft = choiceWordPickShown[0];
      choiceShownWordRight = choiceWordPickShown[1];
      choiceCor = "left";
    } else {
      choiceShownWordLeft = choiceWordPickShown[1];
      choiceShownWordRight = choiceWordPickShown[0];
      choiceCor = "right";
    }

    //Reset all parameters
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "iti",
      trialNum: trialNum,
      stimNumLeft: stimNumLeft,
      fixTime: 0,
      stimTime: 0,

      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,

      choice: null,
      correct: null,
      correctPer: null,
      choiceCor: choiceCor,
      choicePos: choicePos,

      stimPick: stimPick,
      stimWordPick: stimWordPick,
      stimShown: stimPickShown,
      stimWordShown: stimWordPickShown,
      choiceShownWordLeft: choiceShownWordLeft,
      choiceShownWordRight: choiceShownWordRight,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    //  console.log("trialNum: " + this.state.trialNum);
    //  console.log("stimNumLeft: " + this.state.stimNumLeft);

    if (stimNumLeft >= 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0
      );
    } else if (stimNumLeft === 0) {
      // if the trials have finished all the picutres below 100 trials
      setTimeout(
        function () {
          this.preTutorEnd();
        }.bind(this),
        0
      );
    }
  }

  renderFix() {
    var trialTime = Math.round(performance.now());

    //Show fixation
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStimChoice();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStimChoice() {
    document.addEventListener("keyup", this._handleRespKey);
    var fixTime = Math.round(performance.now()) - this.state.trialTime;

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimChoice",
      fixTime: fixTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    document.removeEventListener("keyup", this._handleRespKey);

    var choice = this.state.choice;
    var choiceFbLeft;
    var choiceFbRight;

    if (choice === "left") {
      choiceFbLeft = style.choiceWordChosen;
      choiceFbRight = style.choiceWord;
    } else if (choice === "right") {
      choiceFbLeft = style.choiceWord;
      choiceFbRight = style.choiceWordChosen;
    } else {
      choiceFbLeft = style.choiceWord;
      choiceFbRight = style.choiceWord;
    }

    //  console.log("choice: " + choice);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
      choiceFbLeft: choiceFbLeft,
      choiceFbRight: choiceFbRight,
    });

    setTimeout(
      function () {
        this.renderCorFb();
      }.bind(this),
      this.state.respFbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    document.addEventListener("keyup", this._handleNextRespKey);

    var respFbTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.respTime];

    var choice = this.state.choice;
    var correct = this.state.correct;
    var choiceFbRewLeft;
    var choiceFbRewRight;
    var choiceFbRewText;

    //    console.log("choice: " + choice);
    //  console.log("correct: " + correct);

    if (choice === "left" && correct === 1) {
      choiceFbRewLeft = style.choiceWordCorrect;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "Correct!";
    } else if (choice === "left" && correct === 0) {
      choiceFbRewLeft = style.choiceWordWrong;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "Incorrect!";
    } else if (choice === "right" && correct === 1) {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWordCorrect;
      choiceFbRewText = "Correct!";
    } else if (choice === "right" && correct === 0) {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWordWrong;
      choiceFbRewText = "Incorrect!";
    } else {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "No Answer?";
    }

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "corFeedback",
      respFbTime: respFbTime,
      choiceFbRewLeft: choiceFbRewLeft,
      choiceFbRewRight: choiceFbRewRight,
      choiceFbRewText: choiceFbRewText,
    });
  }

  renderPreTutorSave() {
    var prolificID = this.state.prolificID;

    //  var stimPickShown = this.state.stimPickShown.substring(0, 50);
    //  var statePicArray = this.state.statePicArray.substring(0, 50);

    var stimShown = null;
    var stimPick = null;
    var statePicArray = null;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      stimNumLeft: this.state.stimNumLeft,
      choiceCor: this.state.choiceCor,
      choicePos: this.state.choicePos,

      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      rewFbTime: this.state.rewFbTime,
      responseKey: this.state.responseKey,
      choice: this.state.choice,
      correct: this.state.correct,

      statePicArray: statePicArray,
      stateWordArray: this.state.stateWordArray,

      stimPick: stimPick,
      stimWordPick: this.state.stimWordPick,
      stimShown: stimShown,
      stimWordShown: this.state.stimWordShown,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
    };

    console.log(saveString);

    try {
      fetch(`${DATABASE_URL}/mem_pre_tutorial_data/` + prolificID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveString),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    this.props.navigate("/MemTut?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        condition: this.state.condition,
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        statePic: this.state.statePic,
        stateWord: this.state.stateWord,
        perCorrectPer: this.state.perCorrectPer,
        memCorrectPer: this.state.memCorrectPer,
      },
    });

    console.log("UserID is: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    var statePic = this.state.statePic;

    [statePic].forEach((image) => {
      new Image().src = image;
    });

    this.setState({
      statePic: statePic,
      mounted: 1,
    });
  }

  renderImages(number, imageArray) {
    const imageElements = [];
    for (let i = 0; i < number; i++) {
      const imageSrc = imageArray[i];
      imageElements.push(
        <img key={i} className={style.instructStimDis} src={imageSrc} alt="" />
      );
    }
    return imageElements;
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (this.state.instructScreen === true && this.state.taskScreen === false) {
      document.addEventListener("keyup", this._handleInstructKey);
      document.addEventListener("keyup", this._handleBeginKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
      //  console.log("THIS SHOULD BE INSTRUCTION BLOCK");
      //  console.log("instructNum: " + this.state.instructNum);
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "iti"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "fixation"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <br />
          <br />

          <center>
            <img
              className={style.stimDisHide}
              src={this.state.stimShown}
              alt="stim1"
            />{" "}
          </center>
          <DrawFix />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "stimChoice"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <center>What animal is this?</center>
          <br />
          <br />
          <center>
            <img
              className={style.instructStimDis}
              src={this.state.stimShown}
              alt="stim1"
            />{" "}
          </center>
          <br />
          <br />
          <br />
          <br />
          <span className={style.choiceWord}>
            {this.state.choiceShownWordLeft}
          </span>
          &nbsp;or&nbsp;
          <span className={style.choiceWord}>
            {this.state.choiceShownWordRight}
          </span>
          <br />
          <br />
          <br />
          <br />
          <center> </center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "choiceFeedback"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <center>What animal is this?</center>
          <br />
          <br />
          <center>
            <img
              className={style.instructStimDis}
              src={this.state.stimShown}
              alt="stim1"
            />{" "}
          </center>
          <br />
          <br />
          <br />
          <br />
          <span className={this.state.choiceFbLeft}>
            {this.state.choiceShownWordLeft}
          </span>
          &nbsp;or&nbsp;
          <span className={this.state.choiceFbRight}>
            {this.state.choiceShownWordRight}
          </span>
          <br />
          <br />
          <br />
          <br />
          <center> </center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "corFeedback"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <center>{this.state.choiceFbRewText}</center>
          <br />
          <br />
          <center>
            <img
              className={style.instructStimDis}
              src={this.state.stimShown}
              alt="stim1"
            />{" "}
          </center>
          <br />
          <br />
          <br />
          <br />
          <span className={this.state.choiceFbRewLeft}>
            {this.state.choiceShownWordLeft}
          </span>
          &nbsp;or&nbsp;
          <span className={this.state.choiceFbRewRight}>
            {this.state.choiceShownWordRight}
          </span>
          <br />
          <br />
          <br />
          <br />
          <center>Press the [SPACEBAR] to continue.</center>
        </div>
      );
    }

    return (
      <>
        <div className={style.bg} />
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </>
    );
  }
}

export default withRouter(MemPreTut);
