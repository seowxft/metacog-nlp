import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import * as ConfSliderEx from "./drawassets/DrawConfSliderExample.jsx";
import * as ConfSliderGlobal from "./drawassets/DrawConfSliderGlobal.jsx";

import * as staircase from "./MemStaircase.jsx";
import * as staircaseEasy from "./MemStaircaseEasy.jsx";

import stim0 from "./ani-stim/x7f9a2.jpg"; // butterfly
import stim1 from "./ani-stim/b3m1q8.jpg"; // ladybug
import stim2 from "./ani-stim/v9k4p1.jpg"; // snail
import stim3 from "./ani-stim/j2r5z7.jpg"; // frog
import stim4 from "./ani-stim/m6t8w3.jpg"; // beetle
import stim5 from "./ani-stim/c1n4h9.jpg"; // ant
import stim6 from "./ani-stim/y4f2d6.jpg"; // camel
import stim7 from "./ani-stim/k8b3g5.jpg"; // owl
import stim8 from "./ani-stim/p7v1x2.jpg"; // tiger
import stim9 from "./ani-stim/q5h9l4.jpg"; // panther
import stim10 from "./ani-stim/w2j8c1.jpg"; // bear
import stim11 from "./ani-stim/r6m3n8.jpg"; // snake
import stim12 from "./ani-stim/z1t5k9.jpg"; // gorilla
import stim13 from "./ani-stim/d9f4p2.jpg"; // spider
import stim14 from "./ani-stim/l3x7b6.jpg"; // buffalo

import style from "./style/memTaskStyle.module.css";
import astrodude from "./img/astronaut.png";

import { DATABASE_URL } from "./config.jsx";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSION + QUIZ FOR THE TASK
// Session includes:
// 1) Introduction to cover story
// 2) Practice on left/right box with feedback
// 3) Instructions to confidence rating
// 4) Quiz on instructions

