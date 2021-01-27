"use strict";

import "core-js/features/array/from";
import "./style.css";

const game = (function setupGame() {
  const state = {
    options: [],
    identifers: { computer: "", user: "" },
    moves: { computer: [], user: [] },
  };

  const winningCombos = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 5, 9],
    [3, 5, 7],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ];

  const $sqrs = Array.from(document.querySelectorAll(".sqr"));
  const $msg = document.querySelector(".msg");

  const checkforWinner = (player, playerArr) => {
    let winningCombo = false;
    let i = 1;

    if (playerArr.length < 3) return false;

    do {
      if (
        // refactor using array.includes
        playerArr.indexOf(winningCombos[i - 1][0]) !== -1 &&
        playerArr.indexOf(winningCombos[i - 1][1]) !== -1 &&
        playerArr.indexOf(winningCombos[i - 1][2]) !== -1
      ) {
        winningCombo = true;
      } else i += 1;
    } while (!winningCombo && i <= winningCombos.length);

    if (winningCombo) {
      if (player === "computer") $msg.innerText = "The computer has won!";
      else $msg.innerText = "Congratulations, you've won!";
      $sqrs.forEach((val) => {
        const sqr = val;
        sqr.removeEventListener("click", userPlay);
        sqr.classList.remove("clickable");
      });
    }

    return winningCombo;
  };

  const computerPlay = () => {
    let computerSelection;

    // check if a winning move is available
    const pickWinningCombo = (playerHist) => {
      let nxtMv = null;
      let i = 1;

      do {
        let counter = 0;
        winningCombos[i - 1].forEach((val) => {
          if (playerHist.indexOf(val) !== -1) counter += 1;
        });
        if (counter === 2) {
          const availableMvs = winningCombos[i - 1].filter(
            (val) => state.options.indexOf(val) !== -1
          );
          if (availableMvs.length === 1) [nxtMv] = availableMvs;
        }
        i += 1;
      } while (nxtMv === null && i <= winningCombos.length);

      return nxtMv;
    };

    // if no priority moves are available, check if a move is availble  
    // which gives the player more than one way to win on the next turn
    const pickFork = (playerHist) => {
      let nxtMv = null;
      let i = 1;
      let availableMvs = [];
      const choices = [];

      // pick the move which leaves the most winning combinations open
      const pickBestOption = (options) => {
        const countArr = [];

        options.forEach((val) => {
          let counter = 0;
          options.forEach((_value, index) => {
            if (val === options[index]) counter += 1;
          });
          countArr.push([val, counter]);
        });

        const forks = countArr.filter((val) => val[1] > 1);

        if (forks.length >= 1) return forks[0][0];

        return null;
      };

      if (playerHist.length > 0) {
        // identify winning combos which aren't blocked & where player has a foothold
        do {
          let counter = 0;
          winningCombos[i - 1].forEach((val) => {
            if (playerHist.indexOf(val) !== -1) counter += 1;
          });
          if (counter === 1) {
            availableMvs = winningCombos[i - 1].filter(
              (val) => state.options.indexOf(val) !== -1
            );
            if (availableMvs.length === 2) {
              choices.push(...availableMvs);
            }
          }
          i += 1;
        } while (i <= winningCombos.length);

        if (choices.length >= 1) {
          nxtMv = pickBestOption(choices);
        }
      } 

      return nxtMv;
    };

    const pickOppositeCorner = () => {
      let nxtMv = null;
      const corners = [[1, 9], [3, 7]];
      const options = [];

      corners.forEach(val => {
        if (state.options.includes(val[0]) && state.moves.user.includes(val[1])) {
          options.push(val[0]);
        } else if (state.options.includes(val[1]) && state.moves.user.includes(val[0])) {
          options.push(val[1]);
        }
      });

      if (options.length > 0) {
        nxtMv = options.length === 1 ? options[0] : options[Math.round(Math.random())];
      }

      return nxtMv;
    }

    if (state.moves.computer.length === 0 && state.moves.user.length === 0) {
      // 1. at the start of the game, 5 leaves the most winning combos open - ???maybe remove this???
      computerSelection = 5;
    } else if (pickWinningCombo(state.moves.computer) !== null) {
      // 2. if computer is just 1 square away, and that square is available, pick that
      computerSelection = pickWinningCombo(state.moves.computer);
      // 3. need to block user if they're 1 square away from winning
    } else if (pickWinningCombo(state.moves.user) !== null) {
      computerSelection = pickWinningCombo(state.moves.user);
      // 4. pick the option which leaves the computer with more than 1 way of winning on the next move
    } else if (pickFork(state.moves.computer) !== null) {
      computerSelection = pickFork(state.moves.computer);
      // 5. block any opportunity for the user to create more than 1 way of winning
    } else if (pickFork(state.moves.user) !== null) {
      computerSelection = pickFork(state.moves.user);
      // 6. pick the centre
    } else if (state.options.includes(5)) {
      computerSelection = 5;
    } else if (pickOppositeCorner() !== null) {
      computerSelection = pickOppositeCorner();
    }  
    // ----------------------

    // TODO: handle else case
    
    // ----------------------
    
    // 7. update board
    document.querySelector(`[id='${computerSelection}']`).innerText =
      state.identifers.computer;
    // 8. update computerPlays array
    state.moves.computer.push(computerSelection);
    // 9. Check if computer has won
    if (checkforWinner("computer", state.moves.computer)) return;
    // 10. remove selection from options array
    const ind = state.options.indexOf(computerSelection);
    state.options.splice(ind, 1);
    // 11. check if the game's over
    if (state.options.length === 0) $msg.innerText = "Match drawn";
    else $msg.innerText = "Your turn";
  };

  const userPlay = (event) => {
    const $targetDiv = event.target;

    // 1. update board
    if ($targetDiv.innerText === "")
      $targetDiv.innerText = state.identifers.user;
    else return;

    const numericVal = parseInt($targetDiv.id, 10);
    // 2. update userPlays array
    state.moves.user.push(numericVal);
    // 3. check if user has won
    if (checkforWinner("user", state.moves.user)) return;
    // 4. remove selection from options array
    const ind = state.options.indexOf(numericVal);
    state.options.splice(ind, 1);
    // 5. check if the game is drawn. If not, make the computer play.
    if (state.options.length === 0) $msg.innerText = "Match drawn";
    else {
      $msg.innerText = "";
      computerPlay();
    }
  };

  const startGame = () => {
    const resetGame = () => {
      $msg.innerText = "";

      $sqrs.forEach((sqr) => {
        const $sqr = sqr;
        $sqr.innerText = "";
        $sqr.classList.add("clickable");
        $sqr.addEventListener("click", userPlay);
      });

      state.options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      state.moves.computer = [];
      state.moves.user = [];
    };

    const selectIdentifier = () => {
      state.identifers.user = document.querySelector(
        "#select-identifier"
      ).value;
      state.identifers.computer = state.identifers.user === "O" ? "X" : "O";
    };

    const determineStarter = () => {
      const randomNum = Math.round(Math.random());

      if (randomNum === 1) computerPlay();
      else $msg.innerText = "Your turn";
    };

    resetGame();

    selectIdentifier();

    determineStarter();
  };

  return {
    startGame,
  };
})();

document.querySelector(".play-btn").addEventListener("click", game.startGame);
