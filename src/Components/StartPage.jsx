import React from "react";
import withRouter from "./func/withRouter.jsx"; // Best practice to use .jsx extension

import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import { LayeredDarkPanelless } from "survey-core/themes";

import "survey-core/survey-core.css";
import "./style/surveyStyle.css"; // Your custom styles

import { json } from "./consent/consentFull.jsx";

class StartPage extends React.Component {
  constructor(props) {
    super(props);

    // --- Create the Survey Model ---
    const survey = new Model(json); // Create an instance of the Model
    survey.applyTheme(LayeredDarkPanelless); // Apply your chosen theme

    // --- Declare variables OUTSIDE the if/else ---
    let userID, prolificID, date, dateTime, startTime, condition;

    var debug = false; // Still using manual flag for now

    if (debug === true) {
      // --- Assign debug values ---
      userID = 100;
      prolificID = 100;
      date = 100; // Note: You might want a real date string here for debugging
      dateTime = 100;
      startTime = 100; // Note: You might want a real timestamp for debugging
      condition = 1;
      console.log("DEBUG MODE: Using hardcoded values.");
    } else {
      // The rest of your logic remains the same

      prolificID = this.props.state.prolificID;
      userID = Math.floor(100000 + Math.random() * 900000);
      dateTime = new Date().toLocaleString();
      var currentDate = new Date();
      var dateString = currentDate.getDate();
      var month = currentDate.getMonth();
      var year = currentDate.getFullYear();
      date = dateString + "-" + (month + 1) + "-" + year;
      startTime = currentDate.toTimeString();
      if (userID % 2 === 0) {
        condition = 1;
        console.log("Start with perception task.");
      } else {
        condition = 2;
        console.log("Start with memory task.");
      }
    }

    this.state = {
      userID: userID,
      prolificID: prolificID,
      condition: condition,
      date: dateString,
      dateTime: dateTime,
      startTime: startTime,
      consentComplete: 0,
    };

    this.survey = survey;
    this.redirectToTarget = this.redirectToTarget.bind(this);
    survey.onComplete.add(this.redirectToTarget); // Attach the onComplete event handler
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
    this.setState({ mounted: 1 });
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  redirectToTarget() {
    this.setState({ consentComplete: 1 });
    var condition = this.state.condition;
    var condUrl = "/Wellcome?PROLIFIC_PID=";

    this.props.navigate(condUrl + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        userID: this.state.userID,
        condition: condition,
        date: this.state.date,
        startTime: this.state.startTime,
      },
    });
  }

  render() {
    if (this.state.consentComplete === 0) {
      return (
        <div className="textBox">
          <center>
            <strong>INFORMATION FOR THE PARTICIPANT</strong>
          </center>
          <br />
          Please read this information page carefully. If you are happy to
          proceed, please check the boxes on the second page of this form to
          consent to this study proceeding. Please note that you cannot proceed
          to the study unless you give your full consent.
          <br />
          <br />
          <Survey model={this.survey} />
        </div>
      );
    } else {
      return null;
    }
  }
}

export default withRouter(StartPage);
