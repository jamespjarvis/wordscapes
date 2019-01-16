const Game = require("./game");
const fs = require("fs");
const path = require("path");

const gamesPath = path.resolve(__dirname, "../db/games.json");

const currentGames = new Map();

const createGame = gameId => {
  const game = new Game();
  game.initialize();
  game.id = gameId;
  currentGames.set(game.id, {
    game,
    players: [],
    forbidden: [],
    allowCheat: []
  });
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

const isCheatAllowed = ({ game, players, allowCheat }) => {
  if (players.length < allowCheat.length) return false;
  if (allowCheat.length >= players.length) {
    if (allowCheat.some(vote => !vote)) {
      currentGames.set(game.id, { game, players, allowCheat: [] });
    } else {
      return true;
    }
  }
  return false;
};

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
      // console.log("CREATE_GAME");
      const game = createGame();
      socket.emit("GAME_CREATED", { gameId: game.id });
    });

    socket.on("JOIN_GAME", ({ gameId }) => {
      // console.log("JOIN_GAME");

      if (currentGames.has(gameId)) {
        // console.log(`JOINING_GAME ${gameId}`);
        const targetGame = currentGames.get(gameId);
        Object.keys(socket.rooms).forEach(room =>
          socket.leave(socket.rooms[room])
        );
        // console.log(targetGame);
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
        const game = createGame(gameId);
        socket.emit("GAME_CREATED", { gameId: game.id });
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
      currentGames.set(game.id, {
        game,
        players: [],
        forbidden: [],
        allowCheat: []
      });
      socket.emit("GAME_LOADED", { gameId: game.id });
    });

    // GAMEPLAY
    socket.on("CHECK_PRESSED", ({ gameId, pressed }) => {
      // console.log("CHECK_PRESSED");

      if (currentGames.has(gameId)) {
        // console.log("CHECK_PRESSED_MULTIPLAYER");
        const targetGame = currentGames.get(gameId);
        const match = targetGame.game.checkWordsForMatch(pressed);
        if (match) {
          io.to(`${targetGame.game.id}`).emit("UPDATE", targetGame);
          socket.emit("CLEAR_PRESSED");
          saveGameState();
        }
      }
    });

    socket.on("FORFEIT_GAME", ({ gameId }) => {
      // console.log("FORFEIT_GAME");
      if (currentGames.has(gameId)) {
        const targetGame = currentGames.get(gameId);
        const game = new Game();
        game.loadGameState(targetGame.game);
        game.revealBoard();
        removeSocketFromCurrentGames(io, socket);
        targetGame.forbidden.push(socket.id);
        targetGame.game = game;
        currentGames.set(game.id, targetGame);
        socket.emit("UPDATE", targetGame);
      }
    });

    // CHEATS

    socket.on("REQUEST_CHEAT", ({ gameId, type }) => {
      io.to(`${gameId}`).emit("ALLOW_CHEAT", { gameId, type });
    });

    socket.on("NO_CHEAT", ({ gameId }) => {
      if (currentGames.has(gameId)) {
        const targetGame = currentGames.get(gameId);
        targetGame.allowCheat.push(false);
        currentGames.set(gameId, targetGame);
      }
    });

    socket.on("SHOW_RANDOM_WORD", ({ gameId }) => {
      // console.log("SHOW_RANDOM_WORD");
      if (currentGames.has(gameId)) {
        const targetGame = currentGames.get(gameId);
        targetGame.allowCheat.push(true);
        if (isCheatAllowed(targetGame)) {
          // console.log("CHEAT_ALLOWED");
          const game = new Game();
          game.loadGameState(targetGame.game);
          game.showRandomWord();
          const updatedGame = {
            ...targetGame,
            game,
            allowCheat: []
          };
          currentGames.set(gameId, updatedGame);
          io.to(`${gameId}`).emit("UPDATE", updatedGame);
        }
      }
    });

    socket.on("SHOW_RANDOM_CELL", ({ gameId }) => {
      // console.log("SHOW_RANDOM_CELL");
      if (currentGames.has(gameId)) {
        const targetGame = currentGames.get(gameId);
        targetGame.allowCheat.push(true);
        if (isCheatAllowed(targetGame)) {
          // console.log("CHEAT_ALLOWED");
          const game = new Game();
          game.loadGameState(targetGame.game);
          game.showRandomCell();
          const updatedGame = {
            ...targetGame,
            game,
            allowCheat: []
          };
          currentGames.set(gameId, updatedGame);
          io.to(`${gameId}`).emit("UPDATE", updatedGame);
        }
      }
    });
  });
  return io;
};
