import React from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import * as utils from "../func/utils.jsx";

///////////////////////////////////////////////////////////////////
//create black stimulus box
var squareWidth = 250; //250
var boxDist = 200; //distance between the boxes

// left box
var boxStartX = 0;
var boxStartY = 0;

export const DrawDotsEx1 = ({ dotRadius, dotDiff }) => {
  var dotCir = dotRadius * 2;

  var dotPos = utils.genDotPos(boxStartX, boxStartY, squareWidth, dotCir);

  var dotPosX = dotPos[0];
  var dotPosY = dotPos[1];
  utils.shuffleSame(dotPosX, dotPosY); // randomise the shown vs hidden dots

  var dotTotal = (squareWidth / dotCir) * (squareWidth / dotCir);

  var dotShown = Math.floor(dotTotal / 2) + dotDiff;
  var dotCorrXShown = dotPosX.slice(0, dotShown - 1);
  var dotCorrYShown = dotPosY.slice(0, dotShown - 1);

  var dotShownCoor = utils.genDots(dotCorrXShown, dotCorrYShown);
  const [dotsShow] = React.useState(dotShownCoor);

  return (
    <Stage x={0} y={0} width={250} height={250}>
      <Layer>
        <Rect
          x={boxStartX}
          y={boxStartY}
          width={squareWidth}
          height={squareWidth}
          fill="black"
          strokeWidth={2.5} // border width
          stroke="white" // border color
        />
      </Layer>
      <Layer>
        {dotsShow.map((dotsShow) => (
          <Circle
            key={dotsShow.id}
            id={dotsShow.id}
            x={dotsShow.x}
            y={dotsShow.y}
            radius={dotRadius}
            fill="white"
            opacity={1}
          />
        ))}
      </Layer>
    </Stage>
  );
};

// left box
var leftBoxStartX = 0;
var leftBoxStartY = 0;

//right box
var rightBoxStartX = boxDist + squareWidth / 2;
var rightBoxStartY = 0;

export const DrawDotsEx2 = ({ dotRadius, dotDiffLeft, dotDiffRight }) => {
  var dotCir = dotRadius * 2;

  var leftDotPos = utils.genDotPos(
    leftBoxStartX,
    leftBoxStartY,
    squareWidth,
    dotCir
  );
  var rightDotPos = utils.genDotPos(
    rightBoxStartX,
    rightBoxStartY,
    squareWidth,
    dotCir
  );

  var leftDotPosX = leftDotPos[0];
  var leftDotPosY = leftDotPos[1];
  var rightDotPosX = rightDotPos[0];
  var rightDotPosY = rightDotPos[1];

  utils.shuffleSame(leftDotPosX, leftDotPosY); // randomise the shown vs hidden dots
  utils.shuffleSame(rightDotPosX, rightDotPosY);

  var dotTotal = (squareWidth / dotCir) * (squareWidth / dotCir);

  var leftDotShown = Math.floor(dotTotal / 2) + dotDiffLeft - 50; //more the loss more pronounced
  var leftDotCorrXShown = leftDotPosX.slice(0, leftDotShown - 1);
  var leftDotCorrYShown = leftDotPosY.slice(0, leftDotShown - 1);

  var rightDotShown = Math.floor(dotTotal / 2) + dotDiffRight;
  var rightDotCorrXShown = rightDotPosX.slice(0, rightDotShown - 1);
  var rightDotCorrYShown = rightDotPosY.slice(0, rightDotShown - 1);

  var leftDotShownCoor = utils.genDots(leftDotCorrXShown, leftDotCorrYShown);
  var rightDotShownCoor = utils.genDots(rightDotCorrXShown, rightDotCorrYShown);

  const [dotsLeftShow] = React.useState(leftDotShownCoor);
  const [dotsRightShow] = React.useState(rightDotShownCoor);

  return (
    <Stage x={0} y={0} width={600} height={250}>
      <Layer>
        <Rect
          x={leftBoxStartX}
          y={leftBoxStartY}
          width={squareWidth}
          height={squareWidth}
          fill="black"
          strokeWidth={2.5} // border width
          stroke="white" // border color
        />
        <Rect
          x={rightBoxStartX}
          y={rightBoxStartY}
          width={squareWidth}
          height={squareWidth}
          fill="black"
          strokeWidth={2.5} // border width
          stroke="white" // border color
        />
      </Layer>
      <Layer>
        {dotsLeftShow.map((dotsLeftShow) => (
          <Circle
            key={dotsLeftShow.id}
            id={dotsLeftShow.id}
            x={dotsLeftShow.x}
            y={dotsLeftShow.y}
            radius={dotRadius}
            fill="white"
            opacity={1}
          />
        ))}
      </Layer>
      <Layer>
        {dotsRightShow.map((dotsRightShow) => (
          <Circle
            key={dotsRightShow.id}
            id={dotsRightShow.id}
            x={dotsRightShow.x}
            y={dotsRightShow.y}
            radius={dotRadius}
            fill="white"
            opacity={1}
          />
        ))}
      </Layer>
    </Stage>
  );
};
