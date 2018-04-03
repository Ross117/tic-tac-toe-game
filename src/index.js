'use strict';

const game = (function setupGame() {

  const state = {
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    identifers: { computer: '', user: '' },
    moves: { computer: [], user: [] },
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

    if (playerArr.length < 3) return false;

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

  const computerPlay = () => {
    let computerSelection;

    // get a randon integer lower than a specified maximum
    const getRandomInt = max => Math.floor(Math.random() * max);

    // check if a winning move is available
    const checkForPriorityMv = (playerHist) => {
      let nxtMv = null;
      let i = 1;

      do {
        let counter = 0;
        winningCombos[i - 1].forEach((val) => {
          if (playerHist.indexOf(val) !== -1) counter += 1;
        });
        if (counter === 2) {
          const availableMvs = winningCombos[i - 1]
            .filter(val => state.options.indexOf(val) !== -1);
          if (availableMvs.length === 1) [nxtMv] = availableMvs;
        }
        i += 1;
      } while (nxtMv === null && i <= winningCombos.length);

      return nxtMv;
    };

    // if no priority moves are available, pick the best available move
    const pickRegularMv = (playerHist) => {
      let nxtMv = null;
      let i = 1;
      const choices = [];

      // pick the move which leaves the most winning combinations open
      const pickBestOption = (options) => {
        const countArr = [];

        options.forEach((val) => {
          let counter = 0;
          options.forEach((value, index) => {
            if (val === options[index]) counter += 1;
          });
          countArr.push([val, counter]);
        });

        countArr.sort((a, b) => b[1] - a[1]);

        return countArr[0][0];
      };

      do {
        let counter = 0;
        winningCombos[i - 1].forEach((val) => {
          if (playerHist.indexOf(val) !== -1) counter += 1;
        });
        if (counter === 1) {
          const availableMvs = winningCombos[i - 1]
            .filter(val => state.options.indexOf(val) !== -1);
          if (availableMvs.length === 2) {
            choices.push(...availableMvs);
          }
        }
        i += 1;
      } while (i <= winningCombos.length);

      if (choices.length >= 1) {
        nxtMv = pickBestOption(choices);
      }

      return nxtMv;
    };


    if (state.moves.computer.length === 0 && state.moves.computer.length === 0) {
      // 1. at the start of the game, 5 leaves the most winning combos open
      computerSelection = 5;
    } else if (state.moves.computer.length === 0) {
      // 2. focus on blocking the user already?
      computerSelection = pickRegularMv(state.moves.users);
    // 3. if computer is just 1 square away, and that square is available, pick that
    } else if (checkForPriorityMv(state.moves.computer) !== null) {
      computerSelection = checkForPriorityMv(state.moves.computer);
    // 4. need to block user if they're 1 square away from winning
    } else if (checkForPriorityMv(state.moves.users) !== null) {
      computerSelection = checkForPriorityMv(state.moves.users);
    // 5. if there are no priority moves, pick the best option which moves
    // the computer closer to winning
    } else if (pickRegularMv(state.moves.computer) !== null) {
      computerSelection = pickRegularMv(state.moves.computer);
    // 6. Otherwise, block the best option for the user
    } else if (pickRegularMv(state.moves.users) !== null) {
      computerSelection = pickRegularMv(state.moves.users);
    // 7. else choose a random option
    } else computerSelection = state.options[getRandomInt(state.options.length)];

    // 8. update computerPlays array
    state.moves.computer.push(computerSelection);
    // 9. update board
    // 10. Check if computer has won
    if (checkforWinner('computer', state.moves.computer)) return;
    // 11. remove selection from options array
    const ind = state.options.indexOf(computerSelection);
    state.options.splice(ind, 1);
  // 12. If computer has not won, switch to user
  };

  // make sure user can only select one of the remaining options
  // handle this in HTML I think, disable taken squares
  const userPlay = (userSelection) => {
    // 1. update userPlays array
    state.moves.users.push(userSelection);
    // 2. update board
    // 3. check if user has won
    if (checkforWinner('user', state.moves.users)) return;
    // 4. remove selection from options array
    const ind = state.options.indexOf(userSelection);
    state.options.splice(ind, 1);
    // 5. make computer play
    computerPlay();
  };

  return {
    selectIdentifier,
    userPlay,
  };
}());

// attach event listeners
