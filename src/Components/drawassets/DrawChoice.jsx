import React from "react";
import { Stage, Layer, Rect } from "react-konva";

var boxDist = 200; //distance between the boxes
var squareWidth = 250;
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

export const DrawChoice = ({ choice }) => {
  var leftChoice;
  var rightChoice;
  var rightColour;
  var leftColour;

  if (choice === "left") {
    leftChoice = 10;
    leftColour = "#87C1FF";
    rightChoice = 2.5;
    rightColour = "white";
  } else if (choice === "right") {
    leftChoice = 2.5;
    leftColour = "white";
    rightChoice = 10;
    rightColour = "#87C1FF";
  } else {
    leftChoice = 2.5;
    rightChoice = 2.5;
    leftColour = "white";
    rightColour = "white";
  }

  const [leftBoxState] = React.useState(leftChoice);
  const [rightBoxState] = React.useState(rightChoice);

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
          strokeWidth={leftBoxState} // border width
          stroke={leftColour} // border color
        />
        <Rect
          x={rightBoxStartX}
          y={rightBoxStartY}
          width={squareWidth}
          height={squareWidth}
          fill="black"
          strokeWidth={rightBoxState} // border width
          stroke={rightColour} // border color
        />
      </Layer>
    </Stage>
  );
};
