class Word {
  constructor(str) {
    this.str = str;
    this.chars = str.split("");
    this.charScore = 0;
    this.startX = 0;
    this.startY = 0;
  }
}

module.exports = Word;
