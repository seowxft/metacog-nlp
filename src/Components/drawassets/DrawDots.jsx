import React from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import * as utils from "../func/utils.jsx";

///////////////////////////////////////////////////////////////////
//create black stimulus box
var squareWidth = 250; //250
var boxDist = 200; //distance between the boxes
var bufferFix = 400;

var bufferFixWidWin = 0;
var bufferFixHeiWin = 200;

//left box
var leftBoxStartX =
  (window.innerWidth - bufferFixWidWin) / 2 - squareWidth / 2 - boxDist;
var leftBoxStartY = (window.innerHeight - bufferFix) / 2 - squareWidth / 2;

//right box
var rightBoxStartX =
  (window.innerWidth - bufferFixWidWin) / 2 - squareWidth / 2 + boxDist;
var rightBoxStartY = (window.innerHeight - bufferFix) / 2 - squareWidth / 2;

export const DrawDots = ({ dotRadius, dotDiffLeft, dotDiffRight }) => {
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

  var leftDotShown = Math.floor(dotTotal / 2) + dotDiffLeft;
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
    <Stage
      width={window.innerWidth - bufferFixWidWin}
      height={window.innerHeight - bufferFixHeiWin}
    >
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
