import React from "react";
import HiddenNotice from "./HiddenNotice.jsx";
import * as clientFlags from "./func/clientFlags.jsx";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import DrawFix from "./drawassets/DrawFix.jsx";
import * as ConfSlider from "./drawassets/DrawConfSlider.jsx";
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

    let userID,
      prolificID,
      studyID,
      sessionID,
      date,
      startTime,
      condition,
      stimNumEasy,
      stimNumHard,
      memCorrectPer,
      perCorrectPer,
      stateWord,
      statePic;

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
      stimNumEasy = 5;
      stimNumHard = 8;

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

    var trialNumTotal = 80;
    var blockNumTotal = 4;
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    var condScrabble1 = ["easy", "hard"];
    var condScrabble2 = ["easy", "hard"];
    utils.shuffle(condScrabble1);
    utils.shuffle(condScrabble2);
    var blockCondTotal = [...condScrabble1, ...condScrabble2];

    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

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
      section: "task",
      sectionTime: sectionTime,

      // trial timings in ms
      fixTimeLag: 1000,
      stimTimeLag: 1000,
      encodeTimeLag: 500,
      respFbTimeLag: 700,

      // trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      blockCondTotal: blockCondTotal,
      choicePosList: choicePos,

      // stimuli
      stateWord: stateWord,
      statePic: statePic,

      // trial by trial parameters
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
      correct: null,
      correctMat: [],
      correctPer: 0,

      textTime: null,
      selfKnowledge: [],
      wordCount: 0,
      minWordCount: 50,

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
      stimNumEasy: stimNumEasy,

      // Hard block
      correctMatHard: [],
      correctPerHard: 0,
      responseMatrixHard: [],
      stairCountHard: [], // same fix as stairCountEasy
      stairDirHard: ["up", "up"], // same fix as stairDirEasy
      stimNumHard: stimNumHard,

      // quiz
      quizState: "post",

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      postGlobalState: "domain",
      quizScreen: false,
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
    this.handleGlobalSubmit = this.handleGlobalSubmit.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleConfResp = this.handleConfResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);

    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.ticking = false;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // MOUSE TRACKING

  handleGlobalMouseMove(event) {
    const isTrackingScreen =
      this.state.taskScreen ||
      this.state.quizScreen ||
      this.state.taskSection === "break";

    if (isTrackingScreen && !this.ticking) {
      window.requestAnimationFrame(() => {
        const relativeTime = Math.round(
          performance.now() - this.state.trialTime,
        );

        let sectionTag = "unmapped";
        if (this.state.taskSection === "iti") sectionTag = "i";
        else if (this.state.taskSection === "fixation") sectionTag = "f";
        else if (this.state.taskSection === "stimulus") sectionTag = "s";
        else if (this.state.taskSection === "choice") sectionTag = "c";
        else if (this.state.taskSection === "encode") sectionTag = "e";
        else if (this.state.taskSection === "choiceFeedback") sectionTag = "fb";
        else if (this.state.taskSection === "confidence") sectionTag = "conf";
        else if (this.state.taskSection === "rating") sectionTag = "r";
        else if (this.state.taskSection === "break") sectionTag = "b";
        else if (this.state.taskSection === "global") sectionTag = "d";

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

    if (whichButton === 1 && curInstructNum === 2) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (whichButton === 2 && curInstructNum === 1) {
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  // handleBegin: no setState here, call targets directly
  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 2) {
      this.taskBegin();
    } else if (whichButton === 3 && curInstructNum === 4) {
      this.quizBegin();
    } else if (whichButton === 3 && curInstructNum === 5) {
      this.redirectToNextTask();
    }
  }

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
    this.setState({
      error: "Pasting or dropping text is not allowed in this field.",
    });
    setTimeout(() => {
      this.setState({ error: null });
    }, 3000);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.wordCount < this.state.minWordCount) {
      this.setState({
        error:
          "Please write at least " +
          this.state.minWordCount +
          " words to continue.",
      });
      return;
    }

    var timePressed = Math.round(performance.now());
    var textTime = timePressed - this.state.trialTime;

    // Pass textTime directly to renderRatingSave to avoid setState/read race
    this.renderRatingSave(textTime);
  }

  handleGlobalSubmit(event) {
    event.preventDefault();

    if (this.state.wordCount < this.state.minWordCount) {
      this.setState({
        error:
          "Please write at least " +
          this.state.minWordCount +
          " words to continue.",
      });
      return;
    }

    var timePressed = Math.round(performance.now());
    var textTime = timePressed - this.state.trialTime;

    // Pass textTime directly to renderGlobalSave to avoid setState/read race
    this.renderGlobalSave(textTime);
  }

  handleGlobalConf(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.quizScreen === true &&
      this.state.confLevel !== null
    ) {
      var textTime = timePressed - this.state.trialTime;
      this.setState({ textTime: textTime }, () => this.renderQuizSave());
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
      responseMatrix: newResponseMatrix,
      correctMat: newCorrectMat,
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

      this.setState({ confTime: confTime }, () => this.renderTaskSave());
    }
  }

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // INSTRUCTION TEXT

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
          <strong>£0.50 bonus</strong>!
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
          Thinking about the trials you just completed, how sure or unsure did
          you feel that your answers were correct? Describe this in your own
          words, including any thoughts or feelings you noticed as you answered.
          <br />
          <br />
          You can describe the block overall or particular moments.
          <br />
          <br />
          <center>
            <HiddenNotice />
            <form onSubmit={this.handleSubmit}>
              <label>
                <textarea
                  key={instructNum}
                  placeholder={`${this.state.minWordCount} words minimum.`}
                  value={this.state.selfKnowledge}
                  onChange={this.handleChange}
                  onPaste={this.handlePaste}
                  onDrop={this.handlePaste}
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
        return null;
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
            max={this.state.trialNumTotal}
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
            max={this.state.trialNumTotal}
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
        return null;
    }
  }

  domainGlobalPost(postGlobalState) {
    let quiz_text1 = (
      <div>
        <center>
          Based on how you did on this task, how would you describe your memory
          ability? Do you think you would do better or worse on other memory
          tasks?
        </center>
        <br />
        <br />
        <center>
          <HiddenNotice />
          <form onSubmit={this.handleGlobalSubmit}>
            <label>
              <textarea
                key={501}
                placeholder={`${this.state.minWordCount} words minimum.`}
                value={this.state.selfKnowledge}
                onChange={this.handleChange}
                onPaste={this.handlePaste}
                onDrop={this.handlePaste}
              />
            </label>
            <br /> <br />
            <input type="submit" value="Submit & Continue" />
            <br />
            <br />
            {this.state.error}
          </form>
          Please do not write any self-identifiying information (e.g., your
          name, your address, etc.).
        </center>
      </div>
    );

    switch (postGlobalState) {
      case "domain":
        return <div>{quiz_text1}</div>;
      default:
        return null;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // TASK TOGGLES

  quizBegin() {
    var initialValuePre = this.state.trialNumTotal / 2;
    var offset = Math.round(this.state.trialNumTotal * 0.125);
    var initialValue = utils.randomInt(
      initialValuePre - offset,
      initialValuePre + offset,
    );

    console.log("Beginning quiz");
    console.log("initialValue: " + initialValue);

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      trialTime: Math.round(performance.now()),
      textTime: null,
      quizScreen: true,
      instructScreen: false,
      taskScreen: false,
      taskSection: "rating",
      mouseMovements: [],
    });
  }

  taskBegin() {
    var blockCond = this.state.blockCondTotal[this.state.blockNum - 1];

    console.log(this.state.blockCondTotal);
    console.log(blockCond);

    var nextStimNum =
      blockCond === "easy" ? this.state.stimNumEasy : this.state.stimNumHard;

    this.setState(
      {
        blockCond: blockCond,
        stimNum: nextStimNum,
      },
      () => this.trialReset(),
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // TRIAL FLOW

  // ─────────────────────────────────────────────────────────────────────────
  // trialReset
  //
  // Owns: stairCountEasy, stairCountHard (reads outcomes written by handleResp),
  //       stairDirEasy, stairDirHard (FIX 2: now written back each trial),
  //       stimNumEasy, stimNumHard (via renderTaskSave callback)
  //
  // Does NOT touch: responseMatrix, responseMatrixEasy, responseMatrixHard,
  //                 correctMat, correctMatEasy, correctMatHard,
  //                 stairCountEasy, stairCountHard (those belong to handleResp)
  // ─────────────────────────────────────────────────────────────────────────
  trialReset() {
    var trialNum = this.state.trialNum + 1;
    var trialNumInBlock = this.state.trialNumInBlock + 1;
    var choicePos = this.state.choicePosList[trialNum - 1];
    var condEasyTrialNum = this.state.condEasyTrialNum;
    var condHardTrialNum = this.state.condHardTrialNum;

    console.log("NEW TRIAL");

    var stimNum, stairDir, newStairCountEasy, newStairCountHard;
    var s2;

    if (this.state.blockCond === "easy") {
      condEasyTrialNum = condEasyTrialNum + 1;
      s2 = staircaseEasy.staircase(
        this.state.stimNumEasy,
        this.state.stairCountEasy,
        this.state.stairDirEasy,
        condEasyTrialNum,
      );
      stimNum = s2.stimNum;
      stairDir = s2.direction;
      newStairCountEasy = s2.stepcount;
      newStairCountHard = this.state.stairCountHard; // unchanged this trial
    } else if (this.state.blockCond === "hard") {
      condHardTrialNum = condHardTrialNum + 1;
      s2 = staircase.staircase(
        this.state.stimNumHard,
        this.state.stairCountHard,
        this.state.stairDirHard,
        condHardTrialNum,
      );
      stimNum = s2.stimNum;
      stairDir = s2.direction;
      newStairCountHard = s2.stepcount;
      newStairCountEasy = this.state.stairCountEasy; // unchanged this trial
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
    var stimPick = stim.slice(-stimPickNum);
    var stimWordPick = stimWord.slice(-stimPickNum);

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
        // FIX 2: write the updated direction back to the block-specific field
        // so reversal detection carries forward correctly on the next trial.
        stairDirEasy:
          this.state.blockCond === "easy" ? stairDir : this.state.stairDirEasy,
        stairDirHard:
          this.state.blockCond === "hard" ? stairDir : this.state.stairDirHard,
        stairCountEasy: newStairCountEasy,
        stairCountHard: newStairCountHard,
        choiceFbLeft: style.choiceWord,
        choiceFbRight: style.choiceWord,
        choiceFbRewLeft: style.choiceWord,
        choiceFbRewRight: style.choiceWord,
        mouseMovements: [],
      },
      () => this.renderFix(),
    );
  }

  renderFix() {
    console.log("trialNumInBlock Fix: " + this.state.trialNumInBlock);
    var trialTime = Math.round(performance.now());
    console.log("render fix");
    this.setState({
      taskSection: "fixation",
      trialTime: trialTime,
    });

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderStim(), this.state.fixTimeLag);
  }

  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    console.log("render stim");

    // FIX 3: stimNumEasy/Hard is no longer updated here. It was updated
    // mid-trial, before handleResp fired, which created a race where
    // renderTaskSave could read the wrong value. It is now updated in
    // renderTaskSave's setState callback, consistent with MemTut.
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
    setTimeout(() => this.renderConfScale(), this.state.respFbTimeLag);
  }

  renderConfScale() {
    var initialValue = utils.randomInt(70, 80);
    var respFbTime =
      Math.round(performance.now()) -
      (this.state.trialTime +
        this.state.fixTime +
        this.state.stimTime +
        this.state.encodeTime +
        this.state.respTime);

    this.setState({
      taskSection: "confidence",
      confInitial: initialValue,
      respFbTime: respFbTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // SAVE FUNCTIONS

  renderTaskSave() {
    console.log("trialNumInBlock Save: " + this.state.trialNumInBlock);

    var blockCond = this.state.blockCond;

    // FIX 3: compute updated stimNum values here, after the full trial cycle,
    // rather than in renderStim mid-trial. renderTaskSave runs inside a setState
    // callback so state is fully settled before these reads.
    var newStimNumEasy = this.state.stimNumEasy;
    var newStimNumHard = this.state.stimNumHard;

    if (blockCond === "easy") {
      newStimNumEasy = this.state.stimNum;
    } else if (blockCond === "hard") {
      newStimNumHard = this.state.stimNum;
    }

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

      // Combined response log across all blocks
      responseMatrix: this.state.responseMatrix,

      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      stimNum: this.state.stimNum,

      // Easy block
      stimNumEasy: newStimNumEasy,
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairCountEasy: this.state.stairCountEasy,
      stairDirEasy: this.state.stairDirEasy,

      // Hard block
      stimNumHard: newStimNumHard,
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairCountHard: this.state.stairCountHard,
      stairDirHard: this.state.stairDirHard,

      stimPick: null,
      stimWordPick: this.state.stimWordPick,
      stimShown: null,
      stimWordShown: this.state.stimWordShown,
      choiceShownWordStim1: this.state.choiceShownWordStim1,
      choiceShownWordStim2: this.state.choiceShownWordStim2,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      mouseMovements: compressedMovements,
    };

    fetch(`${DATABASE_URL}/mem_task_data/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    }).catch((e) => {
      console.log("Cant post?", e);
    });

    console.log("trialNum: " + this.state.trialNum);
    console.log("trialNumPerBlock: " + this.state.trialNumPerBlock);
    console.log("trialNumInBlock: " + this.state.trialNumInBlock);
    console.log("trialNumTotal: " + this.state.trialNumTotal);

    // FIX 3: update stimNumEasy/Hard in state here, after save, then advance.
    this.setState(
      {
        stimNumEasy: newStimNumEasy,
        stimNumHard: newStimNumHard,
      },
      () => {
        if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
          console.log("REST TIME");
          this.restBlock();
        } else {
          console.log("CONTINUE TIME");
          this.trialReset();
        }
      },
    );
  }

  // textTime passed as parameter to avoid setState/read race
  renderRatingSave(textTime) {
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
      blockNum: this.state.blockNum,
      quizState: "block",
      confInitial: null,
      confLevel: null,
      textTime: textTime, // ← use parameter directly
      selfKnowledge: this.state.selfKnowledge,
      clientFlags: clientFlags.snapshot(),
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
    })
      .then(() => this.contBlock())
      .catch((e) => {
        console.log("Cant post?", e);
        this.contBlock(); // still advance even if save fails
      });
  }

  contBlock() {
    var blockNum = this.state.blockNum + 1;

    this.setState(
      {
        instructScreen: false,
        taskScreen: true,
        taskSection: "iti",
        trialNumInBlock: 0,
        blockNum: blockNum,
        textTime: 0,
        selfKnowledge: "",
        wordCount: 0,
        mouseMovements: [],
      },
      () => {
        if (this.state.trialNum === this.state.trialNumTotal) {
          this.taskEnd();
        } else {
          this.taskBegin();
        }
      },
    );
  }

  renderQuizSave() {
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
      taskSection: "global",
      mouseMovements: [],
      selfKnowledge: "",
      wordCount: 0,
      trialTime: Math.round(performance.now()),
    });
  }

  // textTime passed as parameter to avoid setState/read race
  renderGlobalSave(textTime) {
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
      section: "domain",
      sectionTime: this.state.sectionTime,
      blockNum: this.state.blockNum,
      quizState: "domain post",
      confInitial: null,
      confLevel: null,
      textTime: textTime, // ← use parameter directly
      selfKnowledge: this.state.selfKnowledge,
      clientFlags: clientFlags.snapshot(),
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
      quizScreen: false,
      instructNum: 5,
      taskSection: null,
      mouseMovements: [],
      selfKnowledge: "",
      wordCount: 0,
    });
  }

  restBlock() {
    this.setState({
      instructScreen: true,
      instructNum: 3,
      taskScreen: false,
      taskSection: "break",
      textTime: null,
      trialTime: Math.round(performance.now()),
      mouseMovements: [],
      selfKnowledge: "",
      wordCount: 0,
    });
  }

  redirectToNextTask() {
    var condition = this.state.condition;
    var perCorrectPer = this.state.perCorrectPer;
    var memCorrectPer = this.state.correctPer;

    var condUrl;
    if (condition === 1) {
      condUrl = "/Bonus?PROLIFIC_PID=";
    } else {
      condUrl = "/PerTut?PROLIFIC_PID=";
    }

    this.props.navigate(condUrl + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        studyID: this.state.studyID,
        sessionID: this.state.sessionID,
        userID: this.state.userID,
        condition: this.state.condition,
        date: this.state.date,
        startTime: this.state.startTime,
        perCorrectPer: perCorrectPer,
        memCorrectPer: memCorrectPer,
      },
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // LIFECYCLE

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    var statePic = this.state.statePic;
    [statePic].forEach((image) => {
      new Image().src = image;
    });
    this.setState({ statePic: statePic });

    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
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

  //////////////////////////////////////////////////////////////////////////////////////////////
  // RENDER

  render() {
    let text;

    if (
      this.state.instructScreen === true &&
      this.state.taskScreen === false &&
      this.state.quizScreen === false
    ) {
      text = <div>{this.instructText(this.state.instructNum)}</div>;
      console.log("Page: " + this.state.instructNum);
    } else if (
      this.state.quizScreen === true &&
      this.state.taskSection === "rating"
    ) {
      text = <div>{this.quizText(this.state.quizState)}</div>;
      console.log("Quiz state: " + this.state.quizState);
    } else if (
      this.state.quizScreen === true &&
      this.state.taskSection === "global"
    ) {
      text = <div>{this.domainGlobalPost(this.state.postGlobalState)}</div>;
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
      this.state.taskSection === "confidence"
    ) {
      text = (
        <div className={style.boxStyle}>
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
