import {
  UPDATE_GAME,
  SOCKET_CONNECT,
  SOCKET_UPDATE,
  SOCKET_DISCONNECT,
  UPDATE_PLAYERS,
  SOCKET_PLAYER_LEFT,
  UPDATE_CELLS
} from "@/store/mutations.type";

import { difference } from "@/utils";

const defaultGameState = {
  id: "",
  key: [],
  words: [],
  guessed: [],
  board: {
    cells: [],
    grid: []
  },
  level: 1,
  score: 0,
  initialWords: 6,
  numWords: 6,
  maxWordLength: 6,
  prices: { randomCell: 50, randomWord: 100 },
  levelComplete: false
};
const state = {
  ...defaultGameState,
  isConnected: false,
  isLoading: false,
  numPlayers: 0,
  players: []
};

const getters = {
  cells(state) {
    return state.board.cells;
  },
  grid(state) {
    return state.board.grid;
  }
};

const actions = {};

const mutations = {
  [SOCKET_CONNECT](state) {
    state.isConnected = true;
  },
  [SOCKET_DISCONNECT](state) {
    state.isConnected = false;
  },
  [UPDATE_GAME](state, { game }) {
    for (let k in game) {
      state[k] = game[k];
    }
  },
  [UPDATE_CELLS](state, cells) {
    state.board.cells = cells;
  },
  [SOCKET_PLAYER_LEFT](state, { id }) {
    const playerIndex = state.players.findIndex(p => p.id === id);
    state.players.splice(playerIndex, 1);
  },
  [UPDATE_PLAYERS](state, { id, nickname, score }) {
    state.players.push({ id, nickname, score });
    state.numPlayers = state.players.length;
  },
  [SOCKET_UPDATE](state, { game, players }) {
    if (game.guessed.length !== state.guessed.length) {
      const diff = difference(game.guessed, state.guessed);
      diff.forEach(d => {
        const cells = game.board.cells.filter(
          cell => cell && cell.words.includes(d)
        );
        cells.forEach(c => {
          const cell = game.board.cells.find(x => x === c);
          cell.animate = true;
          cell.animation = "flip";
        });
      });
    }

    for (let k in game) {
      state[k] = game[k];
    }

    state.players = players;
    state.numPlayers = players.length;
    localStorage.setItem("gameId", game.id);
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
