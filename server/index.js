const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const server = require("http").Server(app);

const io = require("./lib/socket")(server);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../app/dist")));

const Game = require("./lib/game");

app.get("/api", async (req, res, next) => {
  try {
    const game = new Game(8);
    game.initialize();
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

app.post("/api", async (req, res, next) => {
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

server.listen(8001, () => {
  console.log(`Listening on port 8001`);
});
