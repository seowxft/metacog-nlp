import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import * as ConfSlider from "./drawassets/DrawConfSlider.jsx";
import * as ConfSliderGlobal from "./drawassets/DrawConfSliderGlobal.jsx";
import * as staircase from "./MemStaircase.jsx";
import * as staircaseEasy from "./MemStaircaseEasy.jsx";

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

import style from "./style/memTaskStyle.module.css";

import { DATABASE_URL } from "./config.jsx";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK SESSION
// 1) Pre task confidence ratings
// 2) Task with trial by trial conf ratings

class MemTask extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    // --- Declare variables OUTSIDE the if/else ---
    let userID,
      prolificID,
      date,
      startTime,
      condition,
      stimNumEasy,
      stimNumHard,
      memCorrectPer,
      perCorrectPer,
      stateWord,
      statePic;

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
      stimNumEasy = 5;
      stimNumHard = 8;

      ////////////////
      stateWord = [
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

      statePic = [
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
      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      stimNumEasy = this.props.state.stimNumEasy;
      stimNumHard = this.props.state.stimNumHard;
      memCorrectPer = this.props.state.memCorrectPer;
      perCorrectPer = this.props.state.perCorrectPer;

      statePic = this.props.state.statePic;
      stateWord = this.props.state.stateWord;
    }

    statePic = statePic.filter(function (val) {
      return val !== undefined;
    });

    stateWord = stateWord.filter(function (val) {
      return val !== undefined;
    });

    // if
    var trialNumTotal = 35; //should be 140, for 7 blocks of 40 trials
    var blockNumTotal = 7; // should be 7
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    var condScrabble = ["easy", "hard", "easy", "hard", "easy", "hard"];
    utils.shuffle(condScrabble);
    var blockCondTotal = ["hard", ...condScrabble];

    //the choice position
    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      section: "task",
      sectionTime: sectionTime,

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 1000, //1500
      encodeTimeLag: 1000,
      respFbTimeLag: 700,

      //trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      blockCondTotal: blockCondTotal,
      choicePosList: choicePos,
      // respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      // stimuli
      stateWord: stateWord,
      statePic: statePic,

      //trial by trial paramters
      blockNum: 1,
      trialNum: 0,
      trialNumInBlock: 0,
      condEasyTrialNum: 0,
      condHardTrialNum: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      choicePos: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,
      confInitial: null,
      //    confMove: null, //can only move to next trial if conf was toggled
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      textTime: null,
      selfKnowledge: [],
      wordCount: 0,
      minWordCount: 10,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      stimNum: null,

      correctMatEasy: [], //put correct in vector, to cal perf %
      correctPerEasy: 0,
      responseMatrixEasy: [true, true],
      stairDirEasy: ["up", "up"],
      stimNumEasy: stimNumEasy,

      correctMatHard: [], //put correct in vector, to cal perf %
      correctPerHard: 0,
      responseMatrixHard: [true, true],
      stairDirHard: ["up", "up"],
      stimNumHard: stimNumHard,

      //quiz
      quizState: "pre",

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      quizScreen: false,
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
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleConfResp = this.handleConfResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum === 2) {
      // from page 2 , I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (whichButton === 2 && curInstructNum === 1) {
      // from page 1 , I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 2) {
      this.setState({
        quizState: "pre",
      });

      console.log("pre-conf begin");
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10,
      );
    } else if (whichButton === 3 && curInstructNum === 3) {
      // continue after a block break
      var blockNum = this.state.blockNum + 1;
      this.setState({
        instructScreen: false,
        taskScreen: true,
        taskSection: "iti",
        trialNumInBlock: 0,
        blockNum: blockNum,
      });

      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10,
      );
    } else if (whichButton === 3 && curInstructNum === 4) {
      this.setState({
        quizState: "post",
      });

      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10,
      );
    } else if (whichButton === 3 && curInstructNum === 5) {
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0,
      );
    }
  }

  //for the submitting the text plus moving to next page
  handleChange(event) {
    var text = event.target.value;
    var trimmedText = text.trim();
    var wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0;

    this.setState({
      selfKnowledge: text,
      wordCount: wordCount,
      error: null,
    });
  }

  handlePaste(event) {
    event.preventDefault();
    alert("Pasting is not allowed in this field."); // Optional: Notify the user
  }

  handleSubmit(event) {
    event.preventDefault(); // Always call this first!

    // --- Validation Check ---
    if (this.state.wordCount < this.state.minWordCount) {
      this.setState({
        error:
          "Please write at least " +
          this.state.minWordCount +
          " words to continue.",
      });
      return; // Stop the submission
    }
    // --- End Validation ---
    var timePressed = Math.round(performance.now());
    var textTime = timePressed - this.state.sectionTime;

    this.setState({
      selfKnowledge: this.state.selfKnowledge,
      textTime: textTime,
    });

    setTimeout(
      function () {
        this.renderRatingSave();
      }.bind(this),
      0,
    );
  }

  handleGlobalConf(keyPressed) {
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.quizScreen === true &&
      this.state.confLevel !== null
    ) {
      setTimeout(
        function () {
          this.renderQuizSave();
        }.bind(this),
        0,
      );
    }
  }

  handleResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    //Check first whether it is a valid press
    var respTime =
      timePressed -
      (this.state.trialTime +
        this.state.fixTime +
        this.state.stimTime +
        this.state.encodeTime);

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
    var correctMat = this.state.correctMat.concat(correct);
    var responseMatrix = this.state.responseMatrix.concat(response);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      responseMatrix: responseMatrix,
      correctMat: correctMat,
      correctPer: correctPer,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      0,
    );
  }

  handleConfResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (whichButton === 3 && this.state.confLevel !== null) {
      console.log("conf level: " + this.state.confLevel);
      var confTime =
        timePressed -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.encodeTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        confTime: confTime,
      });

      setTimeout(
        function () {
          this.renderTaskSave();
        }.bind(this),
        10,
      );
    }
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          The spaceship needs to be in order quickly - we need your help to sort
          the animals!
          <br /> <br />
          You will have {this.state.trialNumTotal} sets of animals to make your
          choice. This will be split over {this.state.blockNumTotal} sections
          with {this.state.trialNumPerBlock} sets of animals each so that you
          can take breaks in between.
          <br /> <br />
          Click on the description of the animal shown previously.
          <br /> <br />
          Please respond quickly and to the best of your ability. This time, you{" "}
          <strong>will not</strong> be told whether your choice was correct or
          incorrect.
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          After making your choice, you will then rate your confidence in your
          judgement on the rating scale.
          <br /> <br />
          Please do your best to rate your confidence accurately and do take
          advantage of the <strong>whole length</strong> of the rating scale.
          <br /> <br />
          You will not be allowed to move on to the next set of animals if you
          do not adjust the rating scale.
          <br /> <br />
          If you do well in the task, you can receive up to{" "}
          <strong>£2 bonus</strong>!
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>{" "}
            <button onClick={() => this.handleBegin(3)}>
              <strong>BEGIN</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          You have completed {this.state.blockNum} out of{" "}
          {this.state.blockNumTotal} blocks!
          <br />
          <br />
          Has your experience changed? Have you developed any particular
          strategy for making your decisions or on how you rate your confidence?
          Please explain what cues or feelings you are using to make these
          judgements.
          <br />
          <br />
          <center>
            <form onSubmit={this.handleSubmit}>
              <label>
                <textarea
                  placeholder={`${this.state.minWordCount} words minimum.`}
                  value={this.state.selfKnowledge}
                  onChange={this.handleChange}
                  onPaste={this.handlePaste}
                />
              </label>
              <br /> <br />
              <input type="submit" value="Submit & Continue Task" />
              <br />
              <br />
              {this.state.error}
            </form>
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          Amazing!
          <br />
          <br />
          You have completed cataloguing all of the animals!
          <br />
          <br />
          <center>
            <button onClick={() => this.handleBegin(3)}>
              <strong>CONTINUE</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          Whew! We have sorted all the animals back, thanks for your effort.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleBegin(3)}>
              <strong>CONTINUE</strong>
            </button>
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
      default:
    }
  }

  quizText(quizState) {
    let quiz_text1 = (
      <div>
        <center>
          Before we begin, out of {this.state.trialNumTotal} sets of animals,
          how many times you do think you will be able to select the correct
          animal seen in the set?
        </center>
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <center>
          <button onClick={() => this.handleGlobalConf(3)}>
            <strong>SUBMIT</strong>
          </button>
          <br />
          <br />
          You will not be able to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    let quiz_text2 = (
      <div>
        <center>
          After going through all the {this.state.trialNumTotal} sets of
          animals, how many times do you think you selected the animal seen in
          the sets correctly?
        </center>
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <center>
          <button onClick={() => this.handleGlobalConf(3)}>
            <strong>SUBMIT</strong>
          </button>
          <br />
          <br />
          You will not be able to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    switch (quizState) {
      case "pre":
        return <div>{quiz_text1}</div>;
      case "post":
        return <div>{quiz_text2}</div>;
      default:
    }
  }

  quizBegin() {
    var initialValue = utils.randomInt(70, 80);

    console.log("Begining quiz");
    console.log("initialValue: " + initialValue);

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      //  confMove: null,
      quizScreen: true,
      instructScreen: false,
      taskScreen: false,
      taskSection: "rating",
    });
  }

  taskBegin() {
    // push to render fixation for the first trial
    var blockCond = this.state.blockCondTotal[this.state.blockNum - 1];

    console.log(this.state.blockCondTotal);
    console.log(blockCond);

    if (blockCond == "easy") {
      this.setState({
        blockCond: blockCond,
        stimNum: this.state.stimNumEasy,
      });
    } else if (blockCond == "hard") {
      this.setState({
        blockCond: blockCond,
        stimNum: this.state.stimNumHard,
      });
    }

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      0,
    );
  }

  taskEnd() {
    this.setState({
      instructScreen: true,
      taskScreen: false,
      quizScreen: false,
      instructNum: 4,
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var trialNumInBlock = this.state.trialNumInBlock + 1;

    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the dotDiffLeft
    var condEasyTrialNum = this.state.condEasyTrialNum;
    var condHardTrialNum = this.state.condHardTrialNum;
    console.log("NEW TRIAL");

    console.log(this.state.blockCond);
    if (this.state.blockCond == "easy") {
      var condEasyTrialNum2 = condEasyTrialNum + 1; //trialNum is 0, so it starts from 1
      // run staircase
      var s2 = staircaseEasy.staircase(
        this.state.stimNumEasy,
        this.state.responseMatrixEasy,
        this.state.stairDirEasy,
        condEasyTrialNum2,
      );
    } else if (this.state.blockCond == "hard") {
      var condHardTrialNum2 = condHardTrialNum + 1;
      var s2 = staircase.staircase(
        this.state.stimNumHard,
        this.state.responseMatrixHard,
        this.state.stairDirHard,
        condHardTrialNum2,
      );
    }

    var stimNum = s2.stimNum;
    var stairDir = s2.direction;
    var responseMatrix = s2.stepcount;

    //  console.log("dotsStair: " + choiceCor);
    //  console.log("stairDir: " + stairDir);
    //  console.log("responseMat: " + responseMatrix);

    var reversals;
    if (s2.reversal) {
      // Check for reversal. If true, add one to reversals variable
      reversals = 1;
    } else {
      reversals = 0;
    }

    // shuffle the  list of stimuli
    var stim = this.state.statePic;
    var stimWord = this.state.stateWord;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    //pick the number of stim to be shown, plus 1 more for the other option of 2AFC
    var stimPickNum = stimNum + 1;
    var stimPick = stim.slice([-stimPickNum]);
    var stimWordPick = stimWord.slice([-stimPickNum]);

    console.log("stimPickNum: " + stimPickNum);
    console.log("stimPick: " + stimPick);
    console.log("stimWordPick: " + stimWordPick);

    //this is the stim that is shown
    var stimPickShown = stimPick.slice(0, stimNum);
    var stimWordPickShown = stimWordPick.slice(0, stimNum);

    utils.shuffleSame(stimPickShown, stimWordPickShown); //shuffle the order shown

    stimPickShown = stimPickShown.filter(function (val) {
      return val !== undefined;
    });
    stimWordPickShown = stimWordPickShown.filter(function (val) {
      return val !== undefined;
    });

    console.log("stimPickShown: " + stimPickShown);
    console.log("stimWordPickShown: " + stimWordPickShown);

    //this is the stim for the 2AFC
    var choicePickShown = stimPick.slice(-2);
    var choiceWordPickShown = stimWordPick.slice(-2);

    console.log("choicePickShown: " + choicePickShown);
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
      quizScreen: false,
      trialNum: trialNum,
      condHardTrialNum: condHardTrialNum,
      condEasyTrialNum: condEasyTrialNum,
      trialNumInBlock: trialNumInBlock,
      taskSection: "iti",
      fixTime: 0,
      stimTime: 0,
      encodeTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      confInitial: null,
      confLevel: null,
      confTime: 0,

      choice: null,
      correct: null,
      correctPer: null,
      choiceCor: choiceCor,
      choicePos: choicePos,

      stimPick: stimPick,
      stimWordPick: stimWordPick,
      stimShown: stimPickShown,
      stimWordShown: stimWordPickShown,
      choiceShownWordStim1: choiceWordPickShown[0],
      choiceShownWordStim2: choiceWordPickShown[1],
      choiceShownWordLeft: choiceShownWordLeft,
      choiceShownWordRight: choiceShownWordRight,

      stimNum: stimNum,
      reversals: reversals,
      stairDir: stairDir,
      responseMatrix: responseMatrix,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0,
    );
  }

  renderFix() {
    console.log("trialNumInBlock Fix: " + this.state.trialNumInBlock);

    var trialTime = Math.round(performance.now());
    console.log("render fix");
    //Show fixation
    this.setState({
      //  instructScreen: false,
      //  taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    console.log("render stim");
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

    setTimeout(
      function () {
        this.renderEncode();
      }.bind(this),
      this.state.stimTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderEncode() {
    var stimTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "encode",
      stimTime: stimTime,
    });

    setTimeout(
      function () {
        this.renderChoice();
      }.bind(this),
      this.state.encodeTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoice() {
    document.addEventListener("keyup", this._handleRespKey);

    var encodeTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.stimTime];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choice",
      encodeTime: encodeTime,
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

    console.log(choice);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
      choiceFbLeft: choiceFbLeft,
      choiceFbRight: choiceFbRight,
    });

    setTimeout(
      function () {
        this.renderConfScale();
      }.bind(this),
      this.state.respFbTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderConfScale() {
    document.addEventListener("keyup", this._handleConfRespKey);

    var initialValue = utils.randomInt(70, 80);

    var respFbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.encodeTime +
          this.state.respTime,
      ];

    this.setState({
      //      instructScreen: false,
      //      taskScreen: true,
      taskSection: "confidence",
      confInitial: initialValue,
      respFbTime: respFbTime,
    });

    // it will deploy the next trial with spacebar keypress
  }

  renderTaskSave() {
    document.removeEventListener("keyup", this._handleConfRespKey);

    console.log("trialNumInBlock Save: " + this.state.trialNumInBlock);

    var prolificID = this.state.prolificID;
    //  var stimPickShown = this.state.stimPickShown.substring(0, 50);
    var stimShown = null;
    var stimPick = null;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      condEasyTrialNum: this.state.condEasyTrialNum,
      condHardTrialNum: this.state.condHardTrialNum,
      blockNum: this.state.blockNum,
      blockCond: this.state.blockCond,

      trialNumInBlock: this.state.trialNumInBlock,
      choicePos: this.state.choicePos,
      choiceCor: this.state.choiceCor,

      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimTime: this.state.stimTime,
      encodeTime: this.state.encodeTime,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      confTime: this.state.confTime,
      responseKey: this.state.responseKey,
      choice: this.state.choice,

      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,

      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      // staircase parameters
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      stimNum: this.state.stimNum,

      stimNumEasy: this.state.stimNumEasy,
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairDirEasy: this.state.stairDirEasy,

      stimNumHard: this.state.stimNumHard,
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairDirHard: this.state.stairDirHard,

      stimPick: stimPick,
      stimWordPick: this.state.stimWordPick,
      stimShown: stimShown,
      stimWordShown: this.state.stimWordShown,

      choiceShownWordStim1: this.state.choiceShownWordStim1,
      choiceShownWordStim2: this.state.choiceShownWordStim2,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
    };

    try {
      fetch(`${DATABASE_URL}/mem_task_data/` + prolificID, {
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

    console.log("trialNum: " + this.state.trialNum);
    console.log("trialNumPerBlock: " + this.state.trialNumPerBlock);
    console.log("trialNumInBlock: " + this.state.trialNumInBlock);
    console.log("trialNumTotal: " + this.state.trialNumTotal);

    if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
      //and not the last trial, because that will be sent to trialReset to end the task
      console.log("TIME FOR A BREAK");
      if (this.state.trialNum !== this.state.trialNumTotal) {
        console.log("REST TIME");
        setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10,
        );
      } else if (this.state.trialNum === this.state.trialNumTotal) {
        // have reached the end of the task but give meta feeling rating one more time
        setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10,
        );
      }
    } else if (this.state.trialNumInBlock !== this.state.trialNumPerBlock) {
      console.log("CONTINUE TIME");
      setTimeout(
        function () {
          this.trialReset();
        }.bind(this),
        10,
      );
    } else {
      console.log("ERROR I HAVENT ACCOUNTED FOR");
    }
  }

  renderRatingSave() {
    var prolificID = this.state.prolificID;
    var task = "memory";

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      quizState: this.state.quizState,
      confInitial: null,
      confLevel: null,
      textTime: this.state.textTime,
      selfKnowledge: this.state.selfKnowledge,
    };

    try {
      fetch(`${DATABASE_URL}/pre_post_conf/` + prolificID, {
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

    //go back to the trials
    setTimeout(
      function () {
        this.contBlock();
      }.bind(this),
      10,
    );
  }

  contBlock() {
    // continue after a block break
    var blockNum = this.state.blockNum + 1;
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "iti",
      trialNumInBlock: 0,
      blockNum: blockNum,
      textTime: 0,
      selfKnowledge: null,
    });

    if (this.state.trialNum === this.state.trialNumTotal) {
      //end the task
      setTimeout(
        function () {
          this.taskEnd();
        }.bind(this),
        10,
      );
    } else {
      //go back to the trials
      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10,
      );
    }
  }

  renderQuizSave() {
    document.removeEventListener("keyup", this._handleGlobalConfKey);
    var prolificID = this.state.prolificID;
    var task = "memory";

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      quizState: this.state.quizState,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      textTime: this.state.textTime,
      selfKnowledge: this.state.selfKnowledge,
    };

    try {
      fetch(`${DATABASE_URL}/pre_post_conf/` + prolificID, {
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

    if (this.state.quizState === "pre") {
      // begin the task
      console.log("BEGIN");
      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10,
      );
    } else if (this.state.quizState === "post") {
      //return to instructions
      this.setState({
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        instructNum: 5,
        taskSection: null,
      });
    }
  }

  restBlock() {
    this.setState({
      instructScreen: true,
      instructNum: 3,
      taskScreen: false,
      taskSection: "break",
    });
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    var condition = this.state.condition;
    var perCorrectPer = this.state.perCorrectPer;
    var memCorrectPer = this.state.correctPer;

    var condUrl;
    if (condition === 1) {
      //Sent to insight to finish
      condUrl = "/Bonus?PROLIFIC_PID=";
    } else {
      //Sent to perception task for part 2
      condUrl = "/PerTut?PROLIFIC_PID=";
    }

    this.props.navigate(condUrl + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        userID: this.state.userID,
        condition: this.state.condition,
        date: this.state.date,
        startTime: this.state.startTime,
        perCorrectPer: perCorrectPer,
        memCorrectPer: memCorrectPer,
      },
    });
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
    });
  }

  renderImages(number, imageArray, className) {
    const imageElements = [];
    for (let i = 0; i < number; i++) {
      const imageSrc = imageArray[i];
      imageElements.push(
        <img key={i} className={className} src={imageSrc} alt="" />,
      );
    }
    return imageElements;
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (
      this.state.instructScreen === true &&
      this.state.taskScreen === false &&
      this.state.quizScreen === false
    ) {
      /*   document.addEventListener("keyup", this._handleInstructKey);
      document.addEventListener("keyup", this._handleBeginKey); */
      text = <div> {this.instructText(this.state.instructNum)}</div>;
      console.log("Page: " + this.state.instructNum);
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === false &&
      this.state.quizScreen === true &&
      this.state.taskSection === "rating"
    ) {
      text = <div> {this.quizText(this.state.quizState)}</div>;
      console.log("Quiz state: " + this.state.quizState);
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "iti"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "fixation"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <br />
          <br />
          <DrawFix />
          <center>
            {this.renderImages(
              this.state.stimNum,
              this.state.stimShown,
              style.stimDisHide,
            )}
          </center>
          <br />
          <br />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "stimulus"
    ) {
      text = (
        <div className={style.boxStyle}>
          <center>Memorise these animals:</center>
          <br />
          <br />
          <center>
            {this.renderImages(
              this.state.stimNum,
              this.state.stimShown,
              style.instructStimDis,
            )}
          </center>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <center></center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "encode"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "choice"
    ) {
      text = (
        <div className={style.boxStyle}>
          <br />
          <br />
          <center>Which animal was shown?</center>
          <br />
          <br />
          <br />
          <br />
          <span className={style.choiceWord} onClick={() => this.handleResp(1)}>
            {this.state.choiceShownWordLeft}
          </span>
          &nbsp;or&nbsp;
          <span className={style.choiceWord} onClick={() => this.handleResp(2)}>
            {this.state.choiceShownWordRight}
          </span>
          <br />
          <br />
          <br />
          <br />
          <center></center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "choiceFeedback"
    ) {
      text = (
        <div className={style.boxStyle}>
          <br />
          <br />
          <center>Which animal was shown?</center>
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
          <center></center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "confidence"
    ) {
      text = (
        <div className={style.boxStyle}>
          <center>
            <br />
            <br />
            Rate your confidence on the probability that your choice was
            correct:
          </center>
          <br />
          <br />
          <br />
          <br />
          <center>
            <ConfSlider.ConfSlider
              callBackValue={this.handleCallbackConf.bind(this)}
              initialValue={this.state.confInitial}
            />
          </center>
          <br />
          <br />
          <br />
          <br />
          <center>
            <button onClick={() => this.handleConfResp(3)}>Next</button>
            <br />
            <br />
            You will not be able to move on unless you have adjusted the scale.
          </center>
        </div>
      );
    } else {
      console.log("ERROR CAN'T FIND THE RIGHT PAGE");
      return null;
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

export default withRouter(MemTask);
