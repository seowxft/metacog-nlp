import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";
import * as staircase from "./PerStaircase.jsx";
import * as staircaseEasy from "./PerStaircaseEasy.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import DrawBox from "./drawassets/DrawBox.jsx";
import * as DrawDots from "./drawassets/DrawDots.jsx";
import * as DrawChoice from "./drawassets/DrawChoice.jsx";
import * as DrawCorFeedback from "./drawassets/DrawCorFeedback.jsx";

import * as DrawDotsEx from "./drawassets/DrawDotsExample.jsx";
import * as ConfSliderEx from "./drawassets/DrawConfSliderExample.jsx";
import * as ConfSliderGlobal from "./drawassets/DrawConfSliderGlobal.jsx";

import style from "./style/perTaskStyle.module.css";

import astrodude from "./img/astronaut.png";

import { DATABASE_URL } from "./config.jsx";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSION + QUIZ FOR THE TASK
// Session includes:
// 1) Introduction to cover story
// 2) 2 examples, then global confidence rating
// 3) Practice on left/right box with feedback
// 4) Instructions to confidence rating
// 5) Quiz on instructions
// 6) If quiz fail once, bring to instructions on confidence, if fail twice, bring to the start of instructions
//theres two staircases - easy and hard to get the starting dot diff for the different conditions

class PerTut extends React.Component {
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
      perCorrectPer;

    var debug = true; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 1;
      memCorrectPer = 0.9;
      perCorrectPer = 0;
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

    var exampleNumTotal = 2;
    var trialNumTotal = 26; //26
    var blockCondTotal = ["easy", "hard"];
    var trialStaircaseSwitch = Math.round(trialNumTotal / 2);

