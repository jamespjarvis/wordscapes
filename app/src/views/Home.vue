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
        <q-toolbar-title>
          Level
          <div slot="subtitle">{{ level }}</div>
        </q-toolbar-title>
        <q-toolbar-title>
          Words
          <div slot="subtitle">{{ numWords }}</div>
        </q-toolbar-title>
        <q-toolbar-title>
          Score
          <div slot="subtitle" :class="scoreClassList">{{ score }}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>

    <Menu
      :left-drawer-open="leftDrawerOpen"
      :high-score="highScore"
      :num-players="numPlayers"
      :game-id="game.id"
      @update:drawer="val => (leftDrawerOpen = val)"
      @handler:show-cell="showRandomCell"
      @handler:show-word="showRandomWord"
      @handler:new-game="handleCreateGame"
      @handler:forfeit="handleForfeitGameClick"
      @handler:join-game="handleJoinGameClick"
    />
    <q-page-container :style="appStyle">
      <div class="game__wrapper" :class="isLoading ? 'is-loading' : ''">
        <Game :is-multiplayer="isMultiplayer" />
      </div>
      <join-game-modal
        :opened="showJoinGameModal"
        @update:opened="val => (showJoinGameModal = val)"
        @game:join="gameId => handleJoinGame(gameId)"
        @game:create="handleCreateGame"
      />
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import ApiService from "@/common/api.service";
import { importAll } from "@/utils";

import Menu from "@/components/Menu";
import Game from "@/components/Game";

import JoinGameModal from "@/components/JoinGameModal";

const bgs = importAll(require.context("@/assets/bgs"));
const backgrounds = Object.keys(bgs).map(k => bgs[k]);

const deleteGameState = () => {
  localStorage.removeItem("gameId");
};

import { mapState } from "vuex";