class MemTut extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    let userID,
      prolificID,
      studyID,
      sessionID,
      date,
      startTime,
      condition,
      memCorrectPer,
      perCorrectPer,
      statePic,
      stateWord;

    var debug = true;

    if (debug === true) {
      userID = 100;
      prolificID = 100;
      studyID = 100;
      sessionID = 100;
      date = 100;
      startTime = 100;
      condition = 1;
      memCorrectPer = 0.9;
      perCorrectPer = 0;

      stateWord = [
        "butterfly",
        "ladybug",
        "snail",
        "frog",
        "beetle",
        "ant",
        "camel",
        "owl",
        "tiger",
        "panther",
        "bear",
        "snake",
        "gorilla",
        "spider",
        "buffalo",
      ];

      statePic = [
        stim0,
        stim1,
        stim2,
        stim3,
        stim4,
        stim5,
        stim6,
        stim7,
        stim8,
        stim9,
        stim10,
        stim11,
        stim12,
        stim13,
        stim14,
      ];

      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      studyID = this.props.state.studyID;
      sessionID = this.props.state.sessionID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
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

    var exampleNumTotal = 2;
    var trialNumTotal = 20;
    var blockCondTotal = ["easy", "hard"];
    var trialStaircaseSwitch = Math.round(trialNumTotal / 2);

    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    var stateNum = stateWord.length;

    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      prolificID: prolificID,
      studyID: studyID,
      sessionID: sessionID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      sectionTime: sectionTime,
      section: "tutorial",
      tutorialTry: 1,

      // trial timings in ms
      fixTimeLag: 1000,
      stimTimeLag: 1000,
      encodeTimeLag: 500,
      respFbTimeLag: 700,
      fbTimeLag: 500,

      // stimuli
      stateNum: stateNum,
      stateWord: stateWord,
      statePic: statePic,
      choicePosList: choicePos,

      // trial parameters
      exampleNumTotal: exampleNumTotal,
      trialNumTotal: trialNumTotal,
      fullTrialNumTotal: 80,
      blockCondTotal: blockCondTotal,
      trialStaircaseSwitch: trialStaircaseSwitch,

      // trial by trial parameters
      trialNum: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      choicePos: 0,
      encodeTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,
      correct: null,
      correctMat: [],
      correctPer: 0,

      // Combined log of all responses (easy + hard), updated only in handleResp
      responseMatrix: [],

      reversals: 0,
      stairDir: null,
      stimNum: null,

      // Easy block
      correctMatEasy: [],
      correctPerEasy: 0,
      responseMatrixEasy: [],
      // FIX 1: stairCountEasy receives correct/incorrect outcomes from handleResp
      // so the staircase function can read back1/back2/back3 on every trial.
      stairCountEasy: [],
      // FIX 2: stairDirEasy is written back after every step so reversal
      // detection carries forward correctly across trials.
      stairDirEasy: ["up", "up"],
      stimNumEasy: null,

      // Hard block
      correctMatHard: [],
      correctPerHard: 0,
      responseMatrixHard: [],
      stairCountHard: [], // same fix as stairCountEasy
      stairDirHard: ["up", "up"], // same fix as stairDirEasy
      stimNumHard: null,

      quizState: "pre",

      // quiz parameters
      quizTry: 1,
      quizNumTotal: 5,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [3, 1, 1, 2, 3],

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      taskScreen: false,
      taskSection: null,
      debug: debug,
      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
      mouseMovements: [],
    };

    //////////////////////////////////////////////////////////////////////////////////////////////

    window.addEventListener("keyup", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    this.handleInstruct = this.handleInstruct.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.handleNextResp = this.handleNextResp.bind(this);
    this.handleQuizResp = this.handleQuizResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);
    this.globalConfText = this.globalConfText.bind(this);

    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.ticking = false;
    this.renderImages = this.renderImages.bind(this);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // MOUSE TRACKING

  handleGlobalMouseMove(event) {
    if (this.state.taskScreen && !this.ticking) {
      window.requestAnimationFrame(() => {
        const relativeTime = Math.round(
          performance.now() - this.state.trialTime,
        );

        let sectionTag = "unmapped";
        if (this.state.taskSection === "gConf") sectionTag = "r";

        const currentCoord = {
          x: event.clientX,
          y: event.clientY,
          t: relativeTime,
          p: sectionTag,
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
  // KEYBOARD / CLICK HANDLES

  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 6) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 5
    ) {
      this.setState({ instructNum: curInstructNum + 1 });
    } else if (
      whichButton === 1 &&
      curInstructNum >= 9 &&
      curInstructNum <= 12
    ) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 8 &&
      curInstructNum <= 11
    ) {
      this.setState({ instructNum: curInstructNum + 1 });
    }

    console.log(this.state.instructNum + 1);
  }

  // handleBegin: no setState here, call targets directly
  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 6) {
      this.exampleBegin();
    } else if (whichButton === 3 && curInstructNum === 7) {
      console.log("START TUTORIAL");
      this.tutorBegin();
    } else if (whichButton === 3 && curInstructNum === 12) {
      this.quizBegin();
    } else if (whichButton === 3 && curInstructNum === 13) {
      this.redirectToNextTask();
    }
  }

  handleGlobalConf(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (whichButton === 3 && this.state.confLevel !== null) {
      var textTime = timePressed - this.state.trialTime;
      this.setState({ textTime: textTime }, () => this.renderGConfSave());
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // handleResp
  //
  // Owns: responseMatrix (combined), responseMatrixEasy, responseMatrixHard,
  //       correctMat, correctMatEasy, correctMatHard,
  //       stairCountEasy, stairCountHard  (FIX 1: now appended here)
  //
  // Does NOT touch: stairDirEasy, stairDirHard (those belong to trialReset)
  // ─────────────────────────────────────────────────────────────────────────
  handleResp(keyPressed) {
    var {
      trialTime,
      fixTime,
      stimTime,
      encodeTime,
      choiceCor,
      blockCond,
      correctMat,
      responseMatrix,
      responseMatrixEasy,
      correctMatEasy,
      responseMatrixHard,
      correctMatHard,
    } = this.state;

    var respTime =
      Math.round(performance.now()) -
      (trialTime + fixTime + stimTime + encodeTime);

    var choice = keyPressed === 1 ? "left" : keyPressed === 2 ? "right" : null;
    var response = choice !== null && choice === choiceCor;
    var correct = response ? 1 : 0;

    if (choice === null) {
      console.log("No response made!");
    } else {
      console.log("response: " + response);
    }

    var newCorrectMat = correctMat.concat(correct);
    // Combined log across all trials regardless of block
    var newResponseMatrix = responseMatrix.concat(response ? 1 : 0);

    var stateUpdates = {
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      correctMat: newCorrectMat,
      responseMatrix: newResponseMatrix,
      correctPer:
        Math.round((utils.getAvg(newCorrectMat) + Number.EPSILON) * 100) / 100,
    };

    if (blockCond === "easy") {
      var newCorrectMatEasy = correctMatEasy.concat(correct);
      var newResponseMatrixEasy = responseMatrixEasy.concat(response ? 1 : 0);
      // FIX 1: append this trial's outcome to stairCountEasy so the staircase
      // function can read back1/back2/back3 correctly on the next trial.
      var newStairCountEasy = this.state.stairCountEasy.concat(correct);
      Object.assign(stateUpdates, {
        responseMatrixEasy: newResponseMatrixEasy,
        correctMatEasy: newCorrectMatEasy,
        stairCountEasy: newStairCountEasy,
        correctPerEasy:
          Math.round((utils.getAvg(newCorrectMatEasy) + Number.EPSILON) * 100) /
          100,
      });
    } else if (blockCond === "hard") {
      var newCorrectMatHard = correctMatHard.concat(correct);
      var newResponseMatrixHard = responseMatrixHard.concat(response ? 1 : 0);
      // FIX 1: same as above for the hard block.
      var newStairCountHard = this.state.stairCountHard.concat(correct);
      Object.assign(stateUpdates, {
        responseMatrixHard: newResponseMatrixHard,
        correctMatHard: newCorrectMatHard,
        stairCountHard: newStairCountHard,
        correctPerHard:
          Math.round((utils.getAvg(newCorrectMatHard) + Number.EPSILON) * 100) /
          100,
      });
    }

    // renderChoiceFb reads this.state.choice — use callback to ensure state is flushed
    this.setState(stateUpdates, () => this.renderChoiceFb());
  }

  handleNextResp(keyPressed) {
    var whichButton = keyPressed;
    if (whichButton === 3) {
      var rewFbTime =
        Math.round(performance.now()) -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.encodeTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({ rewFbTime: rewFbTime }, () => this.renderTutorSave());
    }
  }

  handleQuizResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    var quizNum = this.state.quizNum;
    var whichButton = keyPressed;

    var quizTime = timePressed - this.state.trialTime;
    var quizCorTotal = this.state.quizCorTotal;
    var quizCor;

    if (whichButton === this.state.quizAns[quizNum - 1]) {
      quizCorTotal = quizCorTotal + 1;
      quizCor = 1;
    } else {
      quizCor = 0;
    }

    console.log("Keypress: " + whichButton);
    console.log("QuizTime: " + quizTime);
    console.log("QuizNum: " + quizNum);
    console.log("QuizCor: " + quizCor);
    console.log("QuizCorTotal: " + quizCorTotal);
    console.log("QuizAns: " + this.state.quizAns);
    console.log("quizNumTotal: " + this.state.quizNumTotal);

    this.setState(
      {
        quizPressed: whichButton,
        quizCor: quizCor,
        quizCorTotal: quizCorTotal,
        quizTime: quizTime,
      },
      () => this.renderQuizSave(),
    );
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  _handleQuizKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 49:
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 50:
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 51:
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 52:
        keyPressed = 4;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  // INSTRUCTION TEXT

  instructText(instructNum) {
    let text;
    let text2;

    if (this.state.quizTry === 1) {
      text2 = (
        <span>
          Well done!
          <br />
          <br />
          You saw that choosing the word that matches one of the animals you saw
          previously was the correct answer.
        </span>
      );
    } else if (this.state.quizTry >= 2 && this.state.quizTry <= 3) {
      text2 = (
        <span>
          You scored {this.state.quizCorTotal}/{this.state.quizNumTotal} on the
          quiz. Please read the instructions carefully.
          <br />
          <br />
          Your task is to choose the word that{" "}
          <strong>matches one of the animals you saw previously</strong>.
          <br />
          <br />
        </span>
      );
    } else if (this.state.quizTry >= 4) {
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
          You saw that choosing the word that matches one of the animals you saw
          previously was the correct answer.
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        <span>
          {text}
          As mentioned earlier, the animals we brought on board have scattered
          to various parts of the spaceship. As we encounter them, we need your
          assistance in cateloguing one of the ones you have seen.
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
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
            {this.renderImages(
              this.state.stateNum,
              this.state.statePic,
              style.instructStimDis,
            )}
          </center>
        </span>
        <br />
        <span>
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
          As we encounter the animals, you will have to{" "}
          <strong>memorise</strong> the all ones that are shown. Thereafter,
          when we ask which animal you have seen, you should choose{" "}
          <strong>the one you previously saw</strong>.
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
              src={this.state.statePic[2]}
              alt="stim1"
            />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[4]}
              alt="stim2"
            />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[8]}
              alt="stim3"
            />
            <br />
            <br />
          </center>
        </span>
        <span>
          Try to remember all of these animals shown!
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
          Next, we will show you a choice between two animals. You should select
          the one that you previously saw with a click on the correct name of
          the animal.
          <br />
          <br />
          Your selected animal word will be outlined in{" "}
          <font color="#87C1FF">
            <strong>light blue</strong>
          </font>
          .
          <br />
          <br />
          Previously we saw <strong>{this.state.stateWord[4]}</strong>, not{" "}
          {this.state.stateWord[0]}, and so we should choose as such:
          <br />
          <br />
          <br />
          <center>
            <span className={style.choiceWordChosen}>
              {this.state.stateWord[4]}
            </span>
            &nbsp;or&nbsp;
            <span className={style.word}>{this.state.stateWord[0]}</span>
          </center>
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
          If you are <strong>correct</strong>, the animal that you selected will
          have its outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the animal that you selected
          will have its outline turn{" "}
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

    let instruct_text6 = (
      <div>
        <span>
          For every choice, you will be presented with a white cross in the
          middle of the screen first before a spread of animals will appear.
          Please pay attention closely as the animals will be{" "}
          <strong>flashed quickly only once</strong>.
          <br />
          <br />
          You will then be shown two animals - make your selection of{" "}
          <strong>the animal you previously saw</strong>.
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

    let instruct_text7 = (
      <div>
        <span>
          Now that you are familiar with the pace, let&apos;s start a practice
          phase. Here, we will tell you whether your choices are right or wrong.
          <br />
          <br />
          You will have {this.state.trialNumTotal} chances to choose the correct
          animals.
          <br />
          <br />
          Please respond quickly and to the best of your ability - we need to
          sort the animals quickly!
          <br />
          <br />
          As a reminder:
          <br />
          <br />
          Click the correct name of the animal you previously saw.
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

    let instruct_text8 = (
      <div>
        <span>
          {text2}
          During the main task, you will also have to indicate your{" "}
          <strong>confidence</strong> in your choice of the animal you pick.
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

    let instruct_text9 = (
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

    let instruct_text10 = (
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
          <ConfSliderEx.ConfSliderEx1
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

    let instruct_text11 = (
      <div>
        If you are <strong>somewhat sure</strong> that you made a correct
        judgement, you should select a rating between the two ends of the scale.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx1
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={75}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        You can use the slider by clicking any point along the scale, or
        dragging the circle indicator along the scale. You can try it out for
        yourself above.
        <br />
        <br />
        During the main task, once you have selected your rating, you will have
        to press the [<strong>Next</strong>] button to confirm it and move on to
        the next set of animals.
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

    let instruct_text12 = (
      <div>
        Before you begin, you have to pass a quick quiz to make sure that you
        have understood the key points of your task for today.
        <br />
        <br />
        Note: You will have to get <strong>all</strong> quiz questions correct.
        If not, you be sent back to the instructions and will have to retake the
        quiz!
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

    let instruct_text13 = (
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
        return <div>{instruct_text12}</div>;
      case 13:
        return <div>{instruct_text13}</div>;
      default:
        return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // QUIZ TEXT

  quizText(quizNum) {
    let quiz_text1 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You are first shown a variety of
        animals. What do you do?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I try to
        figure out which animal is not there.
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I count the
        number of animals shown.
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I memorise
        the animals that are shown.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    let quiz_text2 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> Next, you are shown a choice
        between two animals, as words. What do you do?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I select the
        animal that was shown previously.
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button> - I select the
        animal that was not shown previously.
        <br />
        <button onClick={() => this.handleQuizResp(3)}>3</button> - I select
        both animals.
        <br />
        <button onClick={() => this.handleQuizResp(4)}>4</button> - I am unsure.
      </div>
    );

    let quiz_text3 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You have made your choice on the
        animal you think you saw previously. However, you are{" "}
        <strong>very unsure</strong> about your choice. How would you rate your
        confidence on the rating scale?
        <br />
        <br />
        <button onClick={() => this.handleQuizResp(1)}>1</button> - I would pick
        the left end of the scale (50% correct).
        <br />
        <button onClick={() => this.handleQuizResp(2)}>2</button>- I would pick
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
        <strong>Q{this.state.quizNum}:</strong> On the next set of animals, you
        are <strong>very sure</strong> about your choice. How would you rate
        your confidence on the rating scale?
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

    let quiz_text5 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> On the next set of animals, you
        are <strong>somewhat sure</strong> about your choice. How would you rate
        your confidence on the rating scale?
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
      case 5:
        return <div>{quiz_text5}</div>;
      default:
        return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // TASK TOGGLES

  globalConfText(quizState) {
    let gConf_text1 = (
      <div>
        <center>
          Before we begin, out of {this.state.fullTrialNumTotal} sets of
          animals, how many times you do think you will be able to select the
          correct animal seen in the set?
        </center>
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
            max={this.state.fullTrialNumTotal}
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
        return <div>{gConf_text1}</div>;
      default:
        return null;
    }
  }

  gConfBegin() {
    console.log("Does it come here?");
    var initialValuePre = this.state.fullTrialNumTotal / 2;
    var offset = Math.round(this.state.fullTrialNumTotal * 0.125);
    var initialValue = utils.randomInt(
      initialValuePre - offset,
      initialValuePre + offset,
    );

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      trialTime: Math.round(performance.now()),
      textTime: null,
      instructScreen: false,
      taskScreen: true,
      taskSection: "gConf",
      mouseMovements: [],
    });
  }

  exampleBegin() {
    console.log("Example begin.");
    this.setState(
      {
        trialNum: 0,
        reversals: null,
        responseMatrix: [],
        stairDir: null,
        confLevel: null,
        confMove: false,
        confTime: 0,
        blockCond: "example",
      },
      () => this.trialExample(),
    );
  }

  trialExample() {
    var trialNum = this.state.trialNum + 1;
    var choicePos = Math.random() < 0.5 ? 1 : 2;
    var stimNum = 5;

    var stim = this.state.statePic;
    var stimWord = this.state.stateWord;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    var stimPickNum = stimNum + 1;
    var stimPick = stim.slice([-stimPickNum]);
    var stimWordPick = stimWord.slice([-stimPickNum]);

    var stimPickShown = stimPick.slice(0, stimNum);
    var stimWordPickShown = stimWordPick.slice(0, stimNum);

    utils.shuffleSame(stimPickShown, stimWordPickShown);

    stimPickShown = stimPickShown.filter(function (val) {
      return val !== undefined;
    });
    stimWordPickShown = stimWordPickShown.filter(function (val) {
      return val !== undefined;
    });

    var choicePickShown = stimPick.slice(-2);
    var choiceWordPickShown = stimWordPick.slice(-2);

    var choiceShownWordLeft, choiceShownWordRight, choiceCor;
    if (choicePos === 1) {
      choiceShownWordLeft = choiceWordPickShown[0];
      choiceShownWordRight = choiceWordPickShown[1];
      choiceCor = "left";
    } else {
      choiceShownWordLeft = choiceWordPickShown[1];
      choiceShownWordRight = choiceWordPickShown[0];
      choiceCor = "right";
    }

    this.setState(
      {
        instructScreen: false,
        taskScreen: true,
        taskSection: "iti",
        trialNum: trialNum,
        fixTime: 0,
        stimTime: 0,
        responseKey: 0,
        respTime: 0,
        respFbTime: 0,
        rewFbTime: 0,
        choice: null,
        correct: null,
        correctPer: null,
        choicePos: choicePos,
        choiceCor: choiceCor,
        stimPick: stimPick,
        stimWordPick: stimWordPick,
        stimShown: stimPickShown,
        stimWordShown: stimWordPickShown,
        choiceShownWordStim1: choiceWordPickShown[0],
        choiceShownWordStim2: choiceWordPickShown[1],
        choiceShownWordLeft: choiceShownWordLeft,
        choiceShownWordRight: choiceShownWordRight,
        choiceFbLeft: style.choiceWord,
        choiceFbRight: style.choiceWord,
        choiceFbRewLeft: style.choiceWord,
        choiceFbRewRight: style.choiceWord,
        stimNum: stimNum,
      },
      () => {
        if (trialNum < this.state.exampleNumTotal + 1) {
          console.log("Example trial: " + trialNum);
          this.renderFix();
        } else {
          console.log("End of example trials.");
          this.gConfBegin();
        }
      },
    );
  }

  tutorBegin() {
    this.setState(
      {
        trialNum: 0,
        blockCond: null,
        trialTime: 0,
        correctMatEasy: [],
        correctPerEasy: 0,
        responseMatrixEasy: [],
        stairCountEasy: [],
        stairDirEasy: ["up", "up"],
        stimNumEasy: 6,
        correctMatHard: [],
        correctPerHard: 0,
        responseMatrixHard: [],
        stairCountHard: [],
        stairDirHard: ["up", "up"],
        stimNumHard: 6,
      },
      () => this.trialReset(),
    );
  }

  tutorEnd() {
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 8,
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
      this.setState({
        quizNum: quizNum + 1,
        trialTime: trialTime,
      });
    } else if (quizNum === this.state.quizNumTotal) {
      var quizTry = this.state.quizTry;
      var tutorialTry = this.state.tutorialTry;

      if (quizCorTotal === this.state.quizNumTotal) {
        console.log("PASS QUIZ");
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 13,
          taskSection: "instruct",
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry <= 2) {
        console.log("FAIL QUIZ");
        quizTry = quizTry + 1;
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 8,
          taskSection: "instruct",
          quizTry: quizTry,
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry > 2) {
        tutorialTry = tutorialTry + 1;
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // TRIAL FLOW

  // ─────────────────────────────────────────────────────────────────────────
  // trialReset
  //
  // Owns: stairCountEasy, stairCountHard (reads outcomes written by handleResp),
  //       stairDirEasy, stairDirHard (FIX 2: now written back each trial),
  //       stimNumEasy, stimNumHard (via renderTutorSave callback)
  //
  // Does NOT touch: responseMatrix, responseMatrixEasy, responseMatrixHard,
  //                 correctMat, correctMatEasy, correctMatHard,
  //                 stairCountEasy, stairCountHard (those belong to handleResp)
  // ─────────────────────────────────────────────────────────────────────────
  trialReset() {
    var trialNum = this.state.trialNum + 1;
    var choicePos = this.state.choicePosList[trialNum - 1];

    console.log(trialNum);
    console.log(choicePos);

    var stimNum, stairDir, newStairCountEasy, newStairCountHard;
    var blockCond;
    var s2;

    if (trialNum <= this.state.trialStaircaseSwitch) {
      blockCond = this.state.blockCondTotal[0]; // "easy"

      s2 = staircaseEasy.staircase(
        this.state.stimNumEasy,
        this.state.stairCountEasy,
        this.state.stairDirEasy,
        trialNum,
      );
      stimNum = s2.stimNum;
      stairDir = s2.direction;
      newStairCountEasy = s2.stepcount;
      newStairCountHard = this.state.stairCountHard; // unchanged this trial

      console.log("Easy block — stimNum:", stimNum, "stairDir:", stairDir);
    } else {
      blockCond = this.state.blockCondTotal[1]; // "hard"

      s2 = staircase.staircase(
        this.state.stimNumHard,
        this.state.stairCountHard,
        this.state.stairDirHard,
        trialNum - this.state.trialStaircaseSwitch + 1,
      );
      stimNum = s2.stimNum;
      stairDir = s2.direction;
      newStairCountHard = s2.stepcount;
      newStairCountEasy = this.state.stairCountEasy; // unchanged this trial

      console.log("Hard block — stimNum:", stimNum, "stairDir:", stairDir);
    }

    var reversals = s2 && s2.reversal ? 1 : 0;

    // Shuffle stimuli
    var stim = this.state.statePic;
    var stimWord = this.state.stateWord;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    var stimPickNum = stimNum + 1;
    var stimPick = stim.slice([-stimPickNum]);
    var stimWordPick = stimWord.slice([-stimPickNum]);

    var stimPickShown = stimPick.slice(0, stimNum);
    var stimWordPickShown = stimWordPick.slice(0, stimNum);

    utils.shuffleSame(stimPickShown, stimWordPickShown);

    stimPickShown = stimPickShown.filter(function (val) {
      return val !== undefined;
    });
    stimWordPickShown = stimWordPickShown.filter(function (val) {
      return val !== undefined;
    });

    var choicePickShown = stimPick.slice(-2);
    var choiceWordPickShown = stimWordPick.slice(-2);

    var choiceShownWordLeft, choiceShownWordRight, choiceCor;
    if (choicePos === 1) {
      choiceShownWordLeft = choiceWordPickShown[0];
      choiceShownWordRight = choiceWordPickShown[1];
      choiceCor = "left";
    } else {
      choiceShownWordLeft = choiceWordPickShown[1];
      choiceShownWordRight = choiceWordPickShown[0];
      choiceCor = "right";
    }

    this.setState(
      {
        instructScreen: false,
        taskScreen: true,
        taskSection: "iti",
        blockCond: blockCond,
        trialNum: trialNum,
        fixTime: 0,
        stimTime: 0,
        encodeTime: 0,
        responseKey: 0,
        respTime: 0,
        respFbTime: 0,
        rewFbTime: 0,
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
        stairDir: stairDir,
        reversals: reversals,
        // FIX 2: write the updated direction back to the block-specific field
        // so reversal detection carries forward correctly on the next trial.
        stairDirEasy: blockCond === "easy" ? stairDir : this.state.stairDirEasy,
        stairDirHard: blockCond === "hard" ? stairDir : this.state.stairDirHard,
        stairCountEasy: newStairCountEasy,
        stairCountHard: newStairCountHard,
        choiceFbLeft: style.choiceWord,
        choiceFbRight: style.choiceWord,
        choiceFbRewLeft: style.choiceWord,
        choiceFbRewRight: style.choiceWord,
      },
      () => {
        if (trialNum < this.state.trialNumTotal + 1) {
          console.log("START TRIAL");
          this.renderFix();
        } else {
          this.tutorEnd();
        }
      },
    );
  }

  renderFix() {
    var trialTime = Math.round(performance.now());
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderStim(), this.state.fixTimeLag);
  }

  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderEncode(), this.state.stimTimeLag);
  }

  renderEncode() {
    var stimTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.fixTime);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "encode",
      stimTime: stimTime,
    });

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderChoice(), this.state.encodeTimeLag);
  }

  renderChoice() {
    var encodeTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.fixTime + this.state.stimTime);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choice",
      encodeTime: encodeTime,
    });
  }

  renderChoiceFb() {
    var choice = this.state.choice;
    var choiceFbLeft, choiceFbRight;

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

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderCorFb(), this.state.respFbTimeLag);
  }

  renderCorFb() {
    var respFbTime =
      Math.round(performance.now()) -
      (this.state.trialTime +
        this.state.fixTime +
        this.state.stimTime +
        this.state.encodeTime +
        this.state.respTime);

    var choice = this.state.choice;
    var correct = this.state.correct;
    var choiceFbRewLeft, choiceFbRewRight, choiceFbRewText;

    console.log(choice);
    console.log(correct);

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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SAVE FUNCTIONS

  renderTutorSave() {
    var prolificID = this.state.prolificID;
    var blockCond = this.state.blockCond;

    var newStimNumEasy = this.state.stimNumEasy;
    var newStimNumHard = this.state.stimNumHard;

    if (blockCond === "easy") {
      console.log("Saving stimNum in easy block.");
      newStimNumEasy = this.state.stimNum;
    } else if (blockCond === "hard") {
      console.log("Saving stimNum in hard block.");
      newStimNumHard = this.state.stimNum;
    } else {
      console.log("stimNum saving as null (examples).");
      newStimNumEasy = null;
      newStimNumHard = null;
    }

    let saveString = {
      prolificID: this.state.prolificID,
      studyID: this.state.studyID,
      sessionID: this.state.sessionID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      tutorialTry: this.state.tutorialTry,
      blockCond: this.state.blockCond,
      choicePos: this.state.choicePos,
      choiceCor: this.state.choiceCor,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimTime: this.state.stimTime,
      encodeTime: this.state.encodeTime,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      rewFbTime: this.state.rewFbTime,
      confTime: this.state.confTime,
      responseKey: this.state.responseKey,
      choice: this.state.choice,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
      confLevel: this.state.confLevel,

      stimNum: this.state.stimNum,

      // Combined response log across all blocks
      responseMatrix: this.state.responseMatrix,

      reversals: this.state.reversals,
      stairDir: this.state.stairDir,

      // Easy block
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairCountEasy: this.state.stairCountEasy,
      stairDirEasy: this.state.stairDirEasy,
      stimNumEasy: newStimNumEasy,

      // Hard block
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairCountHard: this.state.stairCountHard,
      stairDirHard: this.state.stairDirHard,
      stimNumHard: newStimNumHard,

      stimPick: null,
      stimWordPick: this.state.stimWordPick,
      stimShown: null,
      stimWordShown: this.state.stimWordShown,
      choiceShownWordStim1: this.state.choiceShownWordStim1,
      choiceShownWordStim2: this.state.choiceShownWordStim2,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
    };

    console.log("BEFORE TRIAL RESET");

    fetch(`${DATABASE_URL}/mem_tutorial_data/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    }).catch((e) => {
      console.log("Cant post?", e);
    });

    this.setState(
      {
        stimNumEasy: newStimNumEasy,
        stimNumHard: newStimNumHard,
      },
      () => {
        if (this.state.blockCond === "example") {
          console.log("blockCond is example");
          this.trialExample();
        } else {
          console.log("blockCond is tutorial");
          this.trialReset();
        }
      },
    );
  }

  renderQuizSave() {
    var prolificID = this.state.prolificID;

    let saveString = {
      prolificID: this.state.prolificID,
      studyID: this.state.studyID,
      sessionID: this.state.sessionID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
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

    fetch(`${DATABASE_URL}/mem_quiz_test/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    })
      .then(() => this.quizReset())
      .catch((e) => {
        console.log("Cant post?", e);
        this.quizReset(); // still advance even if save fails
      });
  }

  renderGConfSave() {
    var prolificID = this.state.prolificID;
    var task = "memory";

    var sampleRate = 3;
    var maxChars = 9000;
    var rawMovements = this.state.mouseMovements || [];

    var compressedMovements = rawMovements
      .filter((_, index) => index % sampleRate === 0)
      .map((m) => `${m.x},${m.y},${m.t},${m.p}`)
      .join("|");

    if (compressedMovements.length > maxChars) {
      compressedMovements = compressedMovements.substring(0, maxChars);
      const lastPipe = compressedMovements.lastIndexOf("|");
      if (lastPipe !== -1) {
        compressedMovements = compressedMovements.substring(0, lastPipe);
      }
    }

    let saveString = {
      prolificID: this.state.prolificID,
      studyID: this.state.studyID,
      sessionID: this.state.sessionID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      blockNum: null,
      quizState: this.state.quizState,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      textTime: this.state.textTime,
      selfKnowledge: null,
      clientFlags: null,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      mouseMovements: compressedMovements,
    };

    fetch(`${DATABASE_URL}/pre_post_conf/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    }).catch((e) => {
      console.log("Cant post?", e);
    });

    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 7,
      taskSection: null,
      mouseMovements: [],
    });
  }

  redirectToNextTask() {
    this.props.navigate("/MemTask?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        studyID: this.state.studyID,
        sessionID: this.state.sessionID,
        condition: this.state.condition,
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        statePic: this.state.statePic,
        stateWord: this.state.stateWord,
        stimNumEasy: this.state.stimNumEasy,
        stimNumHard: this.state.stimNumHard,
        memCorrectPer: this.state.memCorrectPer,
        perCorrectPer: this.state.perCorrectPer,
      },
    });

    console.log("UserID is: " + this.state.userID);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // LIFECYCLE

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    window.addEventListener("mousemove", this.handleGlobalMouseMove);

    var statePic = this.state.statePic;
    [statePic].forEach((image) => {
      new Image().src = image;
    });
    this.setState({ statePic: statePic });
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.instructNum !== this.state.instructNum) {
      console.log("instructNum changed to:", this.state.instructNum);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // RENDER

  render() {
    let text;

    if (this.state.instructScreen === true && this.state.taskScreen === false) {
      text = <div>{this.instructText(this.state.instructNum)}</div>;
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "iti"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "fixation"
    ) {
      text = (
        <div className={style.boxStyle2}>
          <br />
          <br />
          <DrawFix />
          <br />
          <br />
        </div>
      );
    } else if (
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
          <center></center>
        </div>
      );
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "encode"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
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
      this.state.taskScreen === true &&
      this.state.taskSection === "corFeedback"
    ) {
      text = (
        <div className={style.boxStyle}>
          <br />
          <br />
          <center>{this.state.choiceFbRewText}</center>
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
          <center>
            <button onClick={() => this.handleNextResp(3)}>Next</button>
          </center>
        </div>
      );
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "quiz"
    ) {
      text = (
        <div>
          {this.quizText(this.state.quizNum)}
          <br />
          <br />
          <center>Please click the number buttons to respond.</center>
        </div>
      );
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "gConf"
    ) {
      text = <div>{this.globalConfText(this.state.quizState)}</div>;
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

export default withRouter(MemTut);
