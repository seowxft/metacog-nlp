////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to shuffle one array
export function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to shuffle two arrays in the same config

export function shuffleSame() {
  var arrLength = 0;
  var argsLength = arguments.length;
  var rnd, tmp, argsIndex;

  //shuffling 2 or more arrays in the same order
  var isArray =
    Array.isArray ||
    function (value) {
      return {}.toString.call(value) !== "[object Array]";
    };

  for (var index = 0; index < argsLength; index += 1) {
    if (!isArray(arguments[index])) {
      throw new TypeError("Argument is not an array.");
    }

    if (index === 0) {
      arrLength = arguments[0].length;
    }

    if (arrLength !== arguments[index].length) {
      throw new RangeError("Array lengths do not match.");
    }
  }

  while (arrLength) {
    rnd = Math.round(Math.random() * arrLength);
    arrLength -= 1;
    for (argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
      tmp = arguments[argsIndex][arrLength];
      arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
      arguments[argsIndex][rnd] = tmp;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to generate dot positions given the x and y of the box

export function genDotPos(
  sqxstartpoint,
  sqystartpoint,
  squareWidth,
  dotRadius
) {
  var dotXArray = [];
  var dotYArray = [];
  for (
    var x = sqxstartpoint + dotRadius;
    x < sqxstartpoint + squareWidth;
    x += dotRadius
  ) {
    for (
      var y = sqystartpoint + dotRadius;
      y < sqystartpoint + squareWidth;
      y += dotRadius
    ) {
      dotXArray.push(x);
      dotYArray.push(y);
    }
  }
  return [dotXArray, dotYArray];
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to generate the x and y coor for all of the dots

export function genDots(dotPosX, dotPosY) {
  if (dotPosX.length === dotPosY.length) {
    return [...Array(dotPosX.length)].map((_, i) => ({
      id: i.toString(),
      x: dotPosX[i],
      y: dotPosY[i],
      isDragging: false,
    }));
  } else {
    const e = new Error("Dot coordinates not same length!");
    throw e;
  }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to generate random interger

export function randomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// function to get average of vector

export function getAvg(vec) {
  const total = vec.reduce((acc, c) => acc + c, 0);
  return total / vec.length;
}
