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
        <q-item @click.native="() => $emit('handler:forfeit')">
          <q-item-side icon="ion-ios-alert" />
          <q-item-main label="Forfeit" sublabel="Reveal board"></q-item-main>
        </q-item>
      </q-list>
      <q-list no-border link inset-delimiter>
        <q-list-header>Hacks</q-list-header>
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
      </q-list>
      <q-list no-border link inset-delimiter>
        <q-list-header>Multiplayer</q-list-header>
        <q-item @click.native="() => $emit('handler:join-game')">
          <q-item-side icon="cake" />
          <q-item-main
            label="Join Game"
            sublabel="Play with other people"
          ></q-item-main>
        </q-item>
      </q-list>
      <q-item-separator />
      <q-list no-border inset-delimiter>
        <q-item>
          <q-item-side icon="trending_up"></q-item-side>
          <q-item-main label="High Score"></q-item-main>
          <q-item-side>{{ highScore }}</q-item-side>
        </q-item>
        <q-item>
          <q-item-side icon="ion-ios-happy"></q-item-side>
          <q-item-main label="Players"></q-item-main>
          <q-item-side>{{ numPlayers }}</q-item-side>
        </q-item>
      </q-list>
      <q-item-separator />
      <q-list v-if="gameId" no-border link inset-delimiter>
        <q-item @click.native="() => copyGameIdToClipboard()">
          <q-item-main label="Game ID" :sublabel="gameId"></q-item-main>
          <q-item-side icon="ion-ios-copy"></q-item-side>
        </q-item>
      </q-list>
    </q-list>
  </q-layout-drawer>
</template>

<script>
import { copyToClipboard } from "@/utils";

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
      this.$q.notify({
        message: `Copied to clipboard`,
        timeout: 2000,
        color: "positive",
        position: "bottom"
      });
      return copyToClipboard(this.gameId);
    }
  }
};
</script>

<style></style>
