import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";
import * as staircase from "./PerStaircase.jsx";
import * as staircaseEasy from "./PerStaircaseEasy.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import DrawBox from "./drawassets/DrawBox.jsx";
import * as DrawDots from "./drawassets/DrawDots.jsx";
import * as DrawChoice from "./drawassets/DrawChoice.jsx";

import * as ConfSlider from "./drawassets/DrawConfSlider.jsx";
import * as ConfSliderGlobal from "./drawassets/DrawConfSliderGlobal.jsx";

import style from "./style/perTaskStyle.module.css";
import { DATABASE_URL } from "./config.jsx";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK SESSION
// 1) Pre task confidence ratings
// 2) Task with trial by trial conf ratings
// has easy and difficult blocks

class PerTask extends React.Component {
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
      memCorrectPer,
      perCorrectPer,
      dotStairEasy,
      dotStairHard;

    var debug = false; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 1;
      memCorrectPer = 0.9;
      perCorrectPer = 0;
      dotStairEasy = 2;
      dotStairHard = 1;

      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      dotStairEasy = this.props.state.dotStairEasy;
      dotStairHard = this.props.state.dotStairHard;
      memCorrectPer = this.props.state.memCorrectPer;
      perCorrectPer = this.props.state.perCorrectPer;
    }

    // if

    var trialNumTotal = 35; //should be 140, for 7 blocks of 20 trials
    var blockNumTotal = 7; // should be 7
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    var condScrabble = ["easy", "hard", "easy", "hard", "easy", "hard"];
    utils.shuffle(condScrabble);
    var blockCondTotal = ["hard", ...condScrabble];

    //the stim position
    var stimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(stimPos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      prolificID: prolificID,
      condition: condition,
      date: date,
      startTime: startTime,
      section: "task",
      sectionTime: sectionTime,

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 300, //300
      respFbTimeLag: 700,

      //trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      blockCondTotal: blockCondTotal,
      stimPosList: stimPos,
      //  respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      //trial by trial paramters
      blockNum: 1,
      blockCond: null,
      condEasyTrialNum: 0,
      condHardTrialNum: 0,
      trialNum: 0,
      trialNumInBlock: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      stimPos: 0,
      dotDiffLeft: 0,
      dotDiffRight: 0,
      dotDiffStim1: 0,
      dotDiffStim2: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      choice: null,
      confLevel: null,
      confTimeInitial: null, //this is for the global conf time
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

      //dot paramters
      dotRadius: 5,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      dotStair: null, //in log space; this is about 104 dots which is 70 dots shown for the first one
      dotStairLeft: 0,
      dotStairRight: 0,

      correctMatEasy: [], //put correct in vector, to cal perf %
      correctPerEasy: 0,
      responseMatrixEasy: [true, true],
      stairDirEasy: ["up", "up"],
      dotStairEasy: dotStairEasy,

      correctMatHard: [], //put correct in vector, to cal perf %
      correctPerHard: 0,
      responseMatrixHard: [true, true],
      stairDirHard: ["up", "up"],
      dotStairHard: dotStairHard,

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

      // --- MOUSE TRACKING STATE ---
      mouseMovements: [],
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

    // --- Bind Mouse Tracker Event Handler ---
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.ticking = false; // Performance flag for requestAnimationFrame
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }
  // --- MODIFIED MOUSE TRACKING EVENT HANDLER ---
  handleGlobalMouseMove(event) {
    // Check condition: Track ONLY if active trial screen is mounted
    if (this.state.taskScreen && !this.ticking) {
      window.requestAnimationFrame(() => {
        // Calculate timestamp relative to when this specific individual trial began
        const relativeTime = Math.round(
          performance.now() - this.state.trialTime,
        );

        // Maps section keys to short IDs to keep character count down
        // i = iti, f = fixation, s = stimulus, c = choice, fb = choiceFeedback, conf = confidence
        let sectionTag = "unmapped";
        if (this.state.taskSection === "iti") sectionTag = "i";
        else if (this.state.taskSection === "fixation") sectionTag = "f";
        else if (this.state.taskSection === "stimulus") sectionTag = "s";
        else if (this.state.taskSection === "choice") sectionTag = "c";
        else if (this.state.taskSection === "choiceFeedback") sectionTag = "fb";
        else if (this.state.taskSection === "confidence") sectionTag = "conf";

        const currentCoord = {
          x: event.clientX,
          y: event.clientY,
          t: relativeTime,
          p: sectionTag, // 'p' for Phase property
        };

        this.setState((prevState) => ({
          mouseMovements: [...prevState.mouseMovements, currentCoord],
        }));

        this.ticking = false;
      });
      this.ticking = true;
    }
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

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 2) {
      this.setState({
        quizState: "pre",
      });

      //  console.log("pre-conf begin");
      setTimeout(
        function () {
          this.quizBegin();
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

  handleGlobalConf(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.quizScreen === true &&
      this.state.confLevel !== null
    ) {
      var confTime = timePressed - this.state.confTimeInitial;

      this.setState({
        confTime: confTime,
      });

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
      (this.state.trialTime + this.state.fixTime + this.state.stimTime);

    var choice;
    if (keyPressed === 1) {
      choice = "left";
    } else if (keyPressed === 2) {
      choice = "right";
    } else {
      choice = null;
      //  console.log("No response made!");
    }

    var correct;
    var response;
    if (this.state.dotDiffLeft > this.state.dotDiffRight && choice === "left") {
      response = true;
      correct = 1;
    } else if (
      this.state.dotDiffLeft < this.state.dotDiffRight &&
      choice === "right"
    ) {
      response = true;
      correct = 1;
    } else {
      response = false;
      correct = 0;
    }

    var correctPerHard;
    var correctPerEasy;
    var correctMatHard;
    var correctMatEasy;
    var responseMatrixHard;
    var responseMatrixEasy;
    var stairDirEasy;
    var stairDirHard;

    var blockCond = this.state.blockCond;
    if (blockCond === "easy") {
      correctMatEasy = this.state.correctMatEasy.concat(correct);
      correctPerEasy =
        Math.round((utils.getAvg(correctMatEasy) + Number.EPSILON) * 100) / 100; //2 dec pl
      responseMatrixEasy = this.state.responseMatrixEasy.concat(response);
      stairDirEasy = this.state.stairDir;

      responseMatrixHard = this.state.responseMatrixHard;
      correctPerHard = this.state.correctPerHard;
      correctMatHard = this.state.correctMatHard;
      stairDirHard = this.state.stairDirHard;
    } else if (blockCond === "hard") {
      correctMatHard = this.state.correctMatHard.concat(correct);
      correctPerHard =
        Math.round((utils.getAvg(correctMatHard) + Number.EPSILON) * 100) / 100; //2 dec pl
      responseMatrixHard = this.state.responseMatrixHard.concat(response);
      stairDirHard = this.state.stairDir;

      responseMatrixEasy = this.state.responseMatrixEasy;
      correctPerEasy = this.state.correctPerEasy;
      correctMatEasy = this.state.correctMatEasy;
      stairDirEasy = this.state.stairDirEasy;
    }

    //  console.log("response: " + response);
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

      responseMatrixEasy: responseMatrixEasy,
      correctMatEasy: correctMatEasy,
      correctPerEasy: correctPerEasy,
      stairDirEasy: stairDirEasy,

      responseMatrixHard: responseMatrixHard,
      correctMatHard: correctMatHard,
      correctPerHard: correctPerHard,
      stairDirHard: stairDirHard,
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
      //  console.log("conf level: " + this.state.confLevel);
      var confTime =
        timePressed -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
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
          The spaceship&apos;s power is dropping low - we need your help to sort
          the battery cards quickly!
          <br /> <br />
          You will have {this.state.trialNumTotal} set pairs of battery cards to
          make your decisions. This will be split over{" "}
          {this.state.blockNumTotal} sections with {this.state.trialNumPerBlock}{" "}
          sets of batteries each so that you can take breaks in between.
          <br /> <br />
          Click on the battery card with the higher charge to select it.
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
          You will not be allowed to move on to the next set of batteries if you
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
          You have completed sorting through all of the battery cards!
          <br />
          <br />
          <center>
            <button onClick={() => this.handleBegin(3)}>
              <strong>Continue</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          Whew! Our spaceship power is now back to a good level, thanks to the
          high charge battery cards that you have selected.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleBegin(3)}>
              <strong>Continue</strong>
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
          Before we begin, out of {this.state.trialNumTotal} set pairs of
          battery cards, how many times do you think you will choose the higher
          charge battery card correctly?
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
          Click or drag the indicator anywhere on the scale.
          <br />
          <br />
          <button onClick={() => this.handleGlobalConf(3)}>
            <strong>Submit & Continue</strong>
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
          After going through all the {this.state.trialNumTotal} set pairs of
          battery cards, how many times do you think you selected all the higher
          charge battery cards correctly?
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
            <strong>Submit & Continue</strong>
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
    //randomise the pre-post initial conf value - this has changed to a scale of 0 to 150
    var initialValue = utils.randomInt(60, 90);
    var confTimeInitial = Math.round(performance.now());

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      confTimeInitial: confTimeInitial,
      confTime: null,
      //  confMove: null,
      quizScreen: true,
      instructScreen: false,
      taskScreen: false,
      taskSection: "rating",
    });
  }

  taskBegin() {
    var blockCond = this.state.blockCondTotal[this.state.blockNum - 1];
    console.log(this.state.blockCondTotal);
    console.log(blockCond);

    if (blockCond == "easy") {
      this.setState({
        blockCond: blockCond,
        dotStair: this.state.dotStairEasy,
      });
    } else if (blockCond == "hard") {
      this.setState({
        blockCond: blockCond,
        dotStair: this.state.dotStairHard,
      });
    }

    // push to render fixation for the first trial
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10,
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
    var stimPos = this.state.stimPosList[trialNum - 1]; //shuffle the order for the dotDiffLeft
    var condEasyTrialNum = this.state.condEasyTrialNum;
    var condHardTrialNum = this.state.condHardTrialNum;

    console.log(this.state.blockCond);
    if (this.state.blockCond == "easy") {
      condEasyTrialNum = condEasyTrialNum + 1; //trialNum is 0, so it starts from 1
      // run staircase
      var s2 = staircaseEasy.staircase(
        this.state.dotStairEasy,
        this.state.responseMatrixEasy,
        this.state.stairDirEasy,

        this.state.dotStair,
        this.state.responseMatrix,
        this.state.stairDir,

        condEasyTrialNum,
      );
    } else if (this.state.blockCond == "hard") {
      condHardTrialNum = condHardTrialNum + 1;
      var s2 = staircase.staircase(
        this.state.dotStairHard,
        this.state.responseMatrixHard,
        this.state.stairDirHard,
        condHardTrialNum,

        this.state.dotStair,
        this.state.responseMatrix,
        this.state.stairDir,
        condEasyTrialNum,
      );
    }

    var dotStair = s2.diff;
    var stairDir = s2.direction;
    var responseMatrix = s2.stepcount;

    var reversals;
    if (s2.reversal) {
      // Check for reversal. If true, add one to reversals variable
      reversals = 1;
    } else {
      reversals = 0;
    }

    var dotDiffLeft;
    var dotDiffRight;
    var dotStairLeft;
    var dotStairRight;

    if (stimPos === 1) {
      dotStairLeft = dotStair;
      dotStairRight = 0;
      dotDiffLeft = Math.round(Math.exp(dotStairLeft));
      dotDiffRight = dotStairRight; //should be 0
    } else {
      dotStairLeft = 0;
      dotStairRight = dotStair;
      dotDiffLeft = dotStairLeft; //should be 0
      dotDiffRight = Math.round(Math.exp(dotStairRight));
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
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      confInitial: null,
      confLevel: null,
      confTime: 0,
      //  confMove: false,
      choice: null,
      correct: null,
      correctPer: null,
      stimPos: stimPos,
      reversals: reversals,
      stairDir: stairDir,
      responseMatrix: responseMatrix,
      //Calculate the for the paramters for the stim
      dotDiffStim1: Math.round(Math.exp(dotStair)),
      dotDiffStim2: 0,
      dotStair: dotStair,
      dotStairLeft: dotStairLeft,
      dotStairRight: dotStairRight,
      dotDiffLeft: dotDiffLeft,
      dotDiffRight: dotDiffRight,
      mouseMovements: [],
    });

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0,
    );
  }

  renderFix() {
    //console.log("trialNumInBlock Fix: " + this.state.trialNumInBlock);

    var trialTime = Math.round(performance.now());
    //  console.log("render fix");
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
    //  console.log("render stim");
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

    //  console.log("trialNumInBlock Save: " + this.state.trialNumInBlock);
    if (this.state.blockCond == "easy") {
      this.setState({
        dotStairEasy: this.state.dotStair,
      });
    } else if (this.state.blockCond == "hard") {
      this.setState({
        dotStairHard: this.state.dotStair,
      });
    }

    setTimeout(
      function () {
        this.renderChoice();
      }.bind(this),
      this.state.stimTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoice() {
    //  document.addEventListener("keyup", this._handleRespKey);
    var stimTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime];

    this.setState({
      //  instructScreen: false,
      //  taskScreen: true,
      taskSection: "choice",
      stimTime: stimTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    //  document.removeEventListener("keyup", this._handleRespKey);

    this.setState({
      //    instructScreen: false,
      //    taskScreen: true,
      taskSection: "choiceFeedback",
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
    // document.removeEventListener("keyup", this._handleConfRespKey);

    var prolificID = this.state.prolificID;
    var blockCond = this.state.blockCond;

    //before it switch to the difficult staircase, save the dotStairEasy level
    if (blockCond == "easy") {
      this.setState({
        dotStairEasy: this.state.dotStair,
      });
    } else if (blockCond == "hard") {
      //before finish the hard one, save that too
      this.setState({
        dotStairHard: this.state.dotStair,
      });
    }

    // Downsample processing logic to keep character count below DB limits
    var sampleRate = 3;
    var downsampledMovements = this.state.mouseMovements.filter(
      (_, index) => index % sampleRate === 0,
    );

    // Compressed string template outputs format: "x,y,t,phase|x,y,t,phase"
    var compressedMovements = downsampledMovements
      .map((m) => `${m.x},${m.y},${m.t},${m.p}`)
      .join("|");

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      blockNum: this.state.blockNum,
      blockCond: this.state.blockCond,
      condEasyTrialNum: this.state.condEasyTrialNum,
      condHardTrialNum: this.state.condHardTrialNum,
      trialNumInBlock: this.state.trialNumInBlock,

      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimTime: this.state.stimTime,
      stimPos: this.state.stimPos,
      dotDiffLeft: this.state.dotDiffLeft,
      dotDiffRight: this.state.dotDiffRight,
      dotDiffStim1: this.state.dotDiffStim1,
      dotDiffStim2: this.state.dotDiffStim2,
      responseKey: this.state.responseKey,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      choice: this.state.choice,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      confTime: this.state.confTime,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,

      // staircase parameters
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      dotStair: this.state.dotStair,

      dotStairEasy: this.state.dotStairEasy,
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairDirEasy: this.state.stairDirEasy,

      dotStairHard: this.state.dotStairHard,
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairDirHard: this.state.stairDirHard,

      dotStairLeft: this.state.dotStairLeft,
      dotStairRight: this.state.dotStairRight,

      moveMovements: compressedMovements,
    };

    try {
      fetch(`${DATABASE_URL}/per_task_data/` + prolificID, {
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

    //  console.log("trialNum: " + this.state.trialNum);
    //  console.log("trialNumPerBlock: " + this.state.trialNumPerBlock);
    //  console.log("trialNumInBlock: " + this.state.trialNumInBlock);
    //  console.log("trialNumTotal: " + this.state.trialNumTotal);

    if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
      //and not the last trial, because that will be sent to trialReset to end the task
      //  console.log("TIME FOR A BREAK");
      if (this.state.trialNum !== this.state.trialNumTotal) {
        //      console.log("REST TIME");
        setTimeout(
          function () {
            this.restBlock(); // in between block
          }.bind(this),
          10,
        );
      } else if (this.state.trialNum === this.state.trialNumTotal) {
        // have reached the end of the task - but do last rating!
        //    console.log("END TASK");
        setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10,
        );
      }
    } else if (this.state.trialNumInBlock !== this.state.trialNumPerBlock) {
      //  console.log("CONTINUE TIME");
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
    var task = "perception";

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      blockNum: this.state.blockNum,
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
    //  document.removeEventListener("keyup", this._handleGlobalConfKey);
    var prolificID = this.state.prolificID;
    var task = "perception";

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      blockNum: null,
      quizState: this.state.quizState,
      //  confTimeInitial: this.state.confTimeInitial,
      //  confTime: this.state.confTime,
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
      //  console.log("BEGIN");
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
    //  document.removeEventListener("keyup", this._handleInstructKey);
    // document.removeEventListener("keyup", this._handleBeginKey);

    var condition = this.state.condition;
    var perCorrectPer = this.state.correctPer;
    var memCorrectPer = this.state.memCorrectPer;

    var condUrl;
    if (condition === 1) {
      //Sent to memory task for part 2
      condUrl = "/MemPreTut?PROLIFIC_PID=";
    } else {
      //Sent to insight page
      condUrl = "/Bonus?PROLIFIC_PID=";
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
    // --- Attach mouse listener when screen loads ---
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    // --- Clean up listener to prevent catastrophic memory leaks ---
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (
      this.state.instructScreen === true &&
      this.state.taskScreen === false &&
      this.state.quizScreen === false
    ) {
      //  document.addEventListener("keyup", this._handleInstructKey);
      //  document.addEventListener("keyup", this._handleBeginKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
      //    console.log("Page: " + this.state.instructNum);
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === false &&
      this.state.quizScreen === true &&
      this.state.taskSection === "rating"
    ) {
      text = <div> {this.quizText(this.state.quizState)}</div>;
      //    console.log("Quiz state: " + this.state.quizState);
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
        <div className={style.boxStyle}>
          <DrawFix />
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
          <DrawDots.DrawDots
            dotRadius={this.state.dotRadius}
            dotDiffLeft={this.state.dotDiffLeft}
            dotDiffRight={this.state.dotDiffRight}
          />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "choice"
    ) {
      text = (
        <div className={style.boxStyle}>
          <DrawBox onBoxClick={this.handleResp} />
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
          <DrawChoice.DrawChoice choice={this.state.choice} />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.quizScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "confidence"
    ) {
      text = (
        <div>
          <center>
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
            <button onClick={() => this.handleConfResp(3)}>
              <strong>Continue</strong>
            </button>
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

export default withRouter(PerTask);
