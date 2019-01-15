const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const Game = require("../../lib/game");

router.get("/catfact", async (req, res, next) => {
  const catFacts = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../db/catFacts.json"))
  );
  const randomFact = catFacts[Math.floor(Math.random() * catFacts.length)];
  return res.json({ fact: randomFact, length: randomFact.length });
});

router.get("/game/:numWords?", async (req, res, next) => {
  try {
    const numWords = parseInt(req.params.numWords || 6);
    const game = new Game(numWords);
    game.initialize();
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

router.post("/game", async (req, res, next) => {
  try {
    const game = new Game();
    game.loadSavedGame(req.body.game);
    if (game.levelComplete) {
      game.initialize();
    }
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
