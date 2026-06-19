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

    var debug = false; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 1;

      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
    }

    var domain = ["memory", "perception"];
    utils.shuffle(domain);
    var finalDomain = ["general", ...domain];

    this.state = {
      // demo paramters
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      domain: finalDomain,

      //section paramters
      sectionTime: sectionTime,
      section: "domain",
      quizState: "domain",
      ratingDomain: null,
      textTime: null,
      selfKnowledge: [],
      wordCount: 0,
      minWordCount: 10,

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

    this.instructText = this.instructText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePaste = this.handlePaste.bind(this);

    // --- Bind Mouse Tracker Event Handler ---
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.ticking = false; // Performance flag for requestAnimationFrame
  }

  // --- MOUSE TRACKING EVENT HANDLER ---
  handleGlobalMouseMove(event) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        // Calculate timestamp relative to the section starting time
        const relativeTime = Math.round(
          performance.now() - this.state.sectionTime,
        );

        const currentCoord = {
          x: event.clientX,
          y: event.clientY,
          t: relativeTime,
        };

        this.setState((prevState) => ({
          mouseMovements: [...prevState.mouseMovements, currentCoord],
        }));

        this.ticking = false;
      });
      this.ticking = true;
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

  instructText(instructNum) {
    var explain;
    if (this.state.domain[instructNum - 1] === "memory") {
      //if the curren domain is memory
      explain = (
        <span>
          involve remembering what you just saw? For example, in remembering
          items you studied earlier.
          <br /> <br />
          How good do you think your are at remembering things accurately or
          knowing when a memory feels correct? What strategies do you use to
          remember things?
          <br /> <br />
        </span>
      );
    } else if (this.state.domain[instructNum - 1] === "perception") {
      explain = (
        <span>
          involve judging what you see? For example, deciding which image looks
          stronger or clearer.
          <br /> <br />
          How good do you think you are at noticing small visual details or
          deciding when you are right you spotted the detail? What strategies do
          you use to notice things?
          <br /> <br />
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        Before we begin, please tell us a bit on how you usually solve tasks.
        For example, when you face a difficult puzzle or challenging decision,
        what do you do? Do you tend to trust a 'gut feeling', try to reason it
        out, or something else?
        <br />
        <br />
        <center>
          <form onSubmit={this.handleSubmit}>
            <label>
              <textarea
                placeholder={`Describe your typical approach. Can you give examples? ${this.state.minWordCount} words minimum.`}
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
          Please do not write any self-identifiying information (e.g., your
          name, your address, etc.).
        </center>
      </div>
    );

    let instruct_text2 = (
      <div>
        How you usually do on tasks that {explain}
        <center>
          <form onSubmit={this.handleSubmit}>
            <label>
              <textarea
                placeholder={`How would you rate yourself? Can you give examples? ${this.state.minWordCount} words minimum.`}
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
          Please do not write any self-identifiying information (e.g., your
          name, your address, etc.).
        </center>
      </div>
    );

    let instruct_text3 = (
      <div>
        How you usually do on tasks that {explain}
        <center>
          <form onSubmit={this.handleSubmit}>
            <label>
              <textarea
                placeholder={`How would you rate yourself? Can you give examples? ${this.state.minWordCount} words minimum.`}
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
          Please do not write any self-identifiying information (e.g., your
          name, your address, etc.).
        </center>
      </div>
    );

    // have to use button to go to next page, because pressing spacebar when typing feedback will make it go forward prematurely
    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
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
      blockNum: null,
      quizState: this.state.quizState,
      confInitial: null,
      confLevel: null,
      textTime: this.state.textTime,
      selfKnowledge: this.state.selfKnowledge,
      // --- ADDED TRACKING KEY ---
      mouseMovements: JSON.stringify(this.state.mouseMovements),
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
    if ((instructNum === 1) | (instructNum === 2)) {
      //move to page 2
      this.setState({
        instructNum: this.state.instructNum + 1,
        selfKnowledge: [],
      });
    } else if (instructNum === 3) {
      // move to real task!
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        10,
      );
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    // --- Attach mouse listener when screen loads ---
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    // --- Clean up listener to prevent catastrophic memory leaks ---
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
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
