<template>
  <q-layout id="q-app" view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          flat
          dense
          round
          aria-label="Menu"
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title
          >Level
          <div slot="subtitle">{{ level }}</div>
        </q-toolbar-title>
        <q-toolbar-title
          >Words
          <div slot="subtitle">{{ numWords }}</div>
        </q-toolbar-title>
        <q-toolbar-title
          >Score
          <div slot="subtitle">{{ score }}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>

    <Menu
      :left-drawer-open="leftDrawerOpen"
      @update:drawer="val => (leftDrawerOpen = val)"
      @handler:show-cell="showRandomCell"
      @handler:show-word="showRandomWord"
      @handler:new-game="handleNewGameClick"
      @handler:forfeit="handleForfeitGameClick"
    ></Menu>

    <q-page-container :style="appStyle">
      <div class="app__container" :class="isLoading ? 'is-loading' : ''">
        <div ref="gridContainer" class="grid__container" :style="gridStyle">
          <div
            v-for="(c, i) in cells"
            :key="`cell-${i}`"
            class="grid__cell"
            :class="getCellClassList(c)"
          >
            <span v-if="isProduction">
              {{ c && !c.isHidden ? c.letter : "" }}
            </span>
            <span v-else>{{ c ? c.letter : "" }} </span>
          </div>
        </div>
        <div class="pressed__container" @click="clearPressed()">
          <div class="pressed q-display-2 text-weight-bolder">
            {{ pressed }}
          </div>
        </div>
        <Key
          :letters="key"
          :pressed-keys="pressedKeys"
          @update:pressed="updatePressed"
          @keypress="handleKeyPress"
          @shufflekey="shuffleKey"
        />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";

import ApiService from "@/common/api.service";
import { round, shuffle, importAll } from "./utils";

import Key from "@/components/Key";
import Menu from "@/components/Menu";
const bgs = importAll(require.context("@/assets/bgs"));

const saveGameState = game => {
  localStorage.setItem("game", JSON.stringify(game));
};
const deleteGameState = () => {
  localStorage.removeItem("game");
};

const isProduction = process.env.NODE_ENV === "production";

const gameObject = {
  key: [],
  words: [],
  board: {
    grid: [],
    cells: []
  },
  level: 1,
  score: 0,
  isLoading: false,
  levelComplete: false,
  numWords: 0
};

