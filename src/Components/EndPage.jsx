import React from "react";
import withRouter from "./func/withRouter.jsx";

import style from "./style/perTaskStyle.module.css";
import astrodude from "./img/astronaut.png";

class EndPage extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    let userID, prolificID, date, startTime, condition;

    var debug = true; // Still using manual flag for now

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

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      // demo paramters
      prolific: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      //section paramters
      sectionTime: sectionTime,
      section: "end",

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
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// KEYBOARD HANDLES ////

  // This handles instruction screen within the component USING KEYBOARD

  handleInstruct(keyPressed) {
    var curText = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curText > 1) {
      this.setState({ instructNum: curText - 1 });
    } else if (whichButton === 2 && curText < 3) {
      this.setState({ instructNum: curText + 1 });
    } else if (whichButton === 3 && curText === 3) {
      // setTimeout(
      //   function () {
      //     this.redirectToEnd();
      //   }.bind(this),
      //   0
      // );
    }
  }
  // handle key keyPressed
  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum >= 2) {
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (whichButton === 2 && curInstructNum >= 1) {
      this.setState({ instructNum: curInstructNum + 1 });
    }
    console.log(this.state.instructNum + 1);
  }

  handleSubmit(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 3) {
      console.log("Submit to Prolific");
      setTimeout(
        function () {
          this.redirectToEnd();
        }.bind(this),
        0,
      );
    }
  }

  redirectToEnd() {
    alert("You will now be redirected to Prolific's validation page.");
    window.location = "https://app.prolific.co/submissions/complete?cc=XXXXX"; //this will the prolific validation code
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          Well done, you have completed all the tasks! Thanks for your help!
          <br />
          <br />
          Your data makes an important contribution to our understanding of
          mental health.
          <br />
          <br />
          In the two tasks, we were interested in how you evaluate your
          decisions in memory and perception.
          <br /> <br />
          Previous work have linked differences in behaviour to psychiatric
          disorders, which we are aiming to understand better.
          <br />
          <br />
          <center>
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={200} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          If you feel that completing the questionnaires caused you any
          distress, please use the following contact details for help and
          support:
          <br />
          <br />
          <i>Web page links (opens in new tab):</i>
          <br />
          <ul>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab(
                    "https://www.nhs.uk/conditions/stress-anxiety-depression/mental-health-helplines/",
                  );
                }}
              >
                <u>NHS Mental Health Helplines</u>&nbsp;
              </span>
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://www.anxietyuk.org.uk");
                }}
              >
                <u>Anxiety UK</u>&nbsp;
              </span>
              (Helpline: 03444 775 774)
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://ocdaction.org.uk/");
                }}
              >
                <u>OCD Action</u>&nbsp;
              </span>
              (Helpline: 0300 636 5478)
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://www.samaritans.org/");
                }}
              >
                <u>Samaritans</u>&nbsp;
              </span>
              (Helpline: 116 123)
            </li>
          </ul>
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>{" "}
            <button onClick={() => this.handleInstruct(2)}>
              <strong>Next →</strong>
            </button>
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          You have finished the study! Please click the 'Submit to prolific'
          button to complete the task.
          <br />
          <br />
          If you encounter any issues, please send a message to us on Proflic
          that you have completed the task.
          <br />
          <br />
          You may close the tab.
          <br /> <br />
          <center>
            <button onClick={() => this.handleInstruct(1)}>
              <strong>← Back</strong>
            </button>
            <br />
            <button onClick={() => this.handleSubmit(3)}>
              <strong>Submit to prolific</strong>
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

      default:
    }
  }

  openInNewTab(url) {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.instructScreen === true) {
      text = <div> {this.instructText(this.state.instructNum)}</div>;
    } else {
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

export default withRouter(EndPage);
