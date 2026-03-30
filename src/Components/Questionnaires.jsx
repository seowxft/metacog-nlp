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

// Import your questionnaire JSON files
import { aes } from "./quest/aes.jsx";
//import { audit } from "./quest/audit.jsx";
//import { bis11 } from "./quest/bis.jsx";
//import { eat26 } from "./quest/eat.jsx";
import { gse } from "./quest/gse.jsx";
//import { lsas } from "./quest/lsas.jsx";
//import { ocir } from "./quest/ocir.jsx";
import { rse } from "./quest/rse.jsx";
import { sds } from "./quest/sds.jsx";
//import { ssms } from "./quest/ssms.jsx";
import { staiy2 } from "./quest/staiy2.jsx";
import { demo } from "./quest/demo.jsx";
//import { icar1 } from "./quest/icar1.jsx";
//import { icar2 } from "./quest/icar2.jsx";

//import { DATABASE_URL } from "./config.jsx";

class Questionnaires extends React.Component {
  constructor(props) {
    super(props);

    const sectionTime = Math.round(performance.now());
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
    }

    let quizLabel = ["AES", "SDS", "STAIY2", "RSE", "GSE"];
    let allQuizText = [aes, sds, staiy2, rse, gse];

    // Shuffle the quizzes and labels together
    utils.shuffleSame(allQuizText, quizLabel);

    // Create the pages array for the survey
    const surveyPages = [
      { questions: demo },
      ...allQuizText.map((quiz) => ({ questions: quiz })), // Map each quiz to a page object
      //   { questions: icar1 },
      //   { questions: icar2 },
    ];

    const surveyJson = {
      title: null,
      showProgressBar: "on",
      pages: surveyPages,
    };

    const survey = new Model(surveyJson); // Create an instance of the Model
    survey.applyTheme(PlainDark); // Apply your chosen theme
    // --- 2. Set the Initial State ---
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

      // Control screens
      instructScreen: true,
      questScreen: false,

      // Store shuffled labels for the timer callback
      shuffledQuizLabels: quizLabel,

      debug: debug,
    };
    // Bind methods to `this`
    this.survey = survey;
    this.redirectToNextTask = this.redirectToNextTask.bind(this);
    survey.onComplete.add(this.redirectToNextTask); // Attach the onComplete event handler

    //   this.timerCallback = this.timerCallback.bind(this);
    this.handleBeginKey = this.handleBeginKey.bind(this);
  }

  // --- 3. Manage Event Listeners in Lifecycle Methods ---
  componentDidMount() {
    window.scrollTo(0, 0);
    //document.body.style.overflow = "auto";
    // Add listener only when the component mounts
    document.addEventListener("keyup", this._handleBeginKey);
    console.log("Reload?");
  }

  componentWillUnmount() {
    // Clean up the listener when the component is removed
    document.removeEventListener("keyup", this._handleBeginKey);
  }

  startQuest() {
    // Simply update the state to show the survey
    this.setState({ questScreen: true, instructScreen: false });
  }

  handleBeginKey(keypressed) {
    if (keypressed === 3 && this.state.instructScreen) {
      // Spacebar
      this.startQuest();
    }
  }

  // --- 4. SurveyJS Callback Methods ---
  /*   onComplete(survey) {
    /*     const qnEnd = Math.round(performance.now());

    // Add final data to the survey results
    survey.setValue("prolificID", this.state.prolificID);
    survey.setValue("condition", this.state.condition);
    survey.setValue("userID", this.state.userID);
    survey.setValue("date", this.state.date);
    survey.setValue("startTime", this.state.startTime);
    survey.setValue("section", this.state.section);
    survey.setValue("sectionTime", this.state.sectionTime);
    survey.setValue("qnTimeStart", this.state.qnStart);
    survey.setValue("qnTimeEnd", qnEnd);

    const resultAsString = JSON.stringify(survey.data);
    console.log("Survey results:", resultAsString); */

  // TODO: Send data to the database
  // fetch(...)

  /*   this.redirectToNextTask();
  } 

  timerCallback(survey) {
    const page = survey.pages.indexOf(survey.currentPage);
    let quizText = "";

    if (page === 0) {
      quizText = "demo";
    } else if (page > 0 && page <= this.state.shuffledQuizLabels.length) {
      // Use the shuffled labels array
      quizText = this.state.shuffledQuizLabels[page - 1];
    } else if (page === this.state.shuffledQuizLabels.length + 1) {
      quizText = "IQ_text"; // Corresponds to icar1
    } else {
      quizText = "IQ_image"; // Corresponds to icar2
    }

    const qnTime = Math.round(performance.now());
    const qnRT = qnTime - this.state.qnTime;

    survey.setValue(`PgFinish_${quizText}`, qnTime);
    survey.setValue(`PgRT_${quizText}`, qnRT);

    this.setState({ qnTime: qnTime });
  }  */

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

  // --- 5. Render Method ---
  render() {
    let text;

    if (
      this.state.instructScreen === true &&
      this.state.questScreen === false
    ) {
      text = (
        <>
          <div className={style.bg} />
          <div className={style.textFrame}>
            <div className={style.fontStyle}>
              For the last section, we would like you to:
              <br />
              <br />
              <li>Provide some demographic information (age and gender)</li>
              <li>Complete {this.state.qnTotal} questionnaires</li>
              <li>Complete a short IQ quiz</li>
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
    } else if (
      this.state.instructScreen === false &&
      this.state.questScreen === true
    ) {
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
