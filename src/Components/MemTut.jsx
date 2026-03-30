import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import * as ConfSliderEx from "./drawassets/DrawConfSliderExample.jsx";
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

    // --- Declare variables OUTSIDE the if/else ---
    let userID,
      prolificID,
      date,
      startTime,
      condition,
      memCorrectPer,
      perCorrectPer,
      statePic,
      stateWord;

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

    var trialNumTotal = 10; //26
    var blockCondTotal = ["easy", "hard"];
    var trialStaircaseSwitch = Math.round(trialNumTotal / 2);

    //the stim position
    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    var stateNum = stateWord.length; //26
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
      section: "tutorial",
      tutorialTry: 1,
      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 1000, //1500
      encodeTimeLag: 1000,
      respFbTimeLag: 700, //
      fbTimeLag: 500, //500 correct or wrong

      // stimuli
      stateNum: stateNum,
      stateWord: stateWord,
      statePic: statePic,
      choicePosList: choicePos,

      //trial parameters
      trialNumTotal: trialNumTotal,
      blockCondTotal: blockCondTotal,
      trialStaircaseSwitch: trialStaircaseSwitch,

      //  respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      //trial by trial paramters
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
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      stimNum: 6,

      correctMatEasy: [], //put correct in vector, to cal perf %
      correctPerEasy: 0,
      responseMatrixEasy: [true, true],
      stairDirEasy: ["up", "up"],
      stimNumEasy: 6,

      correctMatHard: [], //put correct in vector, to cal perf %
      correctPerHard: 0,
      responseMatrixHard: [true, true],
      stairDirHard: ["up", "up"],
      stimNumHard: 6,

      //quiz paramters
      quizTry: 1,
      quizNumTotal: 5,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [3, 1, 1, 2, 3],

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
    this.handleQuizResp = this.handleQuizResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);

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

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 6) {
      // from page 2 to 5, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 5
    ) {
      // from page 1 to 4, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    } else if (
      whichButton === 1 &&
      curInstructNum >= 8 &&
      curInstructNum <= 11
    ) {
      // from page 7 to 11, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 7 &&
      curInstructNum <= 10
    ) {
      // from page 6 to 10, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }

    console.log(this.state.instructNum + 1);
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 6) {
      console.log("START TUTORIAL");
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

  handleResp(keyPressed) {
    var timePressed = Math.round(performance.now());

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

    console.log("response: " + response);
    var responseMatrix = this.state.responseMatrix.concat(response);
    var correctMat = this.state.correctMat.concat(correct);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      correctMat: correctMat,
      correctPer: correctPer,
      responseMatrix: responseMatrix,

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
            this.state.encodeTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        rewFbTime: rewFbTime,
      });

      //  document.removeEventListener("keyup", this._handleNextRespKey);
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

    console.log("Keypress: " + whichButton);
    console.log("QuizTime: " + quizTime);
    console.log("QuizNum: " + quizNum);
    console.log("QuizCor: " + quizCor);
    console.log("QuizCorTotal: " + quizCorTotal);
    console.log("QuizAns: " + this.state.quizAns);
    console.log("quizNumTotal: " + this.state.quizNumTotal);

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

  // handle key keyPressed
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
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let text;
    let text2;

    //If fail quiz once, this brings me to instruct before confidence
    if (this.state.quizTry === 2 || this.state.quizTry === 3) {
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
          Please respond quickly and to the best of your ability - we need to
          sort the animals quickly!
          <br />
          <br />
          Let&apos;s start with a practice. In this phase we will tell you
          whether your choices are right or wrong.
          <br />
          <br />
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
          You will have {this.state.trialNumTotal} chances to choose the correct
          animals.
          <br />
          <br />
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
          As a reminder:
          <br />
          <br />
          Click the correct name of the animal you previously saw.
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

    let instruct_text10 = (
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

    let instruct_text11 = (
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
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// QUIZ TEXT ////
  // Do I need to randomise this?

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
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  tutorBegin() {
    // push to render fixation for the first trial
    this.setState({
      trialNum: 0,
    });

    console.log("TUTORIAL BEGINING");

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
      //   document.removeEventListener("keyup", this._handleQuizKey);
      //end quiz, head back to instructions
      var quizTry = this.state.quizTry;
      var tutorialTry = this.state.tutorialTry;
      //if full marks
      if (quizCorTotal === this.state.quizNumTotal) {
        console.log("PASS QUIZ");
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 12,
          taskSection: "instruct",
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry <= 2) {
        //if they got wrong for at least three times
        console.log("fAIL QUIZ");
        quizTry = quizTry + 1;
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 7,
          taskSection: "instruct",
          quizTry: quizTry,
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry > 2) {
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
    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the choice

    console.log(trialNum);
    console.log(choicePos);
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
    }

    var stimNum = s2.stimNum;
    var stairDir = s2.direction;
    var responseMatrix = s2.stepcount;

    console.log("stimNum: " + stimNum);
    console.log("stairDir: " + stairDir);
    console.log("responseMat: " + responseMatrix);

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
      responseMatrix: responseMatrix,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    console.log(this.state.trialNum);
    console.log(this.state.trialNumTotal);

    if (trialNum < this.state.trialNumTotal + 1) {
      console.log("START TRIAL");
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        10,
      );
    } else {
      // if the trials have reached the total trial number
      setTimeout(
        function () {
          this.tutorEnd();
        }.bind(this),
        10,
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
    //   document.addEventListener("keyup", this._handleRespKey);
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
    //   document.removeEventListener("keyup", this._handleRespKey);

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
        this.renderCorFb();
      }.bind(this),
      this.state.respFbTimeLag,
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    //   document.addEventListener("keyup", this._handleNextRespKey);

    var respFbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.encodeTime +
          this.state.respTime,
      ];

    var choice = this.state.choice;
    var correct = this.state.correct;
    var choiceFbRewLeft;
    var choiceFbRewRight;
    var choiceFbRewText;

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

  renderTutorSave() {
    var prolificID = this.state.prolificID;

    var blockCond = this.state.blockCond;

    //before it switch to the difficult staircase, save the dotStairEasy level
    if (blockCond == "easy") {
      this.setState({
        stimNumEasy: this.state.stimNum,
      });
    } else if (blockCond == "hard") {
      //before finish the hard one, save that too
      this.setState({
        stimNumHard: this.state.stimNum,
      });
    }

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
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,

      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairDirEasy: this.state.stairDirEasy,
      stimNumEasy: this.state.stimNumEasy,

      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairDirHard: this.state.stairDirHard,
      stimNumHard: this.state.stimNumHard,

      stimPick: stimPick,
      stimWordPick: this.state.stimWordPick,
      stimShown: stimShown,
      stimWordShown: this.state.stimWordShown,
      choiceShownWordStim1: this.state.choiceShownWordStim1,
      choiceShownWordStim2: this.state.choiceShownWordStim2,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
    };

    console.log("BEFORE TRIAL RESET");
    try {
      fetch(`${DATABASE_URL}/mem_tutorial_data/` + prolificID, {
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
      10,
    );
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
      fetch(`${DATABASE_URL}/mem_quiz_test/` + prolificID, {
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

  redirectToNextTask() {
    this.props.navigate("/MemTask?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
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

    if (this.state.instructScreen === true && this.state.taskScreen === false) {
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
        <div className={style.boxStyle2}>
          <br />
          <br />
          <DrawFix />
          <br />
          <br />
        </div>
      );
    } else if (
      this.state.instructScreen === false &&
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
      this.state.instructScreen === false &&
      this.state.taskScreen === true &&
      this.state.taskSection === "encode"
    ) {
      text = <div className={style.boxStyle}></div>;
    } else if (
      this.state.instructScreen === false &&
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
      this.state.instructScreen === false &&
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
