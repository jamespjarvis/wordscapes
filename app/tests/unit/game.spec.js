import Game from "@/game/lib";
import { uniqueElements } from "@/game/lib/utils";

describe("GAME", () => {
  const game = new Game();
  game.level = 5;
  game.maxWordLength = 6;
  game.initialize();
  it("should produce a key with six characters", () => {
    expect(game.key).toHaveLength(6);
  });
  it("should find the correct number of words", () => {
    console.log(game.numWords);
    expect(game.words.length).toBe(game.numWords);
  });
  it("should produce a valid game board", () => {
    const placedWords = uniqueElements(
      game.board.occupiedCells.reduce((a, c) => [...a, ...c.words], [])
    );
    const gameWords = game.words;
    expect(placedWords).toEqual(expect.arrayContaining(gameWords));
  });
  it("should produce words up to length 8", () => {
    console.table(
      game.board.grid.map(row => row.map(l => (l ? l.letter : "")))
    );
  });
});