    //the stim position
    var pracStimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(pracStimPos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      debug: debug,
      // demo paramters
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      //section paramters
      sectionTime: sectionTime,
      section: "tutorial",

      // trial timings in ms
      fixTimeLag: 1000, //1000
      fbTimeLag: 500, //500
      stimTimeLag: 300, //300
      respFbTimeLag: 700, //

      //trial parameters
      exampleNumTotal: exampleNumTotal,
      trialNumTotal: trialNumTotal,
      blockCondTotal: blockCondTotal,
      trialStaircaseSwitch: trialStaircaseSwitch,
      stimPosList: pracStimPos,
      //   respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O
      tutorialTry: 1,

      //trial by trial paramters
      trialNum: 0,
      blockCond: null,
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
      rewFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,
      confInitial: null,
      confMove: null, //can only move to next trial if conf was toggled
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      gConfState: "pre",

      dotStairLeft: 0,
      dotStairRight: 0,
      //dot paramters
      dotRadius: 5,

      // staircase parameters (moved to tutorBegin due to example trials coming first)
      responseMatrix: [],
      reversals: 0,
      stairDir: null,
      dotStair: null,

      dotStairLeft: 0,
      dotStairRight: 0,

      correctMatEasy: [], //put correct in vector, to cal perf %
      correctPerEasy: 0,
      responseMatrixEasy: [],

      stairDirEasy: null,
      dotStairEasy: null,
      correctMatHard: [], //put correct in vector, to cal perf %
      correctPerHard: 0,
      responseMatrixHard: [],
      stairDirHard: null,
      dotStairHard: null,

      //quiz paramters
      quizTry: 1,
      quizNumTotal: 4,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [2, 1, 2, 3],

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1
      taskScreen: false,
      taskSection: null,
      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
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
    this.handleNextResp = this.handleNextResp.bind(this);
    this.handleQuizResp = this.handleQuizResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);
    this.globalConfText = this.globalConfText.bind(this);

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
        if (this.state.taskSection === "gConf") sectionTag = "r";

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
    } else if (
      whichButton === 1 &&
      curInstructNum >= 8 &&
      curInstructNum <= 11
    ) {
      // from page 8 to 11, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 7 &&
      curInstructNum <= 10
    ) {
      // from page 7 to 10, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 5) {
      setTimeout(
        function () {
          this.gConfBegin();
        }.bind(this),
        0,
      );
    } else if (whichButton === 3 && curInstructNum === 6) {
      setTimeout(
        function () {
          this.tutorBegin();
        }.bind(this),
        0,
      );
    } else if (whichButton === 3 && curInstructNum === 11) {
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        0,
      );
    } else if (whichButton === 3 && curInstructNum === 12) {
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
    if (whichButton === 3 && this.state.confLevel !== null) {
      var confTime = timePressed - this.state.confTimeInitial;

      this.setState({
        confTime: confTime,
      });

      setTimeout(
        function () {
          this.renderGConfSave();
        }.bind(this),
        0,
      );
    }
  }

  handleResp(keyPressed) {
    var timePressed = Math.round(performance.now());
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
    // correct and response is the same thing, response is just in boolean for the responseMat
    if (this.state.dotDiffLeft > this.state.dotDiffRight && choice === "left") {
      response = true;
      correct = 1;
    } else if (
      this.state.dotDiffLeft < this.state.dotDiffRight &&
      choice === "right"
    ) {
      response = true;
      correct = 1;
    } else if (this.state.dotDiffLeft === this.state.dotDiffRight) {
      // in the odd case where the dot diff is the same...
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

  handleNextResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (whichButton === 3) {
      var rewFbTime =
        Math.round(performance.now()) -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        rewFbTime: rewFbTime,
      });

      document.removeEventListener("keyup", this._handleNextRespKey);
      setTimeout(
        function () {
          this.renderTutorSave();
        }.bind(this),
        0,
      );
    }
  }

  handleQuizResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    var quizNum = this.state.quizNum;
    var whichButton = keyPressed;

    var quizTime = timePressed - this.state.trialTime;

    var quizCorTotal = this.state.quizCorTotal;
    var quizCor;

    // calculate if quiz was correct or not
    if (whichButton === this.state.quizAns[quizNum - 1]) {
      quizCorTotal = quizCorTotal + 1;
      quizCor = 1;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizCorTotal: quizCorTotal,
        quizTime: quizTime,
      });
    } else {
      //if was incorrect
      quizCor = 0;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizTime: quizTime,
      });
    }

    setTimeout(
      function () {
        this.renderQuizSave();
      }.bind(this),
      0,
    );
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confValue: callBackValue });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let text;
    let text2;
    let taskCond;

    //If fail quiz once, this brings me to instruct before confidence
    if (this.state.quizTry === 2 && this.state.quizTry === 3) {
      text2 = (
        <span>
          You scored {this.state.quizCorTotal}/{this.state.quizNumTotal} on the
          quiz. Please read the instructions carefully.
          <br />
          <br />
          Your task is to choose the battery card with the{" "}
          <strong>higher charge level, i.e., more number of white dots</strong>.
        </span>
      );
    }
    //If fail quiz more than once, this brings me to the beginning of the instruct
    else if (this.state.quizTry >= 4) {
      text = (
        <span>
          You scored {this.state.quizCorTotal}/{this.state.quizNumTotal} on the
          quiz. We will restart the tutorial. Please read the instructions
          carefully.
          <br />
          <br />
        </span>
      );

      text2 = (
        <span>
          Well done!
          <br />
          <br />
          You saw that choosing the battery card with the higher charge level,
          i.e., more number of white dots was the correct answer.
        </span>
      );
    }

    if (this.state.condition === 1) {
      taskCond = (
        <span>
          Welcome to spaceship!
          <br /> <br />
          The ship has been damaged with an asteriod hit and we are glad you are
          here to help.
          <br />
          <br />
          We have found that the spaceship is running low on power.
        </span>
      );
    } else {
      taskCond = (
        <span>
          After we settled the animals, we attempted to restart the spaceship.
          Unforunately, we have found that it is running low on power!
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        <span>
          {text}
          {taskCond}
          <br />
          <br />
          We need you to replace the battery cards fueling the spaceship.
          However, the new battery cards have different charge levels - we need
          your assistance in selecting the ones with{" "}
          <strong>high charge</strong> for use.
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={200} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>A battery card looks like this:</span>
        <br />
        <br />
        <span>
          <center>
            <DrawDotsEx.DrawDotsEx1
              dotRadius={this.state.dotRadius}
              dotDiff={80}
            />
          </center>
        </span>
        <br />
        <span>
          The white dots indicate the charge level of the battery card. The more
          white dots on the card, the higher the charge.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>{" "}
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          As there are many new battery cards to go through, we will show you
          two cards at one time. You will have to choose the battery card which
          has <strong>the higher charge</strong>, i.e., the one with{" "}
          <strong>more white dots</strong>. For instance:
        </span>
        <br />
        <br />
        <span>
          <center>
            <DrawDotsEx.DrawDotsEx2
              dotRadius={this.state.dotRadius}
              dotDiffLeft={0}
              dotDiffRight={100}
            />
          </center>
        </span>
        <br />
        <br />
        <span>
          The battery card on the <strong>right</strong> has a higher charge
          than the battery card on the left - this is the card you should
          select.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>{" "}
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          You can select the battery card that has more charge with a click on
          it.
          <br />
          <br />
          Your selected battery card will be outlined in{" "}
          <font color="#87C1FF">
            <strong>light blue</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>correct</strong>, the card that you selected will
          have its outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the box that you selected will
          have its outline turn{" "}
          <font color="red">
            <strong>red</strong>
          </font>
          .
          <br />
          <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>{" "}
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          For every choice, you will be presented with a white cross in the
          middle of the screen first before the battery cards appear. Please pay
          attention closely as the charge level indicator (white dots) of the
          battery cards will be <strong>flashed quickly only once</strong>. Make
          your selection{" "}
          <strong>after the charge level indicator disappears</strong>
          .
          <br />
          <br />
          To show you what to expect, we will now show you 2 quick examples.
          This is just to give you a feel for the pace, so you do not need to
          worry about getting it correct right now.
          <br />
          <br />
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

    let instruct_text6 = (
      <div>
        <span>
          Now that you are familiar with the pace, let&apos;s start a practice
          phase. Here, we will tell you whether your choices are right or wrong.
          <br />
          <br />
          You will have {this.state.trialNumTotal} chances to choose the battery
          card with the higher charge.
          <br />
          <br />
          Please respond quickly and to the best of your ability - the
          spaceship&apos;s power depends on it!
          <br />
          <br />
          As a reminder:
          <br />
          <br />
          Click on the battery card that has more charge.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleBegin(3)}>
              <strong>BEGIN</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text7 = (
      <div>
        <span>
          {text2}
          <br />
          <br />
          During the main task, you will also have to indicate your{" "}
          <strong>confidence</strong> in your choice of the battery card you
          pick.
          <br />
          <br />
          After every choice, we will show you a rating scale to rate the{" "}
          <strong>probability that your choice was correct</strong>:
          <br />
          <br />
          <br />
          <br />
          <center>
            <ConfSliderEx.ConfSliderEx1
              callBackValue={this.handleCallbackConf.bind(this)}
              initialValue={68}
            />
          </center>
          <br />
          <br />
          <br />
          <center>
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text8 = (
      <div>
        If you are <strong>very unsure</strong> that you made a correct
        judgement, you should select a 50% chance of being correct, or the{" "}
        <strong>left</strong> end of the scale. It means that your choice was a
        complete guess.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx2
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={50}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <button onClick={() => this.handleInstruct(1)}>
            <strong>← Back</strong>
          </button>{" "}
          <button onClick={() => this.handleInstruct(2)}>
            <strong>Next →</strong>
          </button>
        </center>
      </div>
    );

    let instruct_text9 = (
      <div>
        If you are <strong>very sure</strong> that you made a correct judgement,
        you should select a 100% chance of being correct, or the{" "}
        <strong>right</strong> end of the scale. It means that you are
        absolutely certain that your choice was correct.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx3
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={100}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <button onClick={() => this.handleInstruct(1)}>
            <strong>← Back</strong>
          </button>{" "}
          <button onClick={() => this.handleInstruct(2)}>
            <strong>Next →</strong>
          </button>
        </center>
      </div>
    );

    let instruct_text10 = (
      <div>
        If you are <strong>somewhat sure</strong> that you made a correct
        judgement, you should select a rating between the two ends of the scale.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx4
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={75}
          />
        </center>
        <br />
        <br />
        You can use the slider by <strong>clicking any point</strong> along the
        scale, or <strong>dragging the circle indicator</strong> along the
        scale.
        <br />
        <br />
        During the main task, once you have selected your rating, you will have
        to press the [Continue] button to confirm it and move on to the next set
        of battery cards.
        <br />
        <br />
        <center>
          <button onClick={() => this.handleInstruct(1)}>
            <strong>← Back</strong>
          </button>{" "}
          <button onClick={() => this.handleInstruct(2)}>
            <strong>Next →</strong>
          </button>
        </center>
      </div>
    );

    let instruct_text11 = (
      <div>
        Before you begin, you have to pass a quick quiz to make sure that you
        have understood the key points of your task for today.
        <br />
        <br />
        Note: You will have to get <strong>all</strong> quiz questions correct.
        If not, you will be sent back to the instructions and will have to
        retake the quiz!
        <br />
        <br />
        If you fail too many times, you will be brought to the beginning of the
        entire tutorial.
        <br />
        <br />
        <center>
          <button onClick={() => this.handleInstruct(1)}>
            <strong>← Back</strong>
          </button>{" "}
          <button onClick={() => this.handleBegin(3)}>
            <strong>BEGIN</strong>
          </button>
        </center>
      </div>
    );

    let instruct_text12 = (
      <div>
        Amazing! You scored {this.state.quizCorTotal}/{this.state.quizNumTotal}{" "}
        for the quiz.
        <br />
        <br />
        You are ready to start the main task.
        <br />
        <br />
        <center>
          <button onClick={() => this.handleBegin(3)}>
            <strong>BEGIN</strong>
          </button>
        </center>
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
      case 7:
        return <div>{instruct_text7}</div>;
      case 8:
        return <div>{instruct_text8}</div>;
      case 9:
        return <div>{instruct_text9}</div>;
      case 10:
        return <div>{instruct_text10}</div>;
      case 11:
        return <div>{instruct_text11}</div>;
      case 12:
        return <div>{instruct_text11}</div>;
      default:
    }
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  globalConfText(globalConfState) {
    let gConf_text1 = (
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

    switch (globalConfState) {
      case "pre":
        return <div>{gConf_text1}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// QUIZ TEXT ////
  // Do I need to randomise this?

  quizText(quizNum) {
    let quiz_text1 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You are shown two battery cards
        to inspect. What do you do?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I choose the
        battery card with the lower number of dots.
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I choose the
        battery card with the higher number of dots.
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I choose
        both battery cards when they have same number of dots.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    let quiz_text2 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You have made your choice on the
        battery card with the higher charge. However, you are{" "}
        <strong>very unsure</strong> about your choice. How would you rate your
        confidence on the rating scale?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I would pick
        the left end of the scale (50% correct).
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I would pick
        the right end of the scale (100% correct).
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I would pick
        somwhere in between the ends of the scale.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    let quiz_text3 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> On the next set of battery
        cards, you are <strong>very sure</strong> about your choice. How would
        you rate your confidence on the rating scale?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I would pick
        the left end of the scale (50% correct).
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I would pick
        the right end of the scale (100% correct).
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I would pick
        somwhere in between the ends of the scale.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    let quiz_text4 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> On the next set of battery
        cards, you are <strong>somewhat sure</strong> about your choice. How
        would you rate your confidence on the rating scale?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I would pick
        the left end of the scale (50% correct).
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I would pick
        the right end of the scale (100% correct).
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I would pick
        somwhere in between the ends of the scale.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    switch (quizNum) {
      case 1:
        return <div>{quiz_text1}</div>;
      case 2:
        return <div>{quiz_text2}</div>;
      case 3:
        return <div>{quiz_text3}</div>;
      case 4:
        return <div>{quiz_text4}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  gConfBegin() {
    //randomise the pre-post initial conf value - this has changed to a scale of 0 to 150
    var initialValue = utils.randomInt(60, 90);
    var confTimeInitial = Math.round(performance.now());

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      confTimeInitial: confTimeInitial,
      confTime: null,
      instructScreen: false,
      taskScreen: true,
      taskSection: "gConf",
      mouseMovements: [],
    });
  }

  exampleBegin() {
    console.log("Are we even hitting here yet?");
    this.setState({
      trialNum: 0,
    });

    setTimeout(
      function () {
        this.trialExample();
      }.bind(this),
      0,
    );
  }

  exampleEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 6,
      taskSection: null,
    });
  }

  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialExample() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var stimPos = Math.random() < 0.5 ? 1 : 2;
    var dotStair = 6;

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
      taskSection: "iti",
      trialNum: trialNum,
      blockCond: 0,
      fixTime: 0,
      stimTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      confLevel: null,
      confTime: 0,
      confMove: false,
      choice: null,
      correct: null,
      correctPer: null,
      stimPos: stimPos,
      reversals: null,
      responseMatrix: null,
      stairDir: null,

      //Calculate the for the paramters for the stim
      dotDiffStim1: Math.round(Math.exp(dotStair)),
      dotDiffStim2: 0,
      dotStair: dotStair,

      dotStairLeft: dotStairLeft,
      dotStairRight: dotStairRight,
      dotDiffLeft: dotDiffLeft,
      dotDiffRight: dotDiffRight,
    });

    if (trialNum < this.state.exampleNumTotal + 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0,
      );
    } else {
      // if the trials have reached the total trial number
      setTimeout(
        function () {
          this.exampleEnd();
        }.bind(this),
        0,
      );
    }
  }

  tutorBegin() {
    this.setState({
      //trial by trial paramters
      trialNum: 0,
      blockCond: null,
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
      rewFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,
      confInitial: null,
      confMove: null, //can only move to next trial if conf was toggled
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      dotStairLeft: 0,
      dotStairRight: 0,

      // staircase parameters
      responseMatrix: [],
      reversals: 0,
      stairDir: ["up", "up"],
      dotStair: 4.65, //in log space; this is about 104 dots which is 70 dots shown for the first one

      dotStairLeft: 0,
      dotStairRight: 0,

      correctMatEasy: [], //put correct in vector, to cal perf %
      correctPerEasy: 0,
      responseMatrixEasy: [],

      stairDirEasy: ["up", "up"],
      dotStairEasy: 4.65,
      correctMatHard: [], //put correct in vector, to cal perf %
      correctPerHard: 0,
      responseMatrixHard: [],
      stairDirHard: ["up", "up"],
      dotStairHard: 4.65,
    });

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      0,
    );
  }

  tutorEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 7,
      taskSection: null,
    });
  }

  quizBegin() {
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "quiz",
      quizPressed: null,
      quizNum: 1,
      quizCorTotal: 0,
      quizCor: null,
    });
  }

  quizReset() {
    var quizNum = this.state.quizNum;
    var quizCorTotal = this.state.quizCorTotal;
    var trialTime = Math.round(performance.now());

    if (quizNum < this.state.quizNumTotal) {
      //go to next quiz qn
      this.setState({
        quizNum: quizNum + 1,
        trialTime: trialTime,
      });
    } else if (quizNum === this.state.quizNumTotal) {
      //  document.removeEventListener("keyup", this._handleQuizKey);
      //end quiz, head back to instructions
      var quizTry = this.state.quizTry;
      var tutorialTry = this.state.tutorialTry;
      //if full marks
      if (quizCorTotal === this.state.quizNumTotal) {
        //  console.log("PASS QUIZ");
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 11,
          taskSection: "instruct",
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry < 4) {
        //if they got one wrong
        //  console.log("FAIL QUIZ");
        quizTry = quizTry + 1;

        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 7,
          taskSection: "instruct",
          quizTry: quizTry,
        });
      } else {
        //if they got more than one wrong
        tutorialTry = tutorialTry + 1;
        //  console.log("FAIL QUIZ");
        quizTry = quizTry + 1;
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 1,
          taskSection: "instruct",
          quizTry: quizTry,
          tutorialTry: tutorialTry,
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var stimPos = this.state.stimPosList[trialNum - 1]; //shuffle the order for the dotDiffLeft

    var stimNum = this.state.stimNum;
    var stairDir = this.state.stairDir;
    var responseMatrix = this.state.responseMatrix;

    // run staircase
    var blockCond;
    var s2;

    if (trialNum < this.state.trialStaircaseSwitch) {
      console.log("in here easy");
      console.log(this.state.stimNumEasy);
      console.log(this.state.responseMatrixEasy);
      console.log(this.state.stairDirEasy);

      blockCond = this.state.blockCondTotal[0];

      s2 = staircaseEasy.staircase(
        this.state.stimNumEasy,
        this.state.responseMatrixEasy,
        this.state.stairDirEasy,
        trialNum,
      );
      stimNum = s2.stimNum;
      stairDir = s2.direction;
      responseMatrix = s2.stepcount;

      console.log(blockCond);
    } else if (trialNum >= this.state.trialStaircaseSwitch) {
      console.log("in here hard");
      blockCond = this.state.blockCondTotal[1];

      s2 = staircase.staircase(
        this.state.stimNumHard,
        this.state.responseMatrixHard,
        this.state.stairDirHard,
        trialNum - this.state.trialStaircaseSwitch + 1,
      );

      stimNum = s2.stimNum;
      stairDir = s2.direction;
      responseMatrix = s2.stepcount;
    }

    console.log("stimNum: " + stimNum);
    console.log("stairDir: " + stairDir);
    console.log("responseMat: " + responseMatrix);

    var reversals = s2 && s2.reversal ? 1 : 0;

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
      taskSection: "iti",
      trialNum: trialNum,
      blockCond: blockCond,
      fixTime: 0,
      stimTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      confLevel: null,
      confTime: 0,
      confMove: false,
      choice: null,
      correct: null,
      correctPer: null,
      stimPos: stimPos,
      reversals: reversals,
      responseMatrix: responseMatrix,
      stairDir: stairDir,

      //Calculate the for the paramters for the stim
      dotDiffStim1: Math.round(Math.exp(dotStair)),
      dotDiffStim2: 0,
      dotStair: dotStair,

      dotStairLeft: dotStairLeft,
      dotStairRight: dotStairRight,
      dotDiffLeft: dotDiffLeft,
      dotDiffRight: dotDiffRight,
    });

    //  console.log(this.state.trialNum);
    //  console.log(this.state.trialNumTotal);

    if (trialNum < this.state.trialNumTotal + 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0,
      );
    } else {
      // if the trials have reached the total trial number
      setTimeout(
        function () {
          this.tutorEnd();
        }.bind(this),
        0,
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
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

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
      instructScreen: false,
      taskScreen: true,
      taskSection: "choice",
      stimTime: stimTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    // document.removeEventListener("keyup", this._handleRespKey);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
    });

    setTimeout(
      function () {
        this.renderCorFb();
      }.bind(this),
      this.state.respFbTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    // document.addEventListener("keyup", this._handleNextRespKey);

    var respFbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.respTime,
      ];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "corFeedback",
      respFbTime: respFbTime,
    });
  }

  renderTutorSave() {
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
    } else {
      this.setState({
        dotStairEasy: null,
        dotStairHard: null,
      });
    }

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      tutorialTry: this.state.tutorialTry,
      blockCond: this.state.blockCond,
      trialNum: this.state.trialNum,
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
      rewFbTime: this.state.rewFbTime,
      choice: this.state.choice,
      confLevel: this.state.confLevel,
      confTime: this.state.confTime,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      dotStair: this.state.dotStair,

      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairDirEasy: this.state.stairDirEasy,
      dotStairEasy: this.state.dotStairEasy,

      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairDirHard: this.state.stairDirHard,
      dotStairHard: this.state.dotStairHard,

      dotStairLeft: this.state.dotStairLeft,
      dotStairRight: this.state.dotStairRight,
    };

    console.log(saveString);

    try {
      fetch(`${DATABASE_URL}/per_tutorial_data/` + prolificID, {
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

    if (this.state.blockCond == 0) {
      setTimeout(
        function () {
          this.trialExample();
        }.bind(this),
        10,
      );
    } else {
      setTimeout(
        function () {
          this.trialReset();
        }.bind(this),
        10,
      );
    }
  }

  renderQuizSave() {
    var prolificID = this.state.prolificID;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      //quiz paramters
      quizTry: this.state.quizTry,
      quizNumTotal: this.state.quizNumTotal,
      quizNum: this.state.quizNum,
      quizTime: this.state.trialTime,
      quizResp: this.state.quizPressed,
      quizRT: this.state.quizTime,
      quizAns: this.state.quizAns,
      quizCor: this.state.quizCor,
      quizCorTotal: this.state.quizCorTotal,
    };

    try {
      fetch(`${DATABASE_URL}/per_quiz_test/` + prolificID, {
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
        this.quizReset();
      }.bind(this),
      10,
    );
  }

  renderGConfSave() {
    var prolificID = this.state.prolificID;
    var task = "perception";

    // Downsample processing logic to keep character count below DB limits
    var sampleRate = 3;
    var maxChars = 9000; // Failsafe budget for DB text column limit (10000)

    var rawMovements = this.state.mouseMovements || [];

    var compressedMovements = rawMovements
      .filter((_, index) => index % sampleRate === 0)
      .map((m) => `${m.x},${m.y},${m.t},${m.p}`)
      .join("|");

    // --- FAILSAFE: Truncate if trial string exceeds limit ---
    if (compressedMovements.length > maxChars) {
      compressedMovements = compressedMovements.substring(0, maxChars);
      const lastPipe = compressedMovements.lastIndexOf("|");
      if (lastPipe !== -1) {
        compressedMovements = compressedMovements.substring(0, lastPipe);
      }
    }

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
      quizState: this.state.gConfState,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      textTime: this.state.confTime,
      selfKnowledge: this.state.selfKnowledge,
      mouseMovements: compressedMovements,
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

    //return to instructions
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 6,
      taskSection: null,
      mouseMovements: [],
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

  redirectToNextTask() {
    //  document.removeEventListener("keyup", this._handleInstructKey);
    //  document.removeEventListener("keyup", this._handleBeginKey);
    this.props.navigate("/PerTask?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        condition: this.state.condition,
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        dotStairEasy: this.state.dotStairEasy,
        dotStairHard: this.state.dotStairHard,
        memCorrectPer: this.state.memCorrectPer,
        perCorrectPer: this.state.perCorrectPer,
      },
    });

    //  console.log("UserID: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    console.log("Starting from instruction block");
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the instructNum state has changed since the last render
    if (prevState.instructNum !== this.state.instructNum) {
      console.log("instructNum has changed to:", this.state.instructNum);
      window.removeEventListener("mousemove", this.handleGlobalMouseMove);
    }
  }
  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (this.state.instructScreen === true && this.state.taskScreen === false) {
      //   document.addEventListener("keyup", this._handleInstructKey);
      //   document.addEventListener("keyup", this._handleBeginKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
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
        <div className={style.boxStyle}>
          <DrawFix />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
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
      this.state.taskScreen === true &&
      this.state.taskSection === "corFeedback"
    ) {
      text = (
        <div className={style.boxStyle}>
          <DrawCorFeedback.DrawFeedback
            choice={this.state.choice}
            correct={this.state.correct}
          />
          <button onClick={() => this.handleNextResp(3)}>
            <strong>Continue</strong>
          </button>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "quiz"
    ) {
      text = (
        <div>
          {this.quizText(this.state.quizNum)}
          <br />
          <br />
          <center>Please use click on the number to respond.</center>
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "gConf"
    ) {
      text = <div> {this.globalConfText(this.state.globalConfState)}</div>;
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

//      If I want to disable mouse events to force them to use the keyboard <div style={{ pointerEvents: "none" }}>

export default withRouter(PerTut);
