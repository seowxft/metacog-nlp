import React from "react";
import HiddenNotice from "./HiddenNotice.jsx";
import withRouter from "./func/withRouter.jsx";
import * as utils from "./func/utils.jsx";

// Import SurveyJS components
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import { PlainDark } from "survey-core/themes";

// Import SurveyJS styles
import "survey-core/survey-core.css";
import "./style/surveyStyle.css"; // Your custom styles

import style from "./style/questStyle.module.css";

// Import questionnaire JSON files
import { phq } from "./quest/phq.jsx";
import { gad } from "./quest/gad.jsx";
import { demo } from "./quest/demo.jsx";

import { DATABASE_URL } from "./config.jsx";

///////////NOTE TO ADD MORE CATCH QUESTIONS BEFORE DEPLOYING!!!

class Questionnaires extends React.Component {
  constructor(props) {
    super(props);

    const sectionTime = Math.round(performance.now());
    let userID, prolificID, date, startTime, condition;

    var debug = false; // Set flag as needed

    if (debug === true) {
      userID = 100;
      prolificID = 100;
      date = "100";
      startTime = 100;
      condition = 1;
      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      prolificID = this.props.state.prolificID;
      condition = this.props.state.condition;
      userID = this.props.state.userID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
    }

    let quizLabel = ["PHQ", "GAD"]; //add the quiz labels here e.g. "RSE"
    let allQuizText = [phq, gad]; //add the quiz variable in here

    // Shuffle the quizzes and labels together
    utils.shuffleSame(allQuizText, quizLabel);

    // Build pages array with explicit page names for tracking
    const surveyPages = [
      { name: "demo", questions: demo },
      ...allQuizText.map((quiz, idx) => ({
        name: quizLabel[idx],
        questions: quiz,
      })),
    ];

    const surveyJson = {
      title: null,
      showProgressBar: "on",
      pages: surveyPages,
    };

    const survey = new Model(surveyJson);
    survey.applyTheme(PlainDark);

    this.state = {
      // User and session info
      prolificID,
      condition,
      userID,
      date,
      startTime,
      section: "psych",
      trialTime: sectionTime,
      qnStart: sectionTime,
      qnTime: sectionTime,
      qnTotal: quizLabel.length,

      //section paramters
      sectionTime: sectionTime,
      quizState: "psych",
      textTime: null,
      selfKnowledge: "",
      wordCount: 0,
      minWordCount: 100, //100

      // Display screens
      instructScreen: true,
      instructNum: 1, //start from 1
      questScreen: false,

      // Tracking variables
      shuffledQuizLabels: quizLabel,

      // Object mapping page names to coordinate arrays: { "demo": [...], "AES": [...] }
      mouseMovements: [],

      currentPageName: "demo",
      pageStartTime: sectionTime,

      debug,
    };

    this.survey = survey;
    this.ticking = false;

    // Bind instance methods
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.onComplete = this.onComplete.bind(this);
    this.redirectToNextTask = this.redirectToNextTask.bind(this);
    this.handleInstruct = this.handleInstruct.bind(this);

    this.instructText = this.instructText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePaste = this.handlePaste.bind(this);

    // --- Bind Mouse Tracker Event Handler ---
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.ticking = false; // Performance flag for requestAnimationFrame

    // Attach SurveyJS event listeners
    survey.onComplete.add(this.onComplete);
    survey.onCurrentPageChanged.add(this.handlePageChange);
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    // Force the browser to allow scrolling on this page
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
  }

  // --- MODIFIED MOUSE TRACKING EVENT HANDLER ---
  // --- Mouse Movement Handler (Stores array per active page key) ---
  handleGlobalMouseMove(event) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const now = Math.round(performance.now());
        const relativePageTime = now - this.state.pageStartTime;

        // --- FIX: Check if we are on the instruction screen first ---
        let activePage = this.state.currentPageName;
        if (this.state.instructScreen) {
          activePage = "instructions";
        }

        // Properly declare and assign sectionTag here
        let sectionTag = "unmapped";
        if (activePage === "instructions") {
          sectionTag = "mh";
        } else {
          sectionTag = activePage;
        }

        const currentCoord = {
          x: event.clientX,
          y: event.clientY,
          t: relativePageTime,
          p: sectionTag, // Assigns 'mh' during instructions, or the page name elsewhere
        };

        this.setState((prevState) => {
          if (activePage === "instructions") {
            // Treat mouseMovements as a flat array
            // Safety check: ensure prevState.mouseMovements is actually an array before spreading
            const prevMovements = Array.isArray(prevState.mouseMovements)
              ? prevState.mouseMovements
              : [];

            return {
              mouseMovements: [...prevMovements, currentCoord],
            };
          } else {
            // Treat mouseMovements as an object grouped by page name
            const existingPageMovements =
              prevState.mouseMovements[activePage] || [];

            return {
              mouseMovements: {
                ...prevState.mouseMovements,
                [activePage]: [...existingPageMovements, currentCoord],
              },
            };
          }
        });

        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  // --- Page Change Event Handler ---
  handlePageChange(sender) {
    const activePage = sender.currentPage;
    const pageName = activePage ? activePage.name : "unknown";
    const qnTime = Math.round(performance.now());
    const qnRT = qnTime - this.state.qnTime;

    // Log reaction time and finish time for previous page into SurveyJS data
    sender.setValue("PgFinish_" + this.state.currentPageName, qnTime);
    sender.setValue("PgRT_" + this.state.currentPageName, qnRT);

    this.setState({
      currentPageName: pageName,
      pageStartTime: qnTime,
      qnTime,
    });
  }

