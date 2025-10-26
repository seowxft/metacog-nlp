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

    const prolificID = this.props.state?.prolificID;

    // The rest of your logic remains the same
    var dateTime = new Date().toLocaleString();
    var currentDate = new Date();
    var date = currentDate.getDate();
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();
    var userID = Math.floor(100000 + Math.random() * 900000);
    var condition = 2;

    this.state = {
      userID: userID,
      prolificID: prolificID,
      condition: condition,
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,
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
    var condUrl = "/PerTut?PROLIFIC_PID=";

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
