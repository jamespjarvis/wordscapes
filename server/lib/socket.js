const Game = require("./game");
const fs = require("fs");
const path = require("path");

const gamesPath = path.resolve(__dirname, "../db/games.json");

const currentGames = new Map();

const createGame = () => {
  const game = new Game();
  game.initialize();
  currentGames.set(game.id, { game, players: [], forbidden: [] });
  return game;
};

const saveGameState = () => {
  const games = {};
  currentGames.forEach((targetGame, gameId) => {
    if (targetGame.game.guessed.length) {
      games[gameId] = targetGame;
    }
  });
  fs.writeFileSync(gamesPath, JSON.stringify(games));
};

const readGameState = () => {
  const games = JSON.parse(fs.readFileSync(gamesPath, "utf8"));
  Object.keys(games).forEach(gameId => {
    const game = new Game();
    game.loadSavedGame(games[gameId].game);
    currentGames.set(gameId, { ...games[gameId], game });
  });
};

readGameState();

const removeSocketFromCurrentGames = (io, socket) => {
  currentGames.forEach((targetGame, gameId, map) => {
    if (targetGame.players.includes(socket.id)) {
      const updatedPlayers = targetGame.players.filter(p => p !== socket.id);
      map.set(gameId, { ...targetGame, players: updatedPlayers });
      if (updatedPlayers.length) {
        io.to(`${gameId}`).emit("PLAYER_JOIN", {
          numPlayers: updatedPlayers.length
        });
      } else {
        saveGameState();
      }
    }
  });
};

module.exports = function(server) {
  const io = require("socket.io")(server);

  io.on("connection", socket => {
    // MULTIPLAYER
    socket.on("CREATE_GAME", () => {
      console.log("CREATE_GAME");
      const game = createGame();
      socket.emit("GAME_CREATED", { gameId: game.id });
    });

    socket.on("JOIN_GAME", ({ gameId }) => {
      console.log("JOIN_GAME");

      if (currentGames.has(gameId)) {
        console.log(`JOINING_GAME ${gameId}`);
        const targetGame = currentGames.get(gameId);
        Object.keys(socket.rooms).forEach(room =>
          socket.leave(socket.rooms[room])
        );
        if (targetGame.forbidden.includes(socket.id)) {
          socket.emit("FORBIDDEN");
        } else {
          socket.join(gameId, () => {
            if (!targetGame.players.includes(socket.id))
              targetGame.players.push(socket.id);
            socket.emit("UPDATE", targetGame);
            socket.emit("GAME_JOINED");
            io.to(`${gameId}`).emit("PLAYER_JOIN", {
              numPlayers: targetGame.players.length
            });
          });
        }
      } else {
        createGame(gameId);
        socket.emit("GAME_CREATED", { gameId });
      }
    });

    socket.on("disconnect", () => {
      removeSocketFromCurrentGames(io, socket);
    });

    socket.on("LEVEL_COMPLETE", ({ gameId }) => {
      // console.log("LEVEL_COMPLETE");
      if (currentGames.has(gameId)) {
        const targetGame = currentGames.get(gameId);
        if (targetGame.game.levelComplete) {
          targetGame.game.level++;
          targetGame.game.initialize();
          currentGames.set(gameId, targetGame);
        }
        socket.emit("UPDATE", targetGame);
      } else {
        throw new Error("COULD NOT FIND TARGET GAME");
      }
    });

    // GAME INIT
    socket.on("NEW_GAME", () => {
      // console.log("NEW_GAME");
      const game = createGame();
      socket.emit("GAME", { game });
      addActiveGame(game, socket);
    });

    socket.on("LOAD_GAME", data => {
      // console.log("LOAD_GAME");
      const game = new Game();
      game.loadSavedGame(data.game);
      currentGames.set(game.id, { game, players: [], forbidden: [] });
      socket.emit("GAME_LOADED", { gameId: game.id });
    });

    // GAMEPLAY
    socket.on("CHECK_PRESSED", data => {
      // console.log("CHECK_PRESSED");
      const targetGame = currentGames.get(data.game.id);
      if (targetGame) {
        // console.log("CHECK_PRESSED_MULTIPLAYER");
        const match = targetGame.game.checkWordsForMatch(data.pressed);
        if (match) {
          saveGameState();
          io.to(`${targetGame.game.id}`).emit("UPDATE", targetGame);
          socket.emit("CLEAR_PRESSED");
        }
      } else {
        // console.log("CHECK_PRESSED_SOLO");
        const game = new Game();
        game.loadGameState(data.game);
        const match = game.checkWordsForMatch(data.pressed);
        if (match) {
          socket.emit("UPDATE", { game });
        }
      }
    });

    socket.on("FORFEIT_GAME", data => {
      // console.log("FORFEIT_GAME");
      const game = new Game();
      game.loadGameState(data.game);
      game.revealBoard();
      removeSocketFromCurrentGames(io, socket);
      socket.emit("UPDATE", { game });
      const targetGame = currentGames.get(game.id);
      targetGame.forbidden.push(socket.id);
      currentGames.set(game.id, targetGame);
    });

    // CHEATS
    socket.on("SHOW_RANDOM_WORD", data => {
      // console.log("SHOW_RANDOM_WORD");
      const game = new Game();
      game.loadGameState(data.game);
      game.showRandomWord();
      socket.emit("UPDATE", { game });
    });

    socket.on("SHOW_RANDOM_CELL", data => {
      // console.log("SHOW_RANDOM_CELL");
      const game = new Game();
      game.loadGameState(data.game);
      game.showRandomCell();
      socket.emit("UPDATE", { game });
    });
  });
  return io;
};
