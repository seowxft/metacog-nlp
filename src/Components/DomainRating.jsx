import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import * as ConfSliderDomain from "./drawassets/DrawConfSliderDomain.jsx";

import style from "./style/memTaskStyle.module.css";

import { DATABASE_URL } from "./config.jsx";

class RatingDomain extends React.Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    // --- Declare variables OUTSIDE the if/else ---
    let userID, prolificID, date, startTime, condition;

    var debug = true; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 100;

      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      stimNum = this.props.state.stimNum;
    }

    var domain = ["memory", "perception"];
    utils.shuffle(domain);

    this.state = {
      // demo paramters
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      domain: domain,

      //section paramters
      sectionTime: sectionTime,
      section: "domain",
      quizState: "domain",

      confTimeInitial: null,
      confTime: null,
      confInitial: 5,
      confLevel: null,

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1

      debug: debug,
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
    this.instructText = this.instructText.bind(this);
  }

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed, timePressed) {
    var curInstructNum = this.state.instructNum;
    var confLevel = this.state.confLevel;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum < 3 && confLevel !== null) {
      var confTime = timePressed - this.state.sectionTime;

      this.setState({
        confTime: confTime,
      });

      setTimeout(
        function () {
          this.renderRatingSave();
        }.bind(this),
        0
      );
    }
  }

  // handle key keyPressed
  _handleInstructKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleInstruct(keyPressed, timePressed);
        break;
      default:
    }
  };

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
  }

  instructText(instructNum) {
    var explain;
    if (this.state.domain[instructNum - 1] === "memory") {
      //if the curren domain is memory
      explain = (
        <span>
          For example, in remembering events that you experienced a long time
          ago.
        </span>
      );
    } else if (this.state.domain[instructNum - 1] === "perception") {
      explain = (
        <span>
          For example, how good you are at spotting hidden things, like birds in
          a forest.
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        Wellcome to this study!
        <br />
        <br />
        Before we begin the tasks, we would like to ask 2 questions:
        <br />
        <br />
        1. How you do generally rate your {this.state.domain[0]} ability?{" "}
        {explain}
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderDomain.ConfSliderDomain
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
          <br />
          <br />
        </center>
        <center>
          Press the [SPACEBAR] to continue.
          <br /> <br />
          You will need to have moved the slider to continue.
        </center>
      </div>
    );

    let instruct_text2 = (
      <div>
        2. How you do generally rate your {this.state.domain[1]} ability?{" "}
        {explain}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderDomain.ConfSliderDomain
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
          <br />
          <br />
        </center>
        <center>
          Press the [SPACEBAR] to continue.
          <br /> <br />
          You will need to have moved the slider to continue.
        </center>
      </div>
    );

    // have to use button to go to next page, because pressing spacebar when typing feedback will make it go forward prematurely
    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      default:
    }
  }

  renderRatingSave() {
    var prolificID = this.state.prolificID;
    var task = this.state.domain[this.state.instructNum - 1];

    console.log("this.state.instructNum: " + this.state.instructNum);
    console.log("this.state.domain: " + this.state.domain);
    console.log("task:" + task);

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
      //  confTime: this.state.confTime,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
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

    setTimeout(
      function () {
        this.nextPg();
      }.bind(this),
      0
    );
  }

  nextPg() {
    var instructNum = this.state.instructNum;
    if (instructNum === 1) {
      //move to page 2
      this.setState({
        instructNum: this.state.instructNum + 1,
        confInitial: 5,
        confLevel: null,
      });
    } else if (instructNum === 2) {
      // move to real task!
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        10
      );
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  redirectToTarget() {
    document.removeEventListener("keyup", this._handleInstructKey);
    var condition = this.state.condition;
    var condUrl;

    if (condition === 1) {
      //On click consent, sent to perception task
      condUrl = "/PerTut?PROLIFIC_PID=";
    } else {
      //On click consent, sent to memory task
      condUrl = "/MemPreTut?PROLIFIC_PID=";
    }

    this.props.navigate(condUrl + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        userID: this.state.userID,
        condition: condition,
        date: this.state.date,
        startTime: this.state.startTime,

        memCorrectPer: 0,
        perCorrectPer: 0,
      },
    });
  }
  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (this.state.instructScreen === true) {
      document.addEventListener("keyup", this._handleInstructKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
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

export default withRouter(RatingDomain);
