"use strict";

import "core-js/features/array/flat";
import "core-js/features/array/from";
import "core-js/features/array/includes";
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

    if (playerArr.length < 3) return winningCombo;

    do {
      if (
        playerArr.includes(winningCombos[i - 1][0]) &&
        playerArr.includes(winningCombos[i - 1][1]) &&
        playerArr.includes(winningCombos[i - 1][2])
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

    // get a randon integer lower than a specified maximum
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    // check if a winning move is available
    const pickWinningCombo = (playerHist, gameOptions) => {
      let nxtMv = null;
      let i = 1;

      do {
        let counter = 0;
        winningCombos[i - 1].forEach((val) => {
          if (playerHist.includes(val)) counter += 1;
        });
        if (counter === 2) {
          const availableMvs = winningCombos[i - 1].filter((val) =>
            gameOptions.includes(val)
          );
          if (availableMvs.length === 1) [nxtMv] = availableMvs;
        }
        i += 1;
      } while (nxtMv === null && i <= winningCombos.length);

      return nxtMv;
    };

    // identify winning combos which aren't blocked & where player has a foothold
    const identifyTwoInARowOptions = (playerHist, gameOptions) => {
      const options = [];
      let i = 1;

      if (playerHist.length === 0) return options;

      do {
        let counter = 0;
        winningCombos[i - 1].forEach((val) => {
          if (playerHist.includes(val)) counter += 1;
        });
        if (counter === 1) {
          let availableMvs = winningCombos[i - 1].filter((val) =>
            gameOptions.includes(val)
          );
          if (availableMvs.length === 2) {
            options.push(...availableMvs);
          }
        }
        i += 1;
      } while (i <= winningCombos.length);

      return options;
    };

    const identifyForks = (playerHist, gameOptions) => {
      const countOfOptions = [];

      const options = identifyTwoInARowOptions(playerHist, gameOptions);

      if (options.length === 0) return [];

      options.forEach((val) => {
        let counter = 0;
        options.forEach((_val, index) => {
          if (val === options[index]) counter += 1;
        });
        countOfOptions.push([val, counter]);
      });

      const forks = [];

      countOfOptions
        .filter((val) => val[1] > 1)
        .flat()
        .filter((_val, ind) => ind % 2 === 0)
        .forEach((val) => {
          if (!forks.includes(val)) {
            forks.push(val);
          }
        });

      return forks;
    };

    // check if a move is availble which gives the player more than one way to win on the next turn
    const pickFork = (playerHist, player) => {
      let nxtMv = null;

      const forks = identifyForks(playerHist, state.options);

      if (forks.length === 0) return nxtMv;

      if (player === "computer" && forks.length >= 1) {
        nxtMv = forks[getRandomInt(forks.length)];
        // this is the computer in blocking mode: if the user has one fork available, block it
      } else if (player === "user" && forks.length === 1) {
        nxtMv = forks[0];
        // if the user has more than one fork available, block all forks in any way which
        // simultaneously allows the computer to create 2 in a row
      } else if (player === "user" && forks.length > 1) {
        const twoInARowOptions = identifyTwoInARowOptions(
          state.moves.user,
          state.options
        );

        const potentialMoves = [];

        forks.forEach((fork) => {
          // in selecting one fork, therefore taking it out as an option, does the computer eliminate the other fork(s)?
          const modGameOptions = state.options.filter((option) => {
            return option !== fork;
          });
          if (
            identifyForks(playerHist, modGameOptions) === null &&
            twoInARowOptions.includes(fork)
          ) {
            potentialMoves.push(fork);
          }
        });

        if (potentialMoves.length > 0) {
          nxtMv = potentialMoves[getRandomInt(potentialMoves.length)];
        }
      }

      return nxtMv;
    };

    const pickTwoInARow = () => {
      let nxtMv = null;
      const options = identifyTwoInARowOptions(
        state.moves.computer,
        state.options
      );

      if (options.length === 0) return nxtMv;

      const potentialMoves = [];

      options.forEach((option) => {
        const modGameOptions = state.options.filter((val) => {
          return val !== option;
        });

        const modComputerMoves = state.moves.computer.map((move) => move);
        modComputerMoves.push(option);

        // if the option was selected, what would the winning move be?
        const winningMove = pickWinningCombo(modComputerMoves, modGameOptions);
        // check that by blocking the winning move, the user can't simultaneously create a fork
        if (
          !identifyForks(state.moves.user, modGameOptions).includes(winningMove)
        ) {
          potentialMoves.push(option);
        }
      });

      if (potentialMoves.length > 0) {
        nxtMv = potentialMoves[getRandomInt(potentialMoves.length)];
      }

      return nxtMv;
    };

    const pickOppositeCorner = () => {
      let nxtMv = null;
      const corners = [
        [1, 9],
        [3, 7],
      ];
      const options = [];

      const checkForOpposites = ([corner1, corner2]) => {
        if (
          state.options.includes(corner1) &&
          state.moves.user.includes(corner2)
        ) {
          options.push(corner1);
        }
      };

      corners.forEach((val) => {
        checkForOpposites([val[0], val[1]]);
        checkForOpposites([val[1], val[0]]);
      });

      if (options.length > 0) {
        nxtMv = options[getRandomInt(options.length)];
      }

      return nxtMv;
    };

    const pickCornerOrSide = (moves) => {
      let nxtMv = null;
      const options = [];

      moves.forEach((move) => {
        if (state.options.includes(move)) {
          options.push(move);
        }
      });

      if (options.length > 0) {
        nxtMv = options[getRandomInt(options.length)];
      }

      return nxtMv;
    };

    // 1. if computer is just 1 square away, and that square is available, pick that
    if (pickWinningCombo(state.moves.computer, state.options) !== null) {
      computerSelection = pickWinningCombo(state.moves.computer, state.options);
      // 2. need to block user if they're 1 square away from winning
    } else if (pickWinningCombo(state.moves.user, state.options) !== null) {
      computerSelection = pickWinningCombo(state.moves.user, state.options);
      // 3. pick the option which leaves the computer with more than 1 way of winning on the next move
    } else if (pickFork(state.moves.computer, "computer") !== null) {
      computerSelection = pickFork(state.moves.computer, "computer");
      // 4. block any opportunity for the user to create more than 1 way of winning
    } else if (pickFork(state.moves.user, "user") !== null) {
      computerSelection = pickFork(state.moves.user, "user");
      // 5. create a 2 in a row, as long as it doesn't let the user create a fork
    } else if (pickTwoInARow() !== null) {
      computerSelection = pickTwoInARow();
      // 6. pick the centre
    } else if (state.options.includes(5)) {
      computerSelection = 5;
      // 7. pick a corner opposite to a corner taken by the user
    } else if (pickOppositeCorner() !== null) {
      computerSelection = pickOppositeCorner();
      // 8. pick any corner
    } else if (pickCornerOrSide([1, 3, 7, 9]) !== null) {
      computerSelection = pickCornerOrSide([1, 3, 7, 9]);
      // 9. pick any side
    } else {
      computerSelection = pickCornerOrSide([2, 4, 6, 8]);
    }

    // update board
    document.querySelector(`[id='${computerSelection}']`).innerText =
      state.identifers.computer;
    // update computerPlays array
    state.moves.computer.push(computerSelection);
    // check if computer has won
    if (checkforWinner("computer", state.moves.computer)) return;
    // remove selection from options array
    const ind = state.options.indexOf(computerSelection);
    state.options.splice(ind, 1);
    // check if the game's over
    if (state.options.length === 0) $msg.innerText = "Match drawn";
    else $msg.innerText = "Your turn";
  };

  const userPlay = (event) => {
    const $targetDiv = event.target;

    // 1. update board
    if ($targetDiv.innerText === "") {
      $targetDiv.innerText = state.identifers.user;
    } else return;

    const numericVal = parseInt($targetDiv.id, 10);
    // 2. update userPlays array
    state.moves.user.push(numericVal);
    // 3. check if user has won
    if (checkforWinner("user", state.moves.user)) return;
    // 4. remove selection from options array
    const ind = state.options.indexOf(numericVal);
    state.options.splice(ind, 1);
    // 5. check if the game is drawn. If not, make the computer play.
    if (state.options.length === 0) {
      $msg.innerText = "Match drawn";
    } else {
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
