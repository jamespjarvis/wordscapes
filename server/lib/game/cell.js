class Node {
  constructor(isStartOfWord, index) {
    this.isStartOfWord = isStartOfWord;
    this.index = index;
    this.wordCount = 0;
  }
}
class Cell {
  constructor(letter) {
    this.letter = letter;
    this.x = 0;
    this.y = 0;
    this.words = [];
    this.isHidden = true;
  }
}

module.exports = { Node, Cell };
