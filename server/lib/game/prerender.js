const Grid = require("./grid");

const Prerender = {
  generateGrid(words, GRID_SIZE = 50, tries = 1) {
    const grid = new Grid(GRID_SIZE, GRID_SIZE);
    for (let i = 0; i < tries; i++) {
      grid.clear();
      let groups = [];
      let notPlaced = [];

      const randomDirection = Math.round(Math.random());

      let r = Math.floor(grid.grid.length / 2);
      let c = Math.floor(grid.grid[0].length / 2);

      const wordItem = words[0];
      if (randomDirection === 0) {
        c -= Math.floor(wordItem.word.length / 2);
      } else {
        r -= Math.floor(wordItem.word.length / 2);
      }

      if (grid.canPlaceWordAt(wordItem.word, r, c, randomDirection) !== false) {
        grid.placeWordAt(wordItem.word, wordItem.index, r, c, randomDirection);
      } else {
        notPlaced.push(wordItem);
        return null;
      }

      groups.push(words.slice(1));
      let addedWord = false;
      for (let g = 0; g < groups.length; g++) {
        addedWord = false;
        for (let j = 0; j < groups[g].length; j++) {
          const wordItem = groups[g][j];
          const bp = grid.findPositionForWord(wordItem.word);
          if (!bp || bp.intersections === 0) {
            if (groups.length - 1 === g) {
              groups.push([]);
            }
            groups[g + 1].push(wordItem);
          } else {
            const { row, col, direction } = bp;
            grid.placeWordAt(
              wordItem.word,
              wordItem.index,
              row,
              col,
              direction
            );
            addedWord = true;
          }
        }
        if (!addedWord) break;
      }

      if (addedWord) {
        grid.grid = grid.minimizeGridDimensions();
        return grid.grid;
      }
    }

    return null;
  },
  getOptimizedGrid(wordList, tries = 1) {
    let best = null;
    let bestRatio = 0;
    let gridSize = 25;
    const words = wordList
      .sort((a, b) => b.length - a.length)
      .map((w, i) => ({ word: w, index: i }));

    for (let i = 0; i < tries; i++) {
      const grid = this.generateGrid(words, gridSize, 1);
      if (grid === null) {
        continue;
      }

      const ratio =
        (Math.min(grid.length, grid[0].length) * 1.0) /
        Math.max(grid.length, grid[0].length);

      if (ratio >= bestRatio) {
        best = grid;
        bestRatio = ratio;
        if (bestRatio === 1) break;
      }
    }
    return best;
  }
};

module.exports = { Prerender };
