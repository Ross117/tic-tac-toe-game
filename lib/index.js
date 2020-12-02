"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

'use strict';

var game = function setupGame() {
  var state = {
    options: [],
    identifers: {
      computer: '',
      user: ''
    },
    moves: {
      computer: [],
      user: []
    }
  };
  var winningCombos = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 5, 9], [3, 5, 7], [1, 4, 7], [2, 5, 8], [3, 6, 9]];
  var $sqrs = Array.from(document.querySelectorAll('.sqr'));
  var $msg = document.querySelector('.msg');

  var checkforWinner = function checkforWinner(player, playerArr) {
    var winningCombo = false;
    var i = 1;
    if (playerArr.length < 3) return false;

    do {
      if (playerArr.indexOf(winningCombos[i - 1][0]) !== -1 && playerArr.indexOf(winningCombos[i - 1][1]) !== -1 && playerArr.indexOf(winningCombos[i - 1][2]) !== -1) {
        winningCombo = true;
      } else i += 1;
    } while (!winningCombo && i <= winningCombos.length);

    if (winningCombo) {
      if (player === 'computer') $msg.innerText = 'The computer has won';else $msg.innerText = 'Congratulations, you\'ve won!';
      $sqrs.forEach(function (val) {
        var sqr = val;
        sqr.removeEventListener('click', userPlay);
      });
    }

    return winningCombo;
  };

  var computerPlay = function computerPlay() {
    var computerSelection; // get a randon integer lower than a specified maximum

    var getRandomInt = function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }; // check if a winning move is available


    var checkForPriorityMv = function checkForPriorityMv(playerHist) {
      var nxtMv = null;
      var i = 1;

      do {
        var counter = 0;
        winningCombos[i - 1].forEach(function (val) {
          if (playerHist.indexOf(val) !== -1) counter += 1;
        });

        if (counter === 2) {
          var availableMvs = winningCombos[i - 1].filter(function (val) {
            return state.options.indexOf(val) !== -1;
          });

          if (availableMvs.length === 1) {
            var _availableMvs = _slicedToArray(availableMvs, 1);

            nxtMv = _availableMvs[0];
          }
        }

        i += 1;
      } while (nxtMv === null && i <= winningCombos.length);

      return nxtMv;
    }; // if no priority moves are available, pick the best available move


    var pickRegularMv = function pickRegularMv(playerHist) {
      var nxtMv = null;
      var i = 1;
      var availableMvs = [];
      var choices = []; // pick the move which leaves the most winning combinations open

      var pickBestOption = function pickBestOption(options) {
        var countArr = [];
        options.forEach(function (val) {
          var counter = 0;
          options.forEach(function (value, index) {
            if (val === options[index]) counter += 1;
          });
          countArr.push([val, counter]);
        });
        countArr.sort(function (a, b) {
          return b[1] - a[1];
        });
        return countArr[0][0];
      };

      if (playerHist.length > 0) {
        do {
          var counter = 0;
          winningCombos[i - 1].forEach(function (val) {
            if (playerHist.indexOf(val) !== -1) counter += 1;
          });

          if (counter === 1) {
            availableMvs = winningCombos[i - 1].filter(function (val) {
              return state.options.indexOf(val) !== -1;
            });

            if (availableMvs.length === 2) {
              choices.push.apply(choices, _toConsumableArray(availableMvs));
            }
          }

          i += 1;
        } while (i <= winningCombos.length);

        if (choices.length >= 1) {
          nxtMv = pickBestOption(choices);
        }
      } else {
        winningCombos.forEach(function (arr) {
          availableMvs = arr.filter(function (value) {
            return state.options.indexOf(value) !== -1;
          });

          if (availableMvs.length === 3) {
            choices.push.apply(choices, _toConsumableArray(availableMvs));
          }
        });
        nxtMv = pickBestOption(choices);
      }

      return nxtMv;
    };

    if (state.moves.computer.length === 0 && state.moves.user.length === 0) {
      // 1. at the start of the game, 5 leaves the most winning combos open
      computerSelection = 5;
    } else if (state.moves.computer.length === 0) {
      // 2. computer selects the best move
      computerSelection = pickRegularMv(state.moves.computer); // 3. if computer is just 1 square away, and that square is available, pick that
    } else if (checkForPriorityMv(state.moves.computer) !== null) {
      computerSelection = checkForPriorityMv(state.moves.computer); // 4. need to block user if they're 1 square away from winning
    } else if (checkForPriorityMv(state.moves.user) !== null) {
      computerSelection = checkForPriorityMv(state.moves.user); // 5. if there are no priority moves, pick the best option which moves
      // the computer closer to winning
    } else if (pickRegularMv(state.moves.computer) !== null) {
      computerSelection = pickRegularMv(state.moves.computer); // 6. Otherwise, block the best option for the user
    } else if (pickRegularMv(state.moves.user) !== null) {
      computerSelection = pickRegularMv(state.moves.user); // 7. else choose a random option
    } else computerSelection = state.options[getRandomInt(state.options.length)]; // 8. update board


    document.querySelector("[id='".concat(computerSelection, "']")).innerText = state.identifers.computer; // 9. update computerPlays array

    state.moves.computer.push(computerSelection); // 10. Check if computer has won

    if (checkforWinner('computer', state.moves.computer)) return; // 11. remove selection from options array

    var ind = state.options.indexOf(computerSelection);
    state.options.splice(ind, 1); // 12. check if the game's over

    if (state.options.length === 0) $msg.innerText = 'Match drawn';else $msg.innerText = 'Your turn';
  };

  var userPlay = function userPlay(event) {
    var $targetDiv = event.target; // 1. update board

    if ($targetDiv.innerText === '') $targetDiv.innerText = state.identifers.user;else return;
    var numericVal = parseInt($targetDiv.id, 10); // 2. update userPlays array

    state.moves.user.push(numericVal); // 3. check if user has won

    if (checkforWinner('user', state.moves.user)) return; // 4. remove selection from options array

    var ind = state.options.indexOf(numericVal);
    state.options.splice(ind, 1); // 5. check if the game is drawn. If not, make the computer play.

    if (state.options.length === 0) $msg.innerText = 'Match drawn';else {
      $msg.innerText = '';
      computerPlay();
    }
  };

  var startGame = function startGame() {
    var resetGame = function resetGame() {
      $msg.innerText = '';
      $sqrs.forEach(function (sqr) {
        var $sqr = sqr;
        $sqr.innerText = '';
        $sqr.addEventListener('click', userPlay);
      });
      state.options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      state.moves.computer = [];
      state.moves.user = [];
    };

    var selectIdentifier = function selectIdentifier() {
      state.identifers.user = document.querySelector('.select-identifier').value;
      state.identifers.computer = state.identifers.user === 'O' ? 'X' : 'O';
    };

    var determineStarter = function determineStarter() {
      var randomNum = Math.round(Math.random());
      if (randomNum === 1) computerPlay();else $msg.innerText = 'Your turn';
    };

    resetGame();
    selectIdentifier();
    determineStarter();
  };

  return {
    startGame: startGame
  };
}();

document.querySelector('.play-btn').addEventListener('click', game.startGame);