'use strict';

const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const winningCombinations = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 5, 9],
  [3, 5, 7], [1, 4, 7], [2, 5, 8], [3, 6, 9]];

const stateObj = {
  computerHistory: [],
  userHistory: [],
};

function onUserPlay(eventData) {
  stateObj.userHistory.push(eventData);
  if (winningCombinations.indexOf(stateObj.userHistory) !== -1) {
    console.log("You've won!");
  }
}

function computerPlay() {
  // 1. if first go, random pick from remaining values in options arr

  // 2. if computer is just 1 square away, and that square is available, pick that

  // 3. need to block user if they're 1 square away from winning

  // 4. if computer can move to being just 1 away from a winning combination still in play,
  // pick that option. If there's more than possibility, random pick (or move which block user?)

  // 5. else random pick from remaining values in options arr (or move which blocks user?)


  options.forEach((val) => {
    stateObj.computerHistory.push(val);
  });

  if (winningCombinations.indexOf(stateObj.computerHistory) !== -1) {
    console.log('The computer has won!');
  }
}
