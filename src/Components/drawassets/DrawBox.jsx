import React from "react";
import { Stage, Layer, Rect, Text } from "react-konva";

var boxDist = 200; //distance between the boxes
var squareWidth = 250;
var bufferFix = 400;
var bufferFixWidWin = 0; //50
var bufferFixHeiWin = 200; //200

//left box
var leftBoxStartX =
  (window.innerWidth - bufferFixWidWin) / 2 - squareWidth / 2 - boxDist;
var leftBoxStartY = (window.innerHeight - bufferFix) / 2 - squareWidth / 2;

//right box
var rightBoxStartX =
  (window.innerWidth - bufferFixWidWin) / 2 - squareWidth / 2 + boxDist;
var rightBoxStartY = (window.innerHeight - bufferFix) / 2 - squareWidth / 2;

class DrawBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leftBoxStartX: leftBoxStartX,
      leftBoxStartY: leftBoxStartY,
      rightBoxStartX: rightBoxStartX,
      rightBoxStartY: rightBoxStartY,
      squareWidth: squareWidth,
    };
  }

  render() {
    let text;
    text = (
      <div>
        <Stage
          width={window.innerWidth - bufferFixWidWin}
          height={window.innerHeight - bufferFixHeiWin}
        >
          <Layer>
            <Rect
              x={this.state.leftBoxStartX}
              y={this.state.leftBoxStartY}
              width={this.state.squareWidth}
              height={this.state.squareWidth}
              fill="black"
              strokeWidth={2.5} // border width
              stroke="white" // border color
            />
            <Rect
              x={this.state.rightBoxStartX}
              y={this.state.rightBoxStartY}
              width={this.state.squareWidth}
              height={this.state.squareWidth}
              fill="black"
              strokeWidth={2.5} // border width
              stroke="white" // border color
            />
            <Text
              fill="white"
              x={this.state.leftBoxStartX}
              y={this.state.leftBoxStartY - 50}
              text="Press W for left choice."
              fontSize={16}
              fontFamily="Lucida Console"
            />
            <Text
              fill="white"
              x={this.state.rightBoxStartX}
              y={this.state.rightBoxStartY - 50}
              text="Press O for right choice."
              fontSize={16}
              fontFamily="Lucida Console"
            />
          </Layer>
        </Stage>
      </div>
    );

    return <div>{text}</div>;
  }
}

export default DrawBox;
