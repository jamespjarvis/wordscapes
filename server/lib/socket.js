const Game = require("./game");

const activeGames = new Map();
const addActiveGame = (socket, game) => {
  activeGames.set(socket.id, game);
};

module.exports = function(server) {
  const io = require("socket.io")(server);

  io.on("connection", socket => {
    const game = new Game();

    // GAME INIT
    socket.on("NEW_GAME", () => {
      game.initialize();
      socket.emit("GAME", { game });
      addActiveGame(game, socket);
    });

    socket.on("LOAD_GAME", data => {
      game.loadSavedGame(data.game);
      socket.emit("GAME", { game });
      addActiveGame(game, socket);
    });

    // GAMEPLAY
    socket.on("CHECK_PRESSED", data => {
      game.loadGameState(data.game);
      game.checkWordsForMatch(data.pressed);
      socket.emit("UPDATE", { game });
    });

    socket.on("FORFEIT_GAME", data => {
      game.loadGameState(data.game);
      game.revealBoard();
      socket.emit("UPDATE", { game });
    });

    // CHEATS
    socket.on("SHOW_RANDOM_WORD", data => {
      game.loadGameState(data.game);
      game.showRandomWord();
      socket.emit("UPDATE", { game });
    });

    socket.on("SHOW_RANDOM_CELL", data => {
      game.loadGameState(data.game);
      game.showRandomCell();
      socket.emit("UPDATE", { game });
    });
  });
  return io;
};
