import React from "react";
import withRouter from "./func/withRouter.jsx";

import * as InsightSlider from "./drawassets/DrawInsightSlider.jsx";

import style from "./style/perTaskStyle.module.css";
import astrodude from "./img/astronaut.png";

//import { DATABASE_URL } from "./config";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE LAST PAGE BEFORE QUESTIONNAIRES
// 1) Insight whether the first task had impact on second task
// 2) Amount of bonus earned for both tasks
// 3) Feedback box

class Bonus extends React.Component {
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

    var memBonus = Math.round((2 * memCorrectPer + Number.EPSILON) * 100) / 100; // 2 dec pl
    var perBonus = Math.round((2 * perCorrectPer + Number.EPSILON) * 100) / 100; // 2 dec pl
    var totalBonus =
      Math.round((memBonus + perBonus) * 100 + Number.EPSILON) / 100;

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
      section: "insight",
      sectionTime: sectionTime,
      astrodude: astrodude,
      ratingInitial: 3,
      ratingValue: null,
      feedback: [],
      textTime: null,
      selfKnowledge: [],
      wordCount: 0,
      minWordCount: 10,

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      memBonus: memBonus,
      perBonus: perBonus,
      totalBonus: totalBonus,
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
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFb = this.handleChangeFb.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitFb = this.handleSubmitFb.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //for the feedback box
  handleChangeFb(event) {
    this.setState({
      feedback: event.target.value,
      section: "feedback",
    });
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

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed) {
    var timePressed = Math.round(performance.now());
    var curInstructNum = this.state.instructNum;
    var ratingValue = this.state.ratingValue;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum < 3 && ratingValue !== null) {
      var ratingTime = timePressed - this.state.sectionTime;

      this.setState({
        ratingTime: ratingTime,
      });

      setTimeout(
        function () {
          this.renderRatingSave();
        }.bind(this),
        0,
      );
    }
  }

  handleCallbackConf(callBackValue) {
    this.setState({ ratingValue: callBackValue });
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

  handleSubmitFb(event) {
    var prolificID = this.state.prolificID;

    let feedback = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      ratingTime: null,
      ratingValue: null,
      perBonus: null,
      memBonus: null,
      totalBonus: null,
      feedback: this.state.feedback,
    };

    try {
      fetch(`${DATABASE_URL}/feedback/` + prolificID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    alert("Thanks for your feedback!");
    event.preventDefault();

    setTimeout(
      function () {
        this.redirectToNextTask();
      }.bind(this),
      0,
    );
  }

  renderRatingSave() {
    var prolificID = this.state.prolificID;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: "end",
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      blockNum: null,
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

    setTimeout(
      function () {
        this.nextPg();
      }.bind(this),
      0,
    );
  }

  nextPg() {
    var instructNum = this.state.instructNum;
    console.log(instructNum);

    //move to page 2
    this.setState({
      instructNum: this.state.instructNum + 1,
      selfKnowledge: [],
    });
  }

  renderRatingSaveFb() {
    var prolificID = this.state.prolificID;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      memBonus: this.state.memBonus,
      perBonus: this.state.perBonus,
      totalBonus: this.state.totalBonus,
      feedback: null,
      textTime: this.state.textTime,
      selfKnowledge: this.state.selfKnowledge,
    };

    try {
      fetch(`${DATABASE_URL}/feedback/` + prolificID, {
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
        this.redirectToNextTask();
      }.bind(this),
      0,
    );
  }

  // Ask the second round of the self-knowledge questions
  instructText(instructNum) {
    var condition = this.state.condition;
    var FirstT;
    var SecondT;
    var FirstB;
    var SecondB;

    if (condition === 1) {
      //perform the perception task first
      FirstT = "comparing the battery cards";
      SecondT = "recognising animals you saw before";
      FirstB = this.state.perBonus;
      SecondB = this.state.memBonus;
    } else {
      //perform the memory task first
      SecondT = "comparing the battery cards";
      FirstT = "recognising animals you saw before";
      SecondB = this.state.perBonus;
      FirstB = this.state.memBonus;
    }

    let instruct_text0 = (
      <div>
        Well done on completing both tasks!
        <br />
        <br />
        Now that you’ve completed both kinds of tasks, please describe how you
        feel about your abilities. Did the first task ({FirstT}) feel easier or
        harder than the second task ({SecondT})?
        <br />
        <br />
        <center>
          <form onSubmit={this.handleSubmit}>
            <label>
              <textarea
                placeholder={`Can you give any reasons why? ${this.state.minWordCount} words minimum.`}
                value={this.state.selfKnowledge}
                onChange={this.handleChange}
                onPaste={this.handlePaste}
              />
            </label>
            <br /> <br />
            <input type="submit" value="Submit & Continue" />
            <br />
            <br />
            {this.state.error}
          </form>
        </center>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={200} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text1 = (
      <div>
        Do you feel more or less confident about your judgments now compared
        with before you started? You can also mention anything you noticed about
        what helps or hinders your ability to tell when you are right.
        <br />
        <br />
        <center>
          <form onSubmit={this.handleSubmit}>
            <label>
              <textarea
                placeholder={`Can you give any reasons why? ${this.state.minWordCount} words minimum.`}
                value={this.state.selfKnowledge}
                onChange={this.handleChange}
                onPaste={this.handlePaste}
              />
            </label>
            <br /> <br />
            <input type="submit" value="Submit & Continue" />
            <br />
            <br />
            {this.state.error}
          </form>
        </center>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={200} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          From the first task [{FirstT}], you earned a bonus of £{FirstB}. From
          the second task [{SecondT}], you earned a bonus of £{SecondB}.
          <br /> <br />
          We would love to hear any comments you have about the tasks you have
          completed.
          <br /> <br />
          If you have any, please fill in the box below and click submit. If
          not, leave the box empty and click the submit button.
          <br />
          <br />
          <center>
            <form onSubmit={this.handleSubmitFb}>
              <label>
                <textarea
                  placeholder="Were the task instructions clear? Did you encounter any problems? Did you prefer to use the mouse or the keyboard to rate your confidence?"
                  value={this.state.feedback}
                  onChange={this.handleChangeFb}
                />
              </label>
              <br />
              <br />
              <input type="submit" value="Submit & Continue" />
            </form>
          </center>
        </span>
      </div>
    );

    // have to use button to go to next page, because pressing spacebar when typing feedback will make it go forward prematurely
    switch (instructNum) {
      case 1:
        return <div>{instruct_text0}</div>;
      case 2:
        return <div>{instruct_text1}</div>;
      case 3:
        return <div>{instruct_text2}</div>;
      default:
    }
  }

  redirectToNextTask() {
    //  document.removeEventListener("keyup", this._handleInstructKey);
    this.props.navigate(
      "/Questionnaires?PROLIFIC_PID=" + this.state.prolificID,
      {
        state: {
          prolificID: this.state.prolificID,
          condition: this.state.condition,
          userID: this.state.userID,
          date: this.state.date,
          startTime: this.state.startTime,
        },
      },
    );

    //    console.log("UserID: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (this.state.instructScreen === true) {
      //   document.addEventListener("keyup", this._handleInstructKey);
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

export default withRouter(Bonus);
