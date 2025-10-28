// two down one up staircase to reach about 70%

// Note that we only call check_reversal when there was a step up or step down
function checkReversal(dir) {
  if (dir[0] !== dir[1])
    // If the direction two trials ago is NOT the same direction as the last trial, then there was a reversal
    return true;
  // If the direction two trials ago and the last trial are the same direction, no reversal
  else return false;
}

export function staircase(stimNum, prevTrialPerf, dir, trialNum) {
  var back1 = prevTrialPerf[prevTrialPerf.length - 1]; // Last trial
  var back2 = prevTrialPerf[prevTrialPerf.length - 2]; // Two trials ago
  var reverse = false; // Initialize reversal to false

  if (back1) {
    // If the last trial was correct
    if (back2) {
      // AND two trials ago were correct

      //plus one stimuli
      stimNum += 1;

      // changes the last trial to incorrect
      // so if previous two trials were correct and the staircase increased difficulty
      // it needs two more trials again before it lowers again in value
      prevTrialPerf[prevTrialPerf.length - 1] = false;

      dir[0] = dir[1]; // Set the direction two trials ago to the direction one trial ago
      dir[1] = "up"; // Set the direction one trial ago to up
      reverse = checkReversal(dir); // Check if there was a reversal in direction as a result of the step down
    }
    // If the last trial was correct and two trials ago were wrong, do nothing.
  } // If the last trial was wrong
  else {
    //minus one stimuli
    stimNum -= 1;

    dir[0] = dir[1]; // Set the direction two trials ago to the direction one trial ago
    dir[1] = "down"; // Set the direction one trial ago to down
    reverse = checkReversal(dir); // Check if there was a reversal in direction as a result of the step up
  }

  // Set limits on stimNum, minimum 2 pictures
  if (stimNum <= 2) stimNum = 2;

  // Set limits on stimNum, maximum 14 pictures? (i will need 15 stim, always have to minus one for the 2AFC)
  if (stimNum >= 14) stimNum = 14;

  var output = {
    stimNum: stimNum,
    direction: dir,
    reversal: reverse,
    stepcount: prevTrialPerf,
  };

  return output;
}