export default {
  name: "App",
  components: {
    Menu,
    Key
  },
  data() {
    return {
      isProduction,
      backgrounds: Object.keys(bgs).map(k => bgs[k]),
      pressed: "",
      pressedKeys: [],
      game: gameObject,
      leftDrawerOpen: this.$q.platform.is.desktop,
      socket: io("localhost:3000"),
      isLoading: false
    };
  },
  computed: {
    score() {
      return this.game.score;
    },
    level() {
      return this.game.level;
    },
    background() {
      return this.backgrounds[this.level % this.backgrounds.length];
    },
    appStyle() {
      return {
        backgroundImage: `url(${this.background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      };
    },
    key() {
      return this.game.key;
    },
    cells() {
      return this.game.board.cells;
    },
    grid() {
      return this.game.board.grid;
    },
    numWords() {
      return this.game.numWords;
    },
    hasCompletedLevel() {
      return this.game && this.game.levelComplete;
    },
    gridStyle() {
      if (this.grid[0]) {
        const padding = 15;
        const gap = 2;
        const maxDimension = Math.max(this.grid.length, this.grid[0].length);
        const cellSize = this.getCellSize(maxDimension, gap, padding);

        return {
          gridGap: `${gap}px`,
          padding: `${padding}px`,
          gridTemplateColumns: `repeat(${this.grid[0].length}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${this.grid.length}, ${cellSize}px)`
        };
      }
      return {};
    }
  },
  watch: {
    isLoading(to) {
      if (to) {
        this.$q.loading.show({ message: "Loading next level..." });
      } else {
        this.$q.loading.hide();
      }
    },
    async hasCompletedLevel(to) {
      if (to) {
        this.$q.notify({
          message: "Congratulations!",
          detail: "Wow! So good. So good.",
          type: "info",
          color: "info",
          position: "center",
          timeout: 0,
          icon: "sentiment_satisfied_alt",
          actions: [
            {
              label: "Next Level",
              icon: "arrow_forward",
              handler: async () => {
                this.game.level++;
                saveGameState(this.game);
                await this.loadGame();
              }
            }
          ]
        });
      }
    }
  },
  async mounted() {
    if (navigator.standalone) {
      document.body.style.position = "fixed";
      await this.loadGame();
    } else if (this.shouldPromptInstall()) {
      this.$q.notify({
        type: "info",
        timeout: 0,
        icon: "touch_app",
        position: "center",
        message: "Install Wordscapes",
        detail:
          "Hit the action button at the bottom of your screen and select 'Add to Home Screen' to add this application to your home screen for quick and easy access.",
        closeBtn: true,
        onDismiss: async () => await this.loadGame()
      });
    } else {
      await this.loadGame();
    }
    this.socket.on("UPDATE", ({ game }) => {
      if (game.guessed.length !== this.game.guessed.length) {
        this.pressed = "";
        this.pressedKeys = [];
      }
      this.game = game;
      saveGameState(this.game);
    });
  },
  methods: {
    getCellSize(numCells, gap, padding) {
      let gridWidth = Math.min(document.body.offsetWidth, 720);
      gridWidth -= 2 * padding;
      gridWidth -= gap * (numCells - 1);
      return round(gridWidth / numCells, 2);
    },
    getCellClassList(cell) {
      if (cell) {
        if (this.isProduction) {
          return cell.isHidden ? "letter" : "letter is-visible bg-tertiary";
        } else {
          return cell.isHidden
            ? "letter is-visible"
            : "letter is-visible bg-tertiary";
        }
      }
    },
    async loadGame() {
      this.isLoading = true;
      if (localStorage.getItem("game")) {
        const game = JSON.parse(localStorage.getItem("game"));
        const { data } = await ApiService.post("/", { game });
        this.game = data.game;
      } else {
        const { data } = await ApiService.get("/");
        this.game = data.game;
      }
      saveGameState(this.game);
      this.isLoading = false;
    },
    showRandomCell() {
      this.socket.emit("SHOW_RANDOM_CELL", { game: this.game });
      this.leftDrawerOpen = false;
    },
    showRandomWord() {
      this.socket.emit("SHOW_RANDOM_WORD", { game: this.game });
      this.leftDrawerOpen = false;
    },
    shuffleKey() {
      this.game.key = shuffle(this.game.key);
    },
    shouldPromptInstall() {
      return (
        !navigator.standalone &&
        ["iPhone", "iPad", "iPod"].includes(navigator.platform)
      );
    },
    async handleForfeitGameClick() {
      this.socket.emit("FORFEIT_GAME", { game: this.game });
      this.leftDrawerOpen = false;

      const { data } = await axios.get("https://api.adviceslip.com/advice");

      this.$q.notify({
        message: "You're a loser.",
        detail: data.slip.advice,
        type: "negative",
        color: "negative",
        position: "center",
        icon: "cancel",
        timeout: 0,
        actions: [
          {
            label: "New Game?",
            handler: async () => {
              deleteGameState();
              this.pressed = "";
              this.pressedKeys = [];
              await this.loadGame();
            }
          }
        ]
      });
    },
    async handleNewGameClick() {
      this.leftDrawerOpen = false;
      deleteGameState();
      this.pressed = "";
      this.pressedKeys = [];
      await this.loadGame();
    },
    clearPressed() {
      this.pressed = "";
      this.pressedKeys = [];
    },
    checkPressed() {
      this.socket.emit("CHECK_PRESSED", {
        game: this.game,
        pressed: this.pressed
      });
    },
    handleKeyPress(key) {
      if (!this.pressedKeys.includes(key.id)) {
        this.pressedKeys.push(key.id);
        this.pressed += key.letter;
        this.checkPressed();
      }
    },
    updatePressed() {
      this.pressed = this.pressed.substr(0, this.pressed.length - 1);
      this.pressedKeys.pop();
    }
  }
};
</script>

<style lang="scss">
html,
body {
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
.app__container {
  height: calc(100vh - 51px);
  display: flex;
  flex-direction: column;
  background-color: rgba(44, 44, 44, 0.25);
  @media (min-width: 769px) {
    align-items: center;
    & > * {
      width: 100%;
      max-width: 769px;
    }
  }

  &.is-loading {
    .grid__container,
    .pressed__container,
    .key__container {
      display: none;
    }
  }
  .grid__container {
    display: grid;

    width: 100%;
    flex: 1;
    .grid__cell {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      border: 1px solid transparent;

      &.letter {
        background-color: rgba(221, 221, 221, 0.75);
        // border-color: #aaa;
        font-family: "Roboto";
        font-size: 1.5rem;
        font-weight: 700;
        --visible: #9068be;
        color: rgba(255, 255, 255, 0);
        transition: 500ms ease;
        &.is-visible {
          color: #fff;
          // border-color: var(--q-color-positive) !important;
          // background-color: var(--q-color-positive) !important;
        }
      }
    }
  }
  .pressed__container {
    height: 112px;
    padding: 2rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    .pressed {
      color: WHITE;
      text-align: center;
      letter-spacing: 5px;
    }
  }
}
</style>
