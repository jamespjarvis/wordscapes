const router = require("express").Router();

const Game = require("../../lib/game");

router.get("/:numWords?", async (req, res, next) => {
  try {
    const numWords = parseInt(req.params.numWords || 5);
    const game = new Game(numWords);
    game.initialize();
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
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
