import React from "react";
import HiddenNotice from "./HiddenNotice.jsx";
import * as clientFlags from "./func/clientFlags.jsx";
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

    let userID,
      prolificID,
      studyID,
      sessionID,
      date,
      startTime,
      condition,
      memCorrectPer,
      perCorrectPer,
      dotStairEasy,
      dotStairHard;

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
      dotStairEasy = 2;
      dotStairHard = 1;
      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      studyID = this.props.state.studyID;
      sessionID = this.props.state.sessionID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      dotStairEasy = this.props.state.dotStairEasy;
      dotStairHard = this.props.state.dotStairHard;
      memCorrectPer = this.props.state.memCorrectPer;
      perCorrectPer = this.props.state.perCorrectPer;
    }

    var trialNumTotal = 80;
    var blockNumTotal = 4;
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    var condScrabble1 = ["easy", "hard"];
    var condScrabble2 = ["easy", "hard"];
    utils.shuffle(condScrabble1);
    utils.shuffle(condScrabble2);
    var blockCondTotal = [...condScrabble1, ...condScrabble2];

    var stimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(stimPos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      studyID: studyID,
      sessionID: sessionID,
      prolificID: prolificID,
      condition: condition,
      date: date,
      startTime: startTime,
      section: "task",
      sectionTime: sectionTime,

      // trial timings in ms
      fixTimeLag: 1000,
      stimTimeLag: 300,
      respFbTimeLag: 700,

      // trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      blockCondTotal: blockCondTotal,
      stimPosList: stimPos,

      // trial by trial parameters
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
      confTime: 0,
      confInitial: null,
      correct: null,
      correctMat: [],
      correctPer: 0,
      textTime: null,
      selfKnowledge: [],
      wordCount: 0,
      minWordCount: 50,

      // dot parameters
      dotRadius: 5,

      // --- responseMatrix: combined log of all responses (easy + hard), updated only in handleResp ---
      responseMatrix: [],

      reversals: 0,
      stairDir: null,
      dotStair: null,
      dotStairLeft: 0,
      dotStairRight: 0,

      // --- Easy block: response log and staircase step history kept strictly separate ---
      correctMatEasy: [],
      correctPerEasy: 0,
      responseMatrixEasy: [], // per-trial response log, updated only in handleResp
      stairCountEasy: [], // staircase step history, updated only in trialReset
      stairDirEasy: ["up", "up"],
      dotStairEasy: dotStairEasy,

      // --- Hard block: same separation ---
      correctMatHard: [],
      correctPerHard: 0,
      responseMatrixHard: [], // per-trial response log, updated only in handleResp
      stairCountHard: [], // staircase step history, updated only in trialReset
      stairDirHard: ["up", "up"],
      dotStairHard: dotStairHard,

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
      correctMatEasy,
      responseMatrixHard,
      correctMatHard,
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
      Object.assign(stateUpdates, {
        responseMatrixEasy: newResponseMatrixEasy,
        correctMatEasy: newCorrectMatEasy,
        correctPerEasy:
          Math.round((utils.getAvg(newCorrectMatEasy) + Number.EPSILON) * 100) /
          100,
      });
    } else if (blockCond === "hard") {
      var newCorrectMatHard = correctMatHard.concat(correct);
      var newResponseMatrixHard = responseMatrixHard.concat(response ? 1 : 0);
      Object.assign(stateUpdates, {
        responseMatrixHard: newResponseMatrixHard,
        correctMatHard: newCorrectMatHard,
        correctPerHard:
          Math.round((utils.getAvg(newCorrectMatHard) + Number.EPSILON) * 100) /
          100,
      });
    }

    this.setState(stateUpdates, () => this.renderChoiceFb());
  }

  handleConfResp(keyPressed) {
    var timePressed = Math.round(performance.now());
    var whichButton = keyPressed;
    if (whichButton === 3 && this.state.confLevel !== null) {
      var confTime =
        timePressed -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
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
        return null;
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
            max={this.state.trialNumTotal}
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
            max={this.state.trialNumTotal}
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
        return null;
    }
  }

  domainGlobalPost(postGlobalState) {
    let quiz_text1 = (
      <div>
        <center>
          Based on how you did on this task, how would you describe your ability
          to make visual judgements? Do you think you would do better or worse
          on other visual tasks?
        </center>
        <br />
        <br />
        <center>
          <HiddenNotice />
          <form onSubmit={this.handleGlobalSubmit}>
            <label>
              <textarea
                key={500}
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

    var nextDotStair =
      blockCond === "easy" ? this.state.dotStairEasy : this.state.dotStairHard;

    this.setState(
      {
        blockCond: blockCond,
        dotStair: nextDotStair,
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
  // Owns: stairCountEasy, stairCountHard, dotStairEasy, dotStairHard,
  //       stairDirEasy, stairDirHard
  //
  // Does NOT touch: responseMatrix, responseMatrixEasy, responseMatrixHard,
  //                 correctMat, correctMatEasy, correctMatHard (those belong to handleResp)
  // ─────────────────────────────────────────────────────────────────────────
  trialReset() {
    this.extractedLeft = null;
    this.extractedRight = null;

    var trialNum = this.state.trialNum + 1;
    var trialNumInBlock = this.state.trialNumInBlock + 1;
    var stimPos = this.state.stimPosList[trialNum - 1];
    var condEasyTrialNum = this.state.condEasyTrialNum;
    var condHardTrialNum = this.state.condHardTrialNum;

    var dotStair, stairDir, newStairCountEasy, newStairCountHard;
    var s2;

    if (this.state.blockCond === "easy") {
      condEasyTrialNum = condEasyTrialNum + 1;
      s2 = staircaseEasy.staircase(
        this.state.dotStairEasy,
        this.state.stairCountEasy,
        this.state.stairDirEasy,
        condEasyTrialNum,
      );
      dotStair = s2.diff;
      stairDir = s2.direction;
      newStairCountEasy = s2.stepcount;
      newStairCountHard = this.state.stairCountHard; // unchanged this trial
    } else if (this.state.blockCond === "hard") {
      condHardTrialNum = condHardTrialNum + 1;
      s2 = staircase.staircase(
        this.state.dotStairHard,
        this.state.stairCountHard,
        this.state.stairDirHard,
        condHardTrialNum,
      );
      dotStair = s2.diff;
      stairDir = s2.direction;
      newStairCountHard = s2.stepcount;
      newStairCountEasy = this.state.stairCountEasy; // unchanged this trial
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
        choice: null,
        correct: null,
        correctPer: null,
        stimPos: stimPos,
        reversals: reversals,
        stairDir: stairDir,
        stairCountEasy: newStairCountEasy, // single source of truth for staircase history
        stairCountHard: newStairCountHard, // single source of truth for staircase history
        dotDiffStim1: Math.round(Math.exp(dotStair)),
        dotDiffStim2: 0,
        dotStair: dotStair,
        dotStairLeft: dotStairLeft,
        dotStairRight: dotStairRight,
        dotDiffLeft: dotDiffLeft,
        dotDiffRight: dotDiffRight,
        mouseMovements: [],
      },
      () => this.renderFix(),
    );
  }

  renderFix() {
    var trialTime = Math.round(performance.now());
    this.setState({
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
      // Update the active block's dotStair in the same setState call
      ...(this.state.blockCond === "easy"
        ? { dotStairEasy: this.state.dotStair }
        : { dotStairHard: this.state.dotStair }),
    });

    // Deliberate timing delay — keep setTimeout
    setTimeout(() => this.renderChoice(), this.state.stimTimeLag);
  }

  renderChoice() {
    var stimTime =
      Math.round(performance.now()) -
      (this.state.trialTime + this.state.fixTime);

    this.setState({
      taskSection: "choice",
      stimTime: stimTime,
    });
  }

  renderChoiceFb() {
    this.setState({ taskSection: "choiceFeedback" });

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
    var prolificID = this.state.prolificID;
    var blockCond = this.state.blockCond;

    var newDotStairEasy = this.state.dotStairEasy;
    var newDotStairHard = this.state.dotStairHard;

    if (blockCond === "easy") {
      newDotStairEasy = this.state.dotStair;
    } else if (blockCond === "hard") {
      newDotStairHard = this.state.dotStair;
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

    var compressedLeft = (this.extractedLeft || [])
      .map((d) => `${Math.round(d.x)},${Math.round(d.y)}`)
      .join("|");

    var compressedRight = (this.extractedRight || [])
      .map((d) => `${Math.round(d.x)},${Math.round(d.y)}`)
      .join("|");

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

      // Combined response log across all blocks
      responseMatrix: this.state.responseMatrix,

      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      dotStair: this.state.dotStair,

      // Easy block
      dotStairEasy: newDotStairEasy,
      correctMatEasy: this.state.correctMatEasy,
      correctPerEasy: this.state.correctPerEasy,
      responseMatrixEasy: this.state.responseMatrixEasy,
      stairCountEasy: this.state.stairCountEasy, // ← now saved
      stairDirEasy: this.state.stairDirEasy,

      // Hard block
      dotStairHard: newDotStairHard,
      correctMatHard: this.state.correctMatHard,
      correctPerHard: this.state.correctPerHard,
      responseMatrixHard: this.state.responseMatrixHard,
      stairCountHard: this.state.stairCountHard, // ← now saved
      stairDirHard: this.state.stairDirHard,

      dotStairLeft: this.state.dotStairLeft,
      dotStairRight: this.state.dotStairRight,
      leftDotsArray: compressedLeft,
      rightDotsArray: compressedRight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      mouseMovements: compressedMovements,
    };

    fetch(`${DATABASE_URL}/per_task_data/` + prolificID, {
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
        dotStairEasy: newDotStairEasy,
        dotStairHard: newDotStairHard,
      },
      () => {
        if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
          this.restBlock();
        } else {
          this.trialReset();
        }
      },
    );
  }

  // textTime passed as parameter to avoid setState/read race
  renderRatingSave(textTime) {
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
      trialTime: Math.round(performance.now()),
      mouseMovements: [],
      selfKnowledge: "",
      wordCount: 0,
    });
  }

  redirectToNextTask() {
    var condition = this.state.condition;
    var perCorrectPer = this.state.correctPer;
    var memCorrectPer = this.state.memCorrectPer;

    var condUrl;
    if (condition === 1) {
      condUrl = "/MemPreTut?PROLIFIC_PID=";
    } else {
      condUrl = "/Bonus?PROLIFIC_PID=";
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
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
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
    } else if (
      this.state.quizScreen === true &&
      this.state.taskSection === "rating"
    ) {
      text = <div>{this.quizText(this.state.quizState)}</div>;
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
            extractDots={(left, right) => {
              this.extractedLeft = left;
              this.extractedRight = right;
            }}
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
