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

    //when deug
    //  const userID = 100;
    //  const date = 100;
    //  const startTime = 100;

    const userID = this.props.state.userID;
    const prolificID = this.props.state.prolificID;
    const condition = this.props.state.condition;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime;

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

      debug: false,
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
  _handleInstructKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        keyPressed = 1;
        this.handleInstruct(keyPressed);
        break;
      case 39:
        //    this is right arrow
        keyPressed = 2;
        this.handleInstruct(keyPressed);
        break;
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

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
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
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
                    "https://www.nhs.uk/conditions/stress-anxiety-depression/mental-health-helplines/"
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
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          You have finished the study!
          <br />
          <br />
          <br />
          Please send a message to us on Proflic that you have completed the
          task.
          <br />
          <br />
          You may close the tab.
          <br /> <br />
          <center>
            [<strong>←</strong>]
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

  // redirectToEnd() {
  //   alert("You will now be redirected to Prolific's validation page.");
  //   document.removeEventListener("keyup", this._handleInstructKey);
  //   window.location =
  //     "https://app.prolific.co/submissions/complete?cc=C1FUHKFG"; //this will the prolific validation code
  // }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.instructScreen === true) {
      document.addEventListener("keyup", this._handleInstructKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
      //  console.log(this.state.instructNum);
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
