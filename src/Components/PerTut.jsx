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
// There are two staircases - easy and hard to get the starting dot diff for the different conditions

class PerTut extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    // --- Declare variables OUTSIDE the if/else ---
    let userID,
      prolificID,
      studyID,
      sessionID,
      date,
      startTime,
      condition,
      memCorrectPer,
      perCorrectPer;

    var debug = false;

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
    }

    var exampleNumTotal = 2;
    var trialNumTotal = 20;
    var blockCondTotal = ["easy", "hard"];
    var trialStaircaseSwitch = Math.round(trialNumTotal / 2);

    var pracStimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(pracStimPos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      debug: debug,
      // demo parameters
      prolificID: prolificID,
      studyID: studyID,
      sessionID: sessionID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      // section parameters
      sectionTime: sectionTime,
      section: "tutorial",

      // trial timings in ms
      fixTimeLag: 1000,
      fbTimeLag: 500,
      stimTimeLag: 300,
      respFbTimeLag: 700,

      // trial parameters
      exampleNumTotal: exampleNumTotal,
      trialNumTotal: trialNumTotal,
      fullTrialNumTotal: 80,
      blockCondTotal: blockCondTotal,
      trialStaircaseSwitch: trialStaircaseSwitch,
      stimPosList: pracStimPos,
      tutorialTry: 1,

      // trial by trial parameters
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
      confMove: null,
      correct: null,
      correctMat: [],
      correctPer: 0,

      quizState: "pre",

      dotRadius: 5,

      // staircase parameters
      reversals: 0,
      stairDir: null,
      dotStair: null,

      dotStairLeft: 0,
      dotStairRight: 0,

      responseMatrix: [], // combined log of all responses

      correctMatEasy: [],
      correctPerEasy: 0,
      responseMatrixEasy: [],
      // FIX 1: stairCountEasy receives correct/incorrect outcomes from handleResp
      // so the staircase function can read back1/back2/back3 on every trial.
      stairCountEasy: [],
      // FIX 2: stairDirEasy is written back after every step so reversal
      // detection carries forward correctly across trials.
      stairDirEasy: ["up", "up"],
      dotStairEasy: 4.65,

      correctMatHard: [],
      correctPerHard: 0,
      responseMatrixHard: [],
      stairCountHard: [], // same fix as stairCountEasy
      stairDirHard: ["up", "up"], // same fix as stairDirEasy
      dotStairHard: 4.65,

      // quiz parameters
      quizTry: 1,
      quizNumTotal: 4,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [2, 1, 2, 3],

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      taskScreen: false,
      taskSection: null,
      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
      mouseMovements: [],
    };

    //////////////////////////////////////////////////////////////////////////////////////////////

    /* Prevents page from scrolling when space bar is hit. */
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

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 5) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 4
    ) {
      this.setState({ instructNum: curInstructNum + 1 });
    } else if (
      whichButton === 1 &&
      curInstructNum >= 8 &&
      curInstructNum <= 11
    ) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 7 &&
      curInstructNum <= 10
    ) {
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 5) {
      this.exampleBegin();
    } else if (whichButton === 3 && curInstructNum === 6) {
      console.log("Tutorial begin.");
      this.tutorBegin();
    } else if (whichButton === 3 && curInstructNum === 11) {
      this.quizBegin();
    } else if (whichButton === 3 && curInstructNum === 12) {
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

  handleResp(keyPressed) {
    var {
      trialTime,
      fixTime,
      stimTime,
      dotDiffLeft,
      dotDiffRight,
      blockCond,
      correctMat,
      responseMatrix,
      responseMatrixEasy,
      responseMatrixHard,
    } = this.state;

    var respTime =
      Math.round(performance.now()) - (trialTime + fixTime + stimTime);
    var choice = keyPressed === 1 ? "left" : keyPressed === 2 ? "right" : null;

    var response =
      (dotDiffLeft > dotDiffRight && choice === "left") ||
      (dotDiffLeft < dotDiffRight && choice === "right") ||
      dotDiffLeft === dotDiffRight;

    var correct = response ? 1 : 0;

    var newCorrectMat = correctMat.concat(correct);
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
      var newResponseMatrixEasy = responseMatrixEasy.concat(response ? 1 : 0);
      var newCorrectMatEasy = this.state.correctMatEasy.concat(correct);
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
      var newResponseMatrixHard = responseMatrixHard.concat(response ? 1 : 0);
      var newCorrectMatHard = this.state.correctMatHard.concat(correct);
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
            this.state.respTime +
            this.state.respFbTime,
        ];

      document.removeEventListener("keyup", this._handleNextRespKey);

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
      this.setState(
        {
          quizPressed: whichButton,
          quizCor: quizCor,
          quizCorTotal: quizCorTotal,
          quizTime: quizTime,
        },
        () => this.renderQuizSave(),
      );
    } else {
      quizCor = 0;
      this.setState(
        {
          quizPressed: whichButton,
          quizCor: quizCor,
          quizTime: quizTime,
        },
        () => this.renderQuizSave(),
      );
    }
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // INSTRUCTION TEXT

  instructText(instructNum) {
    let text;
    let text2;
    let taskCond;

    if (this.state.quizTry === 1) {
      text2 = (
        <span>
          Well done!
          <br />
          <br />
          You saw that choosing the battery card with the higher charge level,
          i.e., more number of white dots was the correct answer.
        </span>
      );
    } else if (this.state.quizTry >= 2 && this.state.quizTry <= 3) {
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
          middle of the screen first before the battery cards appear.
          <br />
          <br />
          Please pay attention closely as the charge level indicator (white
          dots) of the battery cards will be{" "}
          <strong>flashed quickly only once</strong>. Make your selection{" "}
          <strong>after the charge level indicator disappears</strong>.
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
        Before you begin, you will now have to pass a quick quiz to make sure
        that you have understood the key points of your task for today.
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
        return <div>{instruct_text12}</div>;
      default:
        return null;
    }
  }

  globalConfText(quizState) {
    let gConf_text1 = (
      <div>
        <center>
          You have now seen how fast the battery cards will appear.
          <br />
          <br />
          Out of {this.state.fullTrialNumTotal} set pairs of battery cards, how
          many times do you think you will choose the higher charge battery card
          correctly?
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

    switch (quizState) {
      case "pre":
        return <div>{gConf_text1}</div>;
      default:
        return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // QUIZ TEXT

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
        return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // TASK TOGGLES

  gConfBegin() {
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
    var stimPos = Math.random() < 0.5 ? 1 : 2;
    var dotStair = 4.65;

    var dotStairLeft, dotStairRight, dotDiffLeft, dotDiffRight;

    if (stimPos === 1) {
      dotStairLeft = dotStair;
      dotStairRight = 0;
      dotDiffLeft = Math.round(Math.exp(dotStairLeft));
      dotDiffRight = 0;
    } else {
      dotStairLeft = 0;
      dotStairRight = dotStair;
      dotDiffLeft = 0;
      dotDiffRight = Math.round(Math.exp(dotStairRight));
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
        stimPos: stimPos,
        dotDiffStim1: Math.round(Math.exp(dotStair)),
        dotDiffStim2: 0,
        dotStair: dotStair,
        dotStairLeft: dotStairLeft,
        dotStairRight: dotStairRight,
        dotDiffLeft: dotDiffLeft,
        dotDiffRight: dotDiffRight,
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
        dotStairEasy: 4.65,
        correctMatHard: [],
        correctPerHard: 0,
        responseMatrixHard: [],
        stairCountHard: [],
        stairDirHard: ["up", "up"],
        dotStairHard: 4.65,
      },
      () => {
        this.trialReset();
      },
    );
  }

  tutorEnd() {
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
      this.setState({
        quizNum: quizNum + 1,
        trialTime: trialTime,
      });
    } else if (quizNum === this.state.quizNumTotal) {
      var quizTry = this.state.quizTry;
      var tutorialTry = this.state.tutorialTry;

      if (quizCorTotal === this.state.quizNumTotal) {
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 12,
          taskSection: "instruct",
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry < 4) {
        quizTry = quizTry + 1;
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 7,
          taskSection: "instruct",
          quizTry: quizTry,
        });
      } else {
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
  // Owns: dotStairEasy, dotStairHard (via renderTutorSave callback),
  //       stairDirEasy, stairDirHard (FIX 2: now written back each trial)
  //
  // Reads: stairCountEasy, stairCountHard (FIX 1: now populated by handleResp)
  //
  // Does NOT touch: responseMatrix, responseMatrixEasy, responseMatrixHard,
  //                 correctMat, correctMatEasy, correctMatHard,
  //                 stairCountEasy, stairCountHard  (those belong to handleResp)
  // ─────────────────────────────────────────────────────────────────────────
  trialReset() {
    var trialNum = this.state.trialNum + 1;
    var stimPos = this.state.stimPosList[trialNum - 1];

    var blockCond, dotStair, stairDir, newStairCountEasy, newStairCountHard;
    var s2;

    if (trialNum <= this.state.trialStaircaseSwitch) {
      blockCond = this.state.blockCondTotal[0]; // "easy"

      s2 = staircaseEasy.staircase(
        this.state.dotStairEasy,
        this.state.stairCountEasy,
        this.state.stairDirEasy,
        trialNum,
      );
      dotStair = s2.diff;
      stairDir = s2.direction;
      newStairCountEasy = s2.stepcount;
      newStairCountHard = this.state.stairCountHard; // unchanged this trial

      console.log("Easy block — dotStair:", dotStair, "stairDir:", stairDir);
    } else {
      blockCond = this.state.blockCondTotal[1]; // "hard"

      s2 = staircase.staircase(
        this.state.dotStairHard,
        this.state.stairCountHard,
        this.state.stairDirHard,
        trialNum - this.state.trialStaircaseSwitch + 1,
      );
      dotStair = s2.diff;
      stairDir = s2.direction;
      newStairCountHard = s2.stepcount;
      newStairCountEasy = this.state.stairCountEasy; // unchanged this trial

      console.log("Hard block — dotStair:", dotStair, "stairDir:", stairDir);
    }

    var reversals = s2 && s2.reversal ? 1 : 0;

    var dotStairLeft, dotStairRight, dotDiffLeft, dotDiffRight;

    if (stimPos === 1) {
      dotStairLeft = dotStair;
      dotStairRight = 0;
      dotDiffLeft = Math.round(Math.exp(dotStairLeft));
      dotDiffRight = 0;
    } else {
      dotStairLeft = 0;
      dotStairRight = dotStair;
      dotDiffLeft = 0;
      dotDiffRight = Math.round(Math.exp(dotStairRight));
    }

    this.setState(
      {
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
        stairDir: stairDir,
        // FIX 2: write the updated direction back to the block-specific field
        // so reversal detection carries forward correctly on the next trial.
        stairDirEasy: blockCond === "easy" ? stairDir : this.state.stairDirEasy,
        stairDirHard: blockCond === "hard" ? stairDir : this.state.stairDirHard,
        stairCountEasy: newStairCountEasy,
        stairCountHard: newStairCountHard,
        dotDiffStim1: Math.round(Math.exp(dotStair)),
        dotDiffStim2: 0,
        dotStair: dotStair,
        dotStairLeft: dotStairLeft,
        dotStairRight: dotStairRight,
        dotDiffLeft: dotDiffLeft,
        dotDiffRight: dotDiffRight,
      },
      () => {
        if (trialNum < this.state.trialNumTotal + 1) {
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

    setTimeout(() => this.renderChoice(), this.state.stimTimeLag);
  }

  renderChoice() {
    var stimTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.fixTime);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choice",
      stimTime: stimTime,
    });
  }

  renderChoiceFb() {
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
    });

    setTimeout(() => this.renderCorFb(), this.state.respFbTimeLag);
  }

  renderCorFb() {
    var respFbTime =
      Math.round(performance.now()) -
      (this.state.trialTime +
        this.state.fixTime +
        this.state.stimTime +
        this.state.respTime);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "corFeedback",
      respFbTime: respFbTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SAVE FUNCTIONS

  renderTutorSave() {
    var prolificID = this.state.prolificID;
    var blockCond = this.state.blockCond;

    // FIX 3: compute updated dotStair values before building the save payload.
    // Because renderTutorSave runs inside a setState callback, state is already
    // settled and these reads are safe.
    var newDotStairEasy = this.state.dotStairEasy;
    var newDotStairHard = this.state.dotStairHard;

    if (blockCond === "easy") {
      newDotStairEasy = this.state.dotStair;
    } else if (blockCond === "hard") {
      newDotStairHard = this.state.dotStair;
    } else {
      // example trials — no staircase values to save
      newDotStairEasy = null;
      newDotStairHard = null;
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

      // Combined response log across all blocks
      responseMatrix: this.state.responseMatrix,

      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      dotStair: this.state.dotStair,

      // Easy block
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairCountEasy: this.state.stairCountEasy,
      stairDirEasy: this.state.stairDirEasy,
      dotStairEasy: newDotStairEasy,

      // Hard block
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairCountHard: this.state.stairCountHard,
      stairDirHard: this.state.stairDirHard,
      dotStairHard: newDotStairHard,

      dotStairLeft: this.state.dotStairLeft,
      dotStairRight: this.state.dotStairRight,
    };

    console.log(saveString);

    fetch(`${DATABASE_URL}/per_tutorial_data/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    }).catch((e) => {
      console.log("Cant post?", e);
    });

    // Update dotStair state, then proceed to the next trial.
    this.setState(
      {
        dotStairEasy: newDotStairEasy,
        dotStairHard: newDotStairHard,
      },
      () => {
        if (this.state.blockCond === "example") {
          this.trialExample();
        } else {
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

    fetch(`${DATABASE_URL}/per_quiz_test/` + prolificID, {
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
    var task = "perception";

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
      instructNum: 6,
      taskSection: null,
      mouseMovements: [],
    });
  }

  redirectToNextTask() {
    this.props.navigate("/PerTask?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        studyID: this.state.studyID,
        sessionID: this.state.sessionID,
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
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // LIFECYCLE

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    console.log("Starting from instruction block");
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
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
        <div className={style.boxStyle}>
          <DrawFix />
        </div>
      );
    } else if (
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
      this.state.taskScreen === true &&
      this.state.taskSection === "choice"
    ) {
      text = (
        <div className={style.boxStyle}>
          <DrawBox onBoxClick={this.handleResp} />
        </div>
      );
    } else if (
      this.state.taskScreen === true &&
      this.state.taskSection === "choiceFeedback"
    ) {
      text = (
        <div className={style.boxStyle}>
          <DrawChoice.DrawChoice choice={this.state.choice} />
        </div>
      );
    } else if (
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

export default withRouter(PerTut);
