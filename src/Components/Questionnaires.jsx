import React from "react";
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
//import { aes } from "./quest/aes.jsx";
//import { gse } from "./quest/gse.jsx";
//import { rse } from "./quest/rse.jsx";
//import { sds } from "./quest/sds.jsx";
//import { staiy2 } from "./quest/staiy2.jsx";
import { demo } from "./quest/demo.jsx";

import { DATABASE_URL } from "./config.jsx";

///////////NOTE TO ADD MORE CATCH QUESTIONS BEFORE DEPLOYING!!!

class Questionnaires extends React.Component {
  constructor(props) {
    super(props);

    const sectionTime = Math.round(performance.now());
    let userID, prolificID, date, startTime, condition;

    var debug = true; // Set flag as needed

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

    let quizLabel = []; //add the quiz labels here e.g. "RSE"
    let allQuizText = []; //add the quiz variable in here

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
      sectionTime,
      qnStart: sectionTime,
      qnTime: sectionTime,
      qnTotal: quizLabel.length,

      // Display screens
      instructScreen: true,
      questScreen: false,

      // Tracking variables
      shuffledQuizLabels: quizLabel,

      // Object mapping page names to coordinate arrays: { "demo": [...], "AES": [...] }
      mouseMovements: {},

      currentPageName: "demo",
      pageStartTime: sectionTime,

      debug,
    };

    this.survey = survey;
    this.ticking = false;

    // Bind instance methods
    this.handleBeginKey = this.handleBeginKey.bind(this);
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.onComplete = this.onComplete.bind(this);
    this.redirectToNextTask = this.redirectToNextTask.bind(this);

    // Attach SurveyJS event listeners
    survey.onComplete.add(this.onComplete);
    survey.onCurrentPageChanged.add(this.handlePageChange);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener("mousemove", this.handleGlobalMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleGlobalMouseMove);
  }

  // --- Mouse Movement Handler (Stores array per active page key) ---
  handleGlobalMouseMove(event) {
    if (this.state.questScreen && !this.ticking) {
      window.requestAnimationFrame(() => {
        const now = Math.round(performance.now());
        const relativePageTime = now - this.state.pageStartTime;
        const activePage = this.state.currentPageName;

        const currentCoord = {
          x: event.clientX,
          y: event.clientY,
          t: relativePageTime, // Relative time spent on current page (ms)
        };

        this.setState((prevState) => {
          const existingPageMovements =
            prevState.mouseMovements[activePage] || [];

          return {
            mouseMovements: {
              ...prevState.mouseMovements,
              [activePage]: [...existingPageMovements, currentCoord],
            },
          };
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

    // --- Downsample, Compress, and Failsafe Cap Per Page ---
    const sampleRate = 3; // Keep 1 out of every 3 points
    const maxTotalChars = 9000; // Safe budget for DB text column limit (10000)
    const pages = Object.keys(this.state.mouseMovements);
    const maxCharsPerPage = Math.floor(maxTotalChars / (pages.length || 1));

    const compressedMovements = {};

    pages.forEach((pageName) => {
      const pageArray = this.state.mouseMovements[pageName] || [];

      let pageString = pageArray
        .filter((_, index) => index % sampleRate === 0)
        .map((m) => `${m.x},${m.y},${m.t}`)
        .join("|");

      // --- FAILSAFE: Truncate if page string exceeds equal share limit ---
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
    });
  }

  handleBeginKey(keypressed) {
    if (keypressed === 3 && this.state.instructScreen) {
      this.startQuest();
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
              For the last section, we would like you to:
              <br />
              <br />
              <li>Provide some demographic information (age and gender)</li>
              {/* <li>Complete {this.state.qnTotal} questionnaires</li> */}
              {/*<li>Complete a short IQ quiz</li>*/}
              <br />
              Do read the instructions for each quiz, which will be positioned
              at the top of each page, carefully.
              <br />
              <br />
              <center>
                <button onClick={() => this.handleBeginKey(3)}>BEGIN</button>
              </center>
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