export default {
  name: "App",
  components: {
    Menu,
    Game,
    JoinGameModal
  },
  props: {
    gameId: {
      type: String,
      required: true,
      default: ""
    }
  },
  data() {
    return {
      leftDrawerOpen: false,
      isLoading: false,
      isLoadingMessage: "",
      scoreClassList: "",
      highScore: 0,
      showJoinGameModal: false
    };
  },
  computed: {
    ...mapState({
      numPlayers: state => state.game.numPlayers,
      game: state => state.game,
      score: state => state.game.score,
      level: state => state.game.level,
      numWords: state => state.game.numWords,
      hasCompletedLevel: state => state.game.levelComplete
    }),
    background() {
      return backgrounds[this.level % backgrounds.length];
    },
    appStyle() {
      return {
        backgroundImage: `url(${this.background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      };
    },
    isMultiplayer() {
      return !!this.gameId.length;
    }
  },
  watch: {
    score() {
      this.scoreClassList = "animated heartBeat";
      setTimeout(() => {
        this.scoreClassList = "";
      }, 2000);
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.setHighScore(this.highScore);
      }
    },
    isLoading(to) {
      if (to) {
        this.$q.loading.show({ message: this.isLoadingMessage });
      } else {
        this.$q.loading.hide();
      }
    },
    isLoadingMessage() {
      if (this.isLoading) {
        this.$q.loading.show({ message: this.isLoadingMessage });
      }
    },
    async hasCompletedLevel(to) {
      const { data } = await ApiService.get("/catfact");
      if (to) {
        this.$q.notify({
          message: "Congratulations!",
          detail: data.fact,
          type: "info",
          color: "info",
          position: "center",
          timeout: 0,
          icon: "sentiment_satisfied_alt",
          actions: [
            {
              label: "Next Level",
              icon: "arrow_forward",
              handler: () => {
                this.isLoading = true;
                this.isLoadingMessage = "Loading Next Level...";
                this.$socket.emit("LEVEL_COMPLETE", { gameId: this.gameId });
              }
            }
          ]
        });
      }
    }
  },
  async mounted() {
    if (this.gameId.length) {
      this.$socket.on("connect", () => {
        this.handleJoinGame(this.gameId);
      });
    } else {
      if (navigator.standalone) {
        document.body.style.position = "fixed";
        this.handleLoadGame();
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
          onDismiss: () => this.handleLoadGame()
        });
      } else {
        this.handleLoadGame();
      }
    }

    this.highScore = this.getHighScore();

    this.$socket.on("GAME_CREATED", ({ gameId }) => {
      // console.log("GAME_CREATED");
      this.isLoading = false;
      this.handleJoinGame(gameId);
    });
    this.$socket.on("GAME_LOADED", ({ gameId }) => {
      this.isLoading = false;
      this.handleJoinGame(gameId);
    });
    this.$socket.on("GAME_JOINED", () => {
      this.isLoadingMessage = "";
      this.isLoading = false;
    });
    this.$socket.on("UPDATE", () => {
      this.isLoading = false;
    });
    this.$socket.on("FORBIDDEN", () => {
      this.isLoading = false;
      this.$q.notify({
        message: "Yeah... that's not gunna fly.",
        detail: "Try starting a new game.",
        type: "negative",
        color: "negative",
        position: "center",
        icon: "cancel",
        timeout: 0,
        actions: [
          {
            label: "New Game?",
            handler: () => {
              deleteGameState();
              this.handleLoadGame();
            }
          }
        ]
      });
    });
  },
  methods: {
    setHighScore(score) {
      localStorage.setItem("highScore", score);
    },
    getHighScore() {
      return parseInt(localStorage.getItem("highScore")) || 0;
    },
    handleCreateGame() {
      // console.log("handleCreateGame");
      this.$router.replace("/");
      this.leftDrawerOpen = false;
      this.isLoading = true;
      this.isLoadingMessage = "Creating Game...";
      this.$socket.emit("CREATE_GAME");
    },
    handleJoinGame(gameId) {
      this.leftDrawerOpen = false;
      // console.log("handleJoinGame");
      this.isLoading = true;
      this.isLoadingMessage = "Joining Game...";
      this.$router.replace(`/${gameId}`);
      this.$socket.emit("JOIN_GAME", { gameId });
    },
    handleLoadGame() {
      // console.log("handleLoadGame");
      this.$router.replace("/");
      const gameId = localStorage.getItem("gameId");
      if (gameId) {
        this.handleJoinGame(gameId);
      } else {
        this.handleCreateGame();
      }
    },
    showRandomCell() {
      this.$socket.emit("SHOW_RANDOM_CELL", { game: this.game });
      this.leftDrawerOpen = false;
    },
    showRandomWord() {
      this.$socket.emit("SHOW_RANDOM_WORD", { game: this.game });
      this.leftDrawerOpen = false;
    },
    shouldPromptInstall() {
      return (
        !navigator.standalone &&
        ["iPhone", "iPad", "iPod"].includes(navigator.platform)
      );
    },
    async handleForfeitGameClick() {
      this.leftDrawerOpen = false;
      this.$socket.emit("FORFEIT_GAME", { game: this.game });

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
            handler: () => {
              deleteGameState();
              this.handleLoadGame();
            }
          }
        ]
      });
    },
    handleNewGameClick() {
      this.$router.replace("/");
      this.leftDrawerOpen = false;
      deleteGameState();
      this.handleLoadGame();
    },
    handleJoinGameClick() {
      this.showJoinGameModal = true;
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
.game__wrapper {
  height: calc(100vh - 51px);
  background-color: rgba(44, 44, 44, 0.25);

  &.is-loading {
    .grid__container,
    .pressed__container,
    .key__container {
      display: none;
    }
  }

  .game__container {
    height: 100%;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    .grid__container {
      flex: 1;
    }
    @media (min-width: 769px) {
      align-items: center;
      & > * {
        width: 100%;
      }
    }
  }
}
@keyframes heartBeat {
  0% {
    transform: scale(1);
  }

  14% {
    transform: scale(1.3);
  }

  28% {
    transform: scale(1);
  }

  42% {
    transform: scale(1.3);
  }

  70% {
    transform: scale(1);
  }
}

.heartBeat {
  animation-name: heartBeat;
  animation-duration: 1.3s;
  animation-timing-function: ease-in-out;
}
</style>
