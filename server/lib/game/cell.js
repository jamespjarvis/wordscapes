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
    // this.coords = coords;
    this.x = 0;
    this.y = 0;
    this.radius = 0;
    this.color = "rgba(255, 255, 255, 0.7)";
    this.words = [];
    this.isHidden = true;
  }
  get size() {
    return this.radius * 2;
  }
  draw(ctx) {
    ctx.save();

    if (this.letter) {
      ctx.fillStyle = this.color;

      if (!this.isHidden) {
        ctx.fillStyle = "SEAGREEN";
      }

      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2.5;

      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.font = `${this.radius * 1.5}px "Montserrat"`;

      ctx.fillStyle = "black";

      if (!this.isHidden) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
          this.letter,
          this.x + this.radius,
          this.y + this.radius,
          this.size
        );
      }
    }

    ctx.restore();
  }
}

module.exports = { Node, Cell };
