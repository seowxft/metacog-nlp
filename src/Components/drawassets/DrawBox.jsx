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

// Define the default and hover colors
const DEFAULT_COLOR = "white";
const HIGHLIGHT_COLOR = "#87C1FF"; // Slightly lighter gray for highlight

class DrawBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leftBoxStartX: leftBoxStartX,
      leftBoxStartY: leftBoxStartY,
      rightBoxStartX: rightBoxStartX,
      rightBoxStartY: rightBoxStartY,
      squareWidth: squareWidth,
      leftBoxStroke: DEFAULT_COLOR,
      rightBoxStroke: DEFAULT_COLOR,
    };
  }

  // --- Hover Handlers ---
  handleLeftHover = () => {
    // Change cursor to pointer for better UX
    document.body.style.cursor = "pointer";
    this.setState({ leftBoxStroke: HIGHLIGHT_COLOR });
  };

  handleLeftLeave = () => {
    // Reset cursor
    document.body.style.cursor = "default";
    this.setState({ leftBoxStroke: DEFAULT_COLOR });
  };

  handleRightHover = () => {
    // Change cursor to pointer for better UX
    document.body.style.cursor = "pointer";
    this.setState({ rightBoxStroke: HIGHLIGHT_COLOR });
  };

  handleRightLeave = () => {
    // Reset cursor
    document.body.style.cursor = "default";
    this.setState({ rightBoxStroke: DEFAULT_COLOR });
  };

  // --- NEW: Click Handler Method ---
  handleRectClick = (boxKey) => {
    // 3. Call the prop function passed down from the parent component
    if (this.props.onBoxClick) {
      // Pass 'left' or 'right' back to the parent to identify the choice
      this.props.onBoxClick(boxKey);
    }
  };

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
              stroke={this.state.leftBoxStroke} // Use state for color
              // Add Konva event handlers
              onMouseEnter={this.handleLeftHover}
              onMouseLeave={this.handleLeftLeave}
              onClick={() => this.handleRectClick(1)}
            />
            <Rect
              x={this.state.rightBoxStartX}
              y={this.state.rightBoxStartY}
              width={this.state.squareWidth}
              height={this.state.squareWidth}
              fill="black"
              strokeWidth={2.5} // border widthstroke={this.state.leftBoxStroke} // Use state for color
              // Add Konva event handlers
              stroke={this.state.rightBoxStroke}
              onMouseEnter={this.handleRightHover}
              onMouseLeave={this.handleRightLeave}
              onClick={() => this.handleRectClick(2)}
            />
            <Text
              fill="white"
              x={this.state.leftBoxStartX}
              y={this.state.leftBoxStartY - 50}
              text="Click for left choice."
              fontSize={16}
              fontFamily="Lucida Console"
            />
            <Text
              fill="white"
              x={this.state.rightBoxStartX}
              y={this.state.rightBoxStartY - 50}
              text="Click for right choice."
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
