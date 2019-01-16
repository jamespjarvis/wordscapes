import {
  UPDATE_GAME,
  SOCKET_CONNECT,
  SOCKET_UPDATE,
  SOCKET_DISCONNECT,
  SOCKET_PLAYER_JOIN
} from "@/store/mutations.type";

import { difference, shuffle } from "@/utils";
import { SHUFFLE_KEY } from "./mutations.type";

const state = {
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
  levelComplete: false,
  isConnected: false,
  isLoading: false,
  numPlayers: 1
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
  [SOCKET_PLAYER_JOIN](state, { numPlayers }) {
    state.numPlayers = numPlayers;
  },
  [UPDATE_GAME](state, { game }) {
    for (let k in game) {
      state[k] = game[k];
    }
  },
  [SOCKET_UPDATE](state, { game }) {
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
    }

    for (let k in game) {
      state[k] = game[k];
    }

    localStorage.setItem("gameId", game.id);
  },
  [SHUFFLE_KEY](state) {
    state.key = shuffle(state.key);
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
