import React from "react";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

import style from "./style/perTaskStyle.module.css";
import astrodude from "./img/astronaut.png";

//import { DATABASE_URL } from "./config";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE LAST PAGE BEFORE QUESTIONNAIRES
// 1) Amount of bonus earned for both tasks
// 2) Feedback box

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

    var debug = true; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 1;
      memCorrectPer = 0.8;
      perCorrectPer = 0.5;
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

    var memBonus =
      Math.round((0.5 * memCorrectPer + Number.EPSILON) * 100) / 100; // 2 dec pl
    var perBonus =
      Math.round((0.5 * perCorrectPer + Number.EPSILON) * 100) / 100; // 2 dec pl
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
      trialTime: sectionTime,

      //section paramters
      sectionTime: sectionTime,
      section: "bonus",
      feedback: "",

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1

      astrodude: astrodude,
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

    this.handleChangeFb = this.handleChangeFb.bind(this);
    this.handleSubmitFb = this.handleSubmitFb.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  //for the feedback box
  handleChangeFb(event) {
    this.setState({
      feedback: event.target.value,
      section: "feedback",
    });
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
      memBonus: this.state.memBonus,
      perBonus: this.state.perBonus,
      totalBonus: this.state.totalBonus,
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

    let instruct_text1 = (
      <div>
        <span>
          Well done on completing both tasks!
          <br />
          <br />
          From the first task [{FirstT}], you earned a bonus of £{FirstB}. From
          the second task [{SecondT}], you earned a bonus of £{SecondB}.
          <br /> <br />
          If you have comments you have about the tasks you have completed,
          please fill in the box below and click submit. If not, leave the box
          empty and click the submit button.
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
        return <div>{instruct_text1}</div>;
      default:
    }
  }

  redirectToNextTask() {
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
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;

    if (this.state.instructScreen === true) {
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
