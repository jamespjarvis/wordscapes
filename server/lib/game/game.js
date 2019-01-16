const Board = require("./board");
const { getWordList } = require("./words");
const { Prerender } = require("./prerender");
const { shuffle, generateId } = require("./utils");

class Game {
  constructor(numWords = 6) {
    this.id = generateId();
    this.key = [];
    this.words = [];
    this.guessed = [];

    this.board = new Board();

    this.level = 1;
    this.score = 0;

    this.initialNumWords = numWords;
    this.numWords = numWords;
    this.maxWordLength = 6;

    this.prices = {
      CELL: 50,
      WORD: 100
    };

    this.levelComplete = false;
  }
  initialize() {
    this.levelComplete = false;

    this.numWords = this.initialNumWords + Math.floor(this.level / 3);

    const { words, key } = getWordList(this.numWords, this.maxWordLength);
    const grid = Prerender.getOptimizedGrid(words, 50);
    if (!grid) return this.initialize();
    this.numWords = words.length;
    this.guessed = [];
    this.words = words;
    this.key = key;
    this.board.grid = grid;
    this.board.cells = this.board.initializeCells();
  }
  checkWordsForMatch(pressed) {
    if (this.words.includes(pressed) && !this.guessed.includes(pressed)) {
      this.guessed.push(pressed);
      this.board.cells
        .reduce((a, c) => {
          return c !== null && c.words.includes(pressed) ? [...a, c] : a;
        }, [])
        .forEach(cell => {
          cell.isHidden = false;
        });
      this.updateScore(pressed);
      this.checkGuessedForWin();
      return true;
    }
    return false;
  }
  updateScore(pressed) {
    const wordScore = pressed.split("").reduce((a, c) => {
      const { value } = this.key.find(k => k.letter === c);
      return a + value;
    }, 0);
    this.score += wordScore;
  }
  checkGuessedForWin() {
    this.levelComplete = this.guessed.length === this.words.length;
    return this.levelComplete;
  }
  revealBoard() {
    this.board.cells.forEach(cell => {
      if (cell !== null) {
        cell.isHidden = false;
      }
    });
  }
  shuffleKey() {
    this.key = shuffle(this.key);
  }
  getGrid(numWords) {
    const { words, key } = getWordList(numWords, this.maxWordLength);
    const grid = Prerender.getOptimizedGrid(words, 100);
    return { words, key, grid };
  }

  loadSavedGame(game) {
    for (let k in game) {
      this[k] = game[k];
    }
    this.board = new Board();
    this.board.loadSavedBoard(game.board);
    this.checkGuessedForWin();
  }
  loadGameState(game) {
    for (let k in game) {
      this[k] = game[k];
    }
    this.board = new Board();
    this.board.loadSavedBoard(game.board);
  }
  checkCompleteWord(cell) {
    const { words } = cell;
    words.forEach(word => {
      const matchingCells = this.board.cells.reduce((a, c) => {
        return c && c.words.includes(word) ? [...a, c] : a;
      }, []);
      if (matchingCells.every(c => !c.isHidden)) {
        this.guessed.push(word);
      }
    });
    this.checkGuessedForWin();
  }
  showRandomCell() {
    if (this.score >= this.prices.CELL) {
      this.score -= this.prices.CELL;
      const hiddenCells = this.board.cells.filter(c => c && c.isHidden);
      const cell = hiddenCells[Math.floor(Math.random() * hiddenCells.length)];
      cell.isHidden = false;
      this.checkCompleteWord(cell);
    }
  }
  showRandomWord() {
    if (this.score >= this.prices.WORD) {
      this.score -= this.prices.WORD;
      const hiddenWords = this.words.filter(
        word => !this.guessed.includes(word)
      );
      const word = hiddenWords[Math.floor(Math.random() * hiddenWords.length)];

      const cells = this.board.cells.filter(
        cell => cell && cell.isHidden && cell.words.includes(word)
      );

      cells.forEach(c => (c.isHidden = false));

      this.guessed.push(word);
      this.checkGuessedForWin();
    }
  }
}

module.exports = Game;