  // --- On Survey Completion / Save Data ---
  onComplete(survey) {
    const qnEnd = Math.round(performance.now());
    const qnRT = qnEnd - this.state.qnTime;

    // Log reaction time for the final page
    survey.setValue("PgFinish_" + this.state.currentPageName, qnEnd);
    survey.setValue("PgRT_" + this.state.currentPageName, qnRT);

    // Set metadata fields
    survey.setValue("prolificID", this.state.prolificID);
    survey.setValue("condition", this.state.condition);
    survey.setValue("userID", this.state.userID);
    survey.setValue("date", this.state.date);
    survey.setValue("startTime", this.state.startTime);
    survey.setValue("section", this.state.section);
    survey.setValue("sectionTime", this.state.sectionTime);
    survey.setValue("qnTimeStart", this.state.qnStart);
    survey.setValue("qnTimeEnd", qnEnd);
    survey.setValue("windowWidth", window.innerWidth);
    survey.setValue("windowHeight", window.innerHeight);

    // --- Downsample, Compress, and Failsafe Cap Per Page ---
    const sampleRate = 3; // Keep 1 out of every 3 points
    const maxTotalChars = 9000; // Safe budget for DB text column limit (10000)
    const pages = Object.keys(this.state.mouseMovements);
    const maxCharsPerPage = Math.floor(maxTotalChars / (pages.length || 1));

    const compressedMovements = {};

    pages.forEach((pageName) => {
      const pageArray = this.state.mouseMovements[pageName];

      // Safety check: ensure it's an array before filtering
      if (!Array.isArray(pageArray)) return;

      // Create the string (only using 'let' once!)
      let pageString = pageArray
        .filter((_, index) => index % sampleRate === 0)
        .map((m) => `${m.x},${m.y},${m.t}`)
        .join("|");

      // Failsafe: Truncate if page string exceeds equal share limit
      if (pageString.length > maxCharsPerPage) {
        pageString = pageString.substring(0, maxCharsPerPage);
        const lastPipe = pageString.lastIndexOf("|");
        if (lastPipe !== -1) {
          pageString = pageString.substring(0, lastPipe);
        }
      }

      compressedMovements[pageName] = pageString;
    });

    // Save compressed mouse movements object directly into survey data payload
    survey.setValue("mouseMovements", compressedMovements);

    const resultAsString = JSON.stringify(survey.data);

    fetch(`${DATABASE_URL}/psych_quiz/` + this.state.prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: resultAsString,
    })
      .then(() => {
        this.redirectToNextTask();
      })
      .catch((err) => {
        console.error("Error saving survey data:", err);
        // Navigate onward even if POST fails so participant is not stuck
        this.redirectToNextTask();
      });
  }

  startQuest() {
    const now = Math.round(performance.now());
    this.setState({
      questScreen: true,
      instructScreen: false,
      pageStartTime: now,
      qnStart: now,
      qnTime: now,
      mouseMovements: {}, // <-- ADD THIS: Reset to clean object for the survey
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

    // Set the error state to show the message inline
    this.setState({
      error: "Pasting or dropping text is not allowed in this field.",
    });

    // Optional: Clear the error message after 3 seconds so it doesn't stay there forever
    setTimeout(() => {
      this.setState({ error: null });
    }, 3000);
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
    var textTime = timePressed - this.state.trialTime;

    this.setState({
      textTime: textTime,
    });

    setTimeout(
      function () {
        this.renderRatingSave();
      }.bind(this),
      0,
    );
  }

  renderRatingSave() {
    var prolificID = this.state.prolificID;

    console.log("this.state.instructNum: " + this.state.instructNum);

    // Downsample processing logic to keep character count below DB limits
    var sampleRate = 3;
    var maxChars = 9000; // Failsafe budget for DB text column limit (10000)

    // --- NEW FIX: Safely handle if mouseMovements is an Object or an Array ---
    var rawMovements = [];
    if (this.state.mouseMovements) {
      if (Array.isArray(this.state.mouseMovements)) {
        rawMovements = this.state.mouseMovements;
      } else {
        // Extracts arrays from the object { "demo": [...] } and flattens them
        rawMovements = Object.values(this.state.mouseMovements).flat();
      }
    }

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
      task: "psych",
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

    setTimeout(
      function () {
        this.startQuest();
      }.bind(this),
      0,
    );
  }

  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum === 2) {
      // from page 2 , I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (whichButton === 2 && curInstructNum === 1) {
      // from page 1 , I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  // Ask the second round of the self-knowledge questions
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          For the last section, we would like you to:
          <br />
          <br />
          <li>Describe your mental health</li>
          <li>Provide some demographic information (age and gender)</li>
          <li>Complete {this.state.qnTotal} questionnaires</li>
          {/*<li>Complete a short IQ quiz</li>*/}
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

    let instruct_text2 = (
      <div>
        <span>
          Please, in your own words, describe your mental health. You may
          describe your mood, how you are feeling, or any emotional or cognitive
          difficulties you are having, but do not divulge personally identifying
          information.
          <br />
          <br />
          <center>
            <HiddenNotice />
            <form onSubmit={this.handleSubmit}>
              <label>
                <textarea
                  key={instructNum} // <--- ADD THIS KEY
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
        </span>
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

  redirectToNextTask() {
    this.props.navigate("/End?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        condition: this.state.condition,
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
      },
    });
  }

  render() {
    let text;

    if (this.state.instructScreen && !this.state.questScreen) {
      text = (
        <>
          <div className={style.bg} />
          <div className={style.textFrame}>
            <div className={style.fontStyle}>
              {this.instructText(this.state.instructNum)}
            </div>
          </div>
        </>
      );
    } else if (!this.state.instructScreen && this.state.questScreen) {
      text = (
        <div>
          <Survey model={this.survey} />
        </div>
      );
    }

    return <div className="textBox2">{text}</div>;
  }
}

export default withRouter(Questionnaires);
