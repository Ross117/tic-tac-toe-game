'use strict';

const game = (function setupGame() {
  // update in response to user & computer actions
  const stateObj = {
    // remove options when played
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    // noughts or crosses, use the properties to update the board
    identifers: { user: '', computer: '' },
    computerPlays: [],
    userPlays: [],
  };

  const winningCombos = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 5, 9],
    [3, 5, 7], [1, 4, 7], [2, 5, 8], [3, 6, 9]];

  // board HTMl element
  const $board = document.querySelector('.board');

  // fires when user clicks 'play' button
  const selectIdentifier = () => {

  };

  const checkforWinner = (player, playerArr) => {
    let winningCombo = false;
    let i = 1;

    do {
      if (playerArr.indexOf(winningCombos[i - 1][0]) !== -1 &&
        playerArr.indexOf(winningCombos[i - 1][1]) !== -1 &&
        playerArr.indexOf(winningCombos[i - 1][2]) !== -1) {
        winningCombo = true;
      } else i += 1;
    } while (!winningCombo && i <= winningCombos.length);

    if (winningCombo) console.log(`${player} has won!`);

    return winningCombo;
  };

  // need to alternate turns between user & computer

  const computerPlay = () => {
    const optionsLnth = stateObj.options.length;
    let computerSelection;
    let computerHasWon;

    const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

    // 1. if first go, random pick from remaining values in options arr
    if (stateObj.computerPlays.length === 0) {
      // select random int from option array index range
      computerSelection = stateObj.options[getRandomInt(optionsLnth)];
    }

    // 2. if computer is just 1 square away, and that square is available, pick that
    // 3. need to block user if they're 1 square away from winning
    // 4. if computer can move to being just 1 away from a winning combination still in play,
    // pick that option. If there's more than 1 possibility,
    // random pick (or move which blocks user?)
    // 5. else random pick from remaining values in options arr (or move which blocks user?)
    computerSelection = stateObj.options[getRandomInt(optionsLnth)];
    // 6. update computerPlays array
    stateObj.computerPlays.push(computerSelection);
    // 7. update board
    // 8. Check if computer has won
    if (stateObj.computerPlays.length >= 3) {
      computerHasWon = checkforWinner('Computer', stateObj.computerPlays);
    }
    if (computerHasWon) return;
    // 9. remove selection from options array
    const ind = stateObj.options.indexOf(computerSelection);
    stateObj.options.splice(ind, 1);
  // 10. If computer has not won, switch to user
  };

  // make sure user can only select one of the remaining options
  // handle this in HTML I think, disable taken squares
  const userPlay = (userSelection) => {
    let playerHasWon;
    // 1. update userPlays array
    stateObj.userPlays.push(userSelection);
    // 2. update board
    // 3. check if user has won
    if (stateObj.userPlays.length >= 3) {
      playerHasWon = checkforWinner('user', stateObj.userPlays);
    }
    // 4. exit if user has won
    if (playerHasWon) return;
    // 5. remove selection from options array
    const ind = stateObj.options.indexOf(userSelection);
    stateObj.options.splice(ind, 1);
    // 6. make computer play
    computerPlay();
  };

  return {
    selectIdentifier,
    userPlay,
  };
}());

// attach event listeners
