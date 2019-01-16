<template>
  <q-layout-drawer
    v-model="isOpen"
    :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
  >
    <q-list no-border inset-delimiter>
      <q-list no-border link inset-delimiter>
        <q-list-header>Wordscapes</q-list-header>
        <q-item @click.native="() => $emit('handler:new-game')">
          <q-item-side icon="dashboard" />
          <q-item-main
            label="New Game"
            sublabel="Start a new game"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:join-game')">
          <q-item-side icon="cake" />
          <q-item-main
            label="Join Game"
            sublabel="Play with other people"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:forfeit')">
          <q-item-side icon="ion-ios-alert" />
          <q-item-main label="Leave Game" sublabel="Forfeit."></q-item-main>
        </q-item>
        <q-item-separator></q-item-separator>
        <q-item @click.native="() => $emit('handler:show-cell')">
          <q-item-side icon="ion-ios-color-wand" />
          <q-item-main
            label="Cheat"
            sublabel="Reveal one letter (50pts)"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:show-word')">
          <q-item-side icon="accessible" />
          <q-item-main
            label="Super Cheat"
            sublabel="Reveal one word (100pts)"
          ></q-item-main>
        </q-item>
        <q-item-separator></q-item-separator>
        <q-item
          v-if="gameId.length"
          :to="{ name: 'GameChat', params: { gameId } }"
        >
          <q-item-side icon="ion-ios-chatboxes" />
          <q-item-main
            label="Chat"
            sublabel="Violence. Speed. Momentum"
          ></q-item-main>
        </q-item>
        <q-item-separator></q-item-separator>
        <q-list no-border inset-delimiter>
          <q-list-header>Players</q-list-header>
          <q-item v-for="p in players" :key="p.id">
            <q-item-main :label="p.nickname"></q-item-main>
            <q-item-side>{{ p.score }}</q-item-side>
          </q-item>
        </q-list>
        <q-item-separator></q-item-separator>
        <q-item @click.native="copyGameIdToClipboard">
          <q-item-main label="Game ID" :sublabel="gameId"></q-item-main>
          <q-item-side icon="ion-ios-copy"></q-item-side>
        </q-item>
      </q-list>
    </q-list>
    <!-- <q-item>
          <q-item-side icon="trending_up"></q-item-side>
          <q-item-main label="High Score"></q-item-main>
          <q-item-side>{{ highScore }}</q-item-side>
        </q-item> -->
  </q-layout-drawer>
</template>

<script>
export default {
  name: "Menu",
  props: {
    leftDrawerOpen: {
      type: Boolean,
      default: false
    },
    highScore: {
      type: Number,
      required: true
    },
    numPlayers: {
      type: Number,
      required: true
    },
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isOpen: this.leftDrawerOpen
    };
  },
  computed: {
    players() {
      return this.$store.state.game.players;
    }
  },
  watch: {
    leftDrawerOpen(to) {
      this.isOpen = to;
    },
    isOpen(to) {
      this.$emit("update:drawer", to);
    }
  },
  methods: {
    copyGameIdToClipboard() {
      // copyToClipboard(this.gameId);
      window.Clipboard.copy(this.gameId);
      this.$q.notify({
        message: `Copied to clipboard`,
        timeout: 2000,
        color: "positive",
        position: "bottom"
      });
    }
  }
};
</script>

<style></style>
