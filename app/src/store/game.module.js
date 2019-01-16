import {
  UPDATE_GAME,
  SOCKET_CONNECT,
  SOCKET_UPDATE,
  SOCKET_DISCONNECT
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
  numPlayers: 0
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
        });
      });
    } else {
      for (let k in defaultGameState) {
        state[k] = defaultGameState[k];
      }
    }

    for (let k in game) {
      state[k] = game[k];
    }
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
