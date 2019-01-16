const { initialize2DArray, deepFlatten } = require("./utils");
const { Cell, Node } = require("./cell");

class Board {
  constructor() {
    this.cells = [];
    this.grid = [];
    this.cellSize = 0;
  }
  get isEmpty() {
    return !this.cells.some(c => c.letter !== null);
  }
  get size() {
    return Math.max(this.width, this.height);
  }
  get width() {
    return this.grid[0].length;
  }
  get height() {
    return this.grid.length;
  }
  get occupiedCells() {
    return this.cells.filter(c => c !== null);
  }
  loadSavedBoard({ grid, cellSize, cells }) {
    this.grid = grid;
    this.cellSize = cellSize;
    this.cells = cells;
  }
  isValidPosition(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
  initializeCells(cellSize) {
    this.cellSize = cellSize;
    this.cells = deepFlatten(
      this.grid.map((r, i) => {
        return r.map((c, j) => {
          let cell = c;
          if (cell !== null) {
            cell = new Cell(c.letter);
            cell.words = c.words;
            cell.row = i;
            cell.col = j;
            cell.isHidden = !!c.isHidden;
          }
          return cell;
        });
      })
    );
    return this.cells;
  }
  getRandomCell() {
    return this.cells[Math.floor(Math.random() * this.cells.length + 1)];
  }
  getCell(x, y) {
    return this.cells.find(c => c.coords.x === x && c.coords.y === y);
  }
  drawCells(ctx) {
    const cells = this.grid.reduce((acc, curr) => {
      return [...acc, ...curr.filter(cell => cell !== null)];
    }, []);
    cells.forEach(c => c.draw(ctx));
  }
  findPositionForWord(word) {
    const result = [];
    for (let i = 0; i < word.length; i++) {
      const possibleLocations = this.charIndex[word.charAt(i)];
      if (possibleLocations) {
        for (let j = 0; j < possibleLocations.length; j++) {
          const { row, col } = possibleLocations[j];
          const intsAcross = this.canPlaceWordAt(word, row, col - i, 0);
          const intsDown = this.canPlaceWordAt(word, row - i, col, 1);

          if (intsAcross !== false) {
            result.push({
              intersections: intsAcross,
              row,
              col: col - i,
              direction: 0
            });
          }
          if (intsDown !== false) {
            result.push({
              intersections: intsDown,
              row: row - i,
              col,
              direction: 1
            });
          }
        }
      }
    }
    if (result.length === 0) return false;
    return result[Math.floor(Math.random() * result.length)];
  }
  canPlaceWordAt(word, row, col, direction) {
    if (
      row < 0 ||
      row >= this.grid.length ||
      col < 0 ||
      col >= this.grid[row].length
    ) {
      return false;
    }
    let intersections = 0;
    if (direction === 0) {
      if (col + word.length > this.grid[row].length) return false;
      if (col - 1 >= 0 && this.grid[row][col - 1] !== null) return false;
      if (
        col + word.length < this.grid[row].length &&
        this.grid[row][col + word.length] !== null
      )
        return false;

      for (
        let r = row - 1, c = col, i = 0;
        r >= 0 && c < col + word.length;
        c++, i++
      ) {
        const isEmpty = this.grid[r][c] === null;
        const isIntersection =
          this.grid[row][c] !== null &&
          this.grid[row][c].letter === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }

      for (
        let r = row + 1, c = col, i = 0;
        r >= 0 && c < col + word.length;
        c++, i++
      ) {
        const isEmpty = this.grid[r][c] === null;
        const isIntersection =
          this.grid[row][c] !== null &&
          this.grid[row][c].letter === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), row, c);
        if (result === false) return false;
        intersections += result;
      }
    } else {
      if (row + word.length > this.grid.length) return false;
      if (row - 1 >= 0 && this.grid[row - 1][col] !== null) return false;
      if (
        row + word.length < this.grid.length &&
        this.grid[row + word.length][col] !== null
      )
        return false;

      for (
        let c = col - 1, r = row, i = 0;
        c >= 0 && r < row + word.length;
        r++, i++
      ) {
        const isEmpty = this.grid[r][c] === null;
        const isIntersection =
          this.grid[r][col] !== null &&
          this.grid[r][col].char === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }

      for (
        let c = col + 1, r = row, i = 0;
        c >= 0 && r < row + word.length;
        r++, i++
      ) {
        const isEmpty = this.grid[r][c] === null;
        const isIntersection =
          this.grid[r][col] !== null &&
          this.grid[r][col].char === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }

      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), r, col);
        if (result === false) return false;
        intersections += result;
      }
    }
    return intersections;
  }
  canPlaceCharAt(char, row, col) {
    return this.grid[row][col] !== null &&
      this.grid[row][col] &&
      this.grid[row][col].char === char
      ? 1
      : 0;
  }
  createCell(word, wordIndex, charIndex, row, col, direction) {
    const char = word.charAt(charIndex);
    if (this.grid[row][col] === null) {
      const pos = { row, col };
      this.grid[row][col] = new Cell(char, row, col);
      if (!this.charIndex[char]) this.charIndex[char] = [];
      this.charIndex[char].push(pos);
    }
    this.grid[row][col][direction] = new Node(charIndex === 0, wordIndex);
  }
  placeWordAt(word, index, row, col, direction) {
    if (direction === 0) {
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        this.createCell(word, index, i, row, c, direction);
        // const char = word[i];
        // const pos = { row, col: c };
        // const loc = this.grid[row][c];
        // this.grid[row][c] =
        // 	loc !== null
        // 		? { char, words: [...loc.words, word] }
        // 		: { char, words: [word] };
        // this.charIndex[char] = this.charIndex[char]
        // 	? [...this.charIndex[char], pos]
        // 	: [pos];
      }
    } else {
      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        this.createCell(word, index, i, r, col, direction);

        // const char = word[i];
        // const pos = { row: r, col };
        // const loc = this.grid[r][col];
        // this.grid[r][col] =
        // 	loc !== null
        // 		? { char, words: [...loc.words, word] }
        // 		: { char, words: [word] };
        // this.charIndex[char] = this.charIndex[char]
        // 	? [...this.charIndex[char], pos]
        // 	: [pos];
      }
    }
  }
  minimizeGridDimensions() {
    const ROWS = this.grid.length;
    const COLS = this.grid[0].length;
    let rMin = ROWS - 1;
    let rMax = 0;
    let cMin = COLS - 1;
    let cMax = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] !== null) {
          rMin = Math.min(rMin, r);
          rMax = Math.max(rMax, r);
          cMin = Math.min(cMin, c);
          cMax = Math.max(cMax, c);
        }
      }
    }
    const rows = rMax - rMin + 1;
    const cols = cMax - cMin + 1;
    // const newSize = Math.max(rows, cols);
    const newGrid = initialize2DArray(rows, cols);
    for (let r = rMin, r2 = 0; r2 < rows; r++, r2++) {
      for (let c = cMin, c2 = 0; c2 < cols; c++, c2++) {
        newGrid[r2][c2] = this.grid[r][c];
      }
    }
    this.grid = newGrid;
  }
  clear() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        this.grid[r][c] = null;
      }
    }
    this.charIndex = {};
  }
}

module.exports = Board;
