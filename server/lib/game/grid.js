const { initialize2DArray } = require("./utils");
const { Cell, Node } = require("./cell");

class Grid {
  constructor(rows, cols) {
    this.grid = initialize2DArray(rows, cols);
    this.charIndex = {};
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
        r < this.grid.length && c < col + word.length;
        c++, i++
      ) {
        const isEmpty = this.grid[r][c] === null;
        const isIntersection =
          this.grid[row][c] !== null &&
          this.grid[row][c].letter === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }
      let intersections = 0;
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), row, c);
        if (result === false) return false;
        intersections += result;
      }
      return intersections;
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
          this.grid[r][col].letter === word.charAt(i);
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
          this.grid[r][col].letter === word.charAt(i);
        const canPlace = isEmpty || isIntersection;
        if (!canPlace) return false;
      }
      let intersections = 0;
      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), r, col);
        if (result === false) return false;
        intersections += result;
      }
      return intersections;
    }
  }
  canPlaceCharAt(char, row, col) {
    if (this.grid[row][col] === null) return 0;
    if (this.grid[row][col].letter === char) return 1;
    return false;
  }
  createCell(word, wordIndex, charIndex, row, col, direction) {
    const char = word.charAt(charIndex);
    if (this.grid[row][col] === null) {
      this.grid[row][col] = new Cell(char, row, col);

      if (!this.charIndex[char]) this.charIndex[char] = [];

      this.charIndex[char].push({ row, col });
    }
    this.grid[row][col][direction] = new Node(charIndex === 0, wordIndex);
    this.grid[row][col].words.push(word);
    return this.grid;
  }
  placeWordAt(word, index, row, col, direction) {
    if (direction === 0) {
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        this.createCell(word, index, i, row, c, direction);
      }
    } else {
      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        this.createCell(word, index, i, r, col, direction);
      }
    }
    return this.grid;
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
          // rMin = Math.min(rMin, r);
          // rMax = Math.max(rMax, r);
          // cMin = Math.min(cMin, c);
          // cMax = Math.max(cMax, c);
          if (r < rMin) rMin = r;
          if (r > rMax) rMax = r;
          if (c < cMin) cMin = c;
          if (c > cMax) cMax = c;
        }
      }
    }
    const rows = rMax - rMin + 1;
    const cols = cMax - cMin + 1;

    // const newGrid = new Array(rows);
    // for (let r = 0; r < rows; r++) {
    // 	for (let c = 0; c < cols; c++) {
    // 		newGrid[r] = new Array(cols);
    // 	}
    // }

    const newGrid = initialize2DArray(cols, rows);

    for (let r = rMin, r2 = 0; r2 < rows; r++, r2++) {
      for (let c = cMin, c2 = 0; c2 < cols; c++, c2++) {
        newGrid[r2][c2] = this.grid[r][c];
      }
    }
    return newGrid;
  }
  clear() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        this.grid[r][c] = null;
      }
    }
    this.charIndex = {};
    return this.grid;
  }
}

module.exports = Grid;
