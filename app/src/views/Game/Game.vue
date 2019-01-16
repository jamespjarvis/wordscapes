<template>
  <q-layout id="q-app" view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        v-if="$route.name === 'GameChat'"
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_left"
          @click="$router.go(-1)"
        />
        <q-toolbar-title>Chat</q-toolbar-title>
      </q-toolbar>
      <q-toolbar
        v-else
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
      <div class="page__wrapper">
        <div
          :key="$route.name"
          class="game__wrapper"
          :class="isLoading ? 'is-loading' : ''"
        >
          <router-view></router-view>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import ApiService from "@/common/api.service";
import { importAll, generateUsername } from "@/utils";

import Menu from "@/components/Menu";

const bgs = importAll(require.context("@/assets/bgs"));
const backgrounds = Object.keys(bgs).map(k => bgs[k]);

const deleteGameState = () => {
  localStorage.removeItem("gameId");
};
import { CLEAR_MESSAGES, UPDATE_PLAYERS } from "@/store/mutations.type";

import { mapState } from "vuex";

export default {
  name: "App",
  components: {
    Menu
  },
  data() {
    return {
      leftDrawerOpen: false,
      isLoading: false,
      isLoadingMessage: "",
      scoreClassList: "",
      highScore: 0,
      nickname: null
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
    gameId() {
      return this.$store.state.game.id;
    },
    background() {
      return backgrounds[this.level % backgrounds.length];
    },
    appStyle() {
      return {
        backgroundImage: `url(${this.background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      };
    }
  },
  watch: {
    gameId() {
      this.$store.commit(CLEAR_MESSAGES);
    },
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
                this.$socket.emit("LEVEL_COMPLETE", { gameId: this.gameId });
                this.isLoading = true;
                this.isLoadingMessage = "Loading Next Level...";
              }
            }
          ]
        });
      }
    }
  },
  async mounted() {
    // if (this.gameId.length) {
    //   this.$socket.on("connect", () => {
    //     this.handleJoinGame(this.gameId);
    //   });
    // } else {
    //   if (navigator.standalone) {
    //     document.body.style.position = "fixed";
    //     this.handleLoadGame();
    //   } else if (this.shouldPromptInstall()) {
    //     this.$q.notify({
    //       type: "info",
    //       timeout: 0,
    //       icon: "touch_app",
    //       position: "center",
    //       message: "Install Wordscapes",
    //       detail:
    //         "Hit the action button at the bottom of your screen and select 'Add to Home Screen' to add this application to your home screen for quick and easy access.",
    //       closeBtn: true,
    //       onDismiss: () => this.handleLoadGame()
    //     });
    //   } else {
    //     this.handleLoadGame();
    //   }
    // }

    this.highScore = this.getHighScore();

    this.$socket.on("connect", async () => {
      await this.getNickname();
    });

    this.$socket.on("GAME_CREATED", ({ gameId }) => {
      // console.log("GAME_CREATED");
      this.isLoading = false;
      this.handleJoinGame(gameId);
    });

    this.$socket.on("GAME_LOADED", ({ gameId }) => {
      this.isLoading = false;
      this.handleJoinGame(gameId);
    });

    this.$socket.on("GAME_JOINED", ({ gameId }) => {
      this.$router.push({ name: "GameHome", params: { gameId } });
      this.isLoadingMessage = "";
      this.isLoading = false;
      this.$socket.emit("GET_MESSAGE_HISTORY", { gameId });
    });

    this.$socket.on("UPDATE", () => {
      this.isLoading = false;
    });

    this.$socket.on("PLAYER_JOINED", ({ id, nickname, score }) => {
      this.$q.notify({ message: `${nickname} joined.`, type: "positive" });
      this.$store.commit(UPDATE_PLAYERS, { id, nickname, score });
    });
    this.$socket.on("PLAYER_LEFT", ({ nickname }) => {
      this.$q.notify({ message: `${nickname} left.`, type: "negative" });
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

    this.$socket.on("ALLOW_CHEAT", ({ gameId, type }) => {
      let remainingTime = 5000;
      const interval = setInterval(() => {
        remainingTime -= 1000;
        if (remainingTime <= 0) {
          const cancelButton = [
            ...document.querySelectorAll(
              ".modal-buttons > .q-btn > .q-btn-inner"
            )
          ].find(b => b.firstChild.textContent === "No");
          if (cancelButton) {
            cancelButton.click();
          }
        }
      }, 1000);

      this.$q
        .dialog({
          type: "confirm",
          title: "Somebody wants to cheat.",
          message: `Do you approve?`,
          ok: "Yes",
          cancel: "No"
        })
        .then(() => {
          clearInterval(interval);
          remainingTime = 5000;
          this.$socket.emit(`SHOW_RANDOM_${type}`, { gameId });
        })
        .catch(() => {
          clearInterval(interval);
          remainingTime = 5000;
          this.$socket.emit(`NO_CHEAT`, { gameId });
        });
    });
  },
  methods: {
    async getNickname() {
      const nickname = this.$q.localStorage.get.item("nickname");
      if (nickname) {
        this.nickname = nickname;
      } else {
        try {
          const nicknameInput = await this.$q.dialog({
            title: "What's your name?",
            prompt: {
              model: "",
              type: "text"
            },
            cancel: true,
            color: "primary"
          });
          if (nicknameInput.length < 3) {
            throw new Error("Nickname must be at least 3 characters");
          }
          this.nickname = nicknameInput;
          this.$q.localStorage.set("nickname", this.nickname);
        } catch (err) {
          const randomName = generateUsername();
          await this.$q.dialog({
            title: `Keep your secrets!`,
            message: `I'll just call you ${randomName} for now.`
          });
          this.nickname = randomName;
        }
      }
      this.$socket.emit("SET_NICKNAME", { nickname: this.nickname });
      this.handleLoadGame();
    },
    setHighScore(score) {
      localStorage.setItem("highScore", score);
    },
    getHighScore() {
      return parseInt(localStorage.getItem("highScore")) || 0;
    },
    handleCreateGame() {
      // console.log("handleCreateGame");
      deleteGameState();
      this.leftDrawerOpen = false;
      this.isLoading = true;
      this.isLoadingMessage = "Creating Game...";
      this.$socket.emit("CREATE_GAME", { nickname: this.nickname });
    },
    handleJoinGame(gameId) {
      this.leftDrawerOpen = false;
      // console.log("handleJoinGame");
      this.isLoading = true;
      this.isLoadingMessage = "Joining Game...";
      this.$socket.emit("JOIN_GAME", { gameId, nickname: this.nickname });
    },
    handleLoadGame() {
      // console.log("handleLoadGame");
      const gameId = localStorage.getItem("gameId");
      if (gameId) {
        this.handleJoinGame(gameId);
      } else {
        this.handleCreateGame();
      }
    },
    showRandomCell() {
      this.$socket.emit("REQUEST_CHEAT", { gameId: this.gameId, type: "CELL" });
      // this.$socket.emit("SHOW_RANDOM_CELL", { gameId: this.gameId });
      this.leftDrawerOpen = false;
    },
    showRandomWord() {
      this.$socket.emit("REQUEST_CHEAT", { gameId: this.gameId, type: "WORD" });
      // this.$socket.emit("SHOW_RANDOM_WORD", { gameId: this.gameId });
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
      this.$socket.emit("FORFEIT_GAME", { gameId: this.gameId });

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
    async handleJoinGameClick() {
      try {
        const gameId = await this.$q.dialog({
          title: "Enter Game ID",
          prompt: {
            model: "",
            type: "text"
          },
          cancel: true,
          color: "primary"
        });
        this.handleJoinGame(gameId);
      } catch (err) {
        this.$q.notify("Wow, so sassy.");
      }
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
.fade-enter-active,
.fade-leave-active {
  transition: 500ms ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
.page__wrapper {
  height: 100%;
  background-color: rgba(44, 44, 44, 0.25);
  .game__wrapper {
    height: calc(100vh - 51px);
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
