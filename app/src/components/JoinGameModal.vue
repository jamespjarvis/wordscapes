<template>
  <q-modal v-model="show">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-btn v-close-overlay flat round dense icon="keyboard_arrow_left" />
        <q-toolbar-title>{{ modalTitle }}</q-toolbar-title>
      </q-toolbar>

      <q-tabs
        v-model="selectedTab"
        position="bottom"
        class="full-height"
        panes-container-class="layout-padding tab-panes"
      >
        <q-tab-pane name="joinGame">
          <q-field
            icon="cloud"
            label="Join Game"
            helper="Game ID"
            orientation="vertical"
            :error="error"
            error-label="Not a valid game id."
          >
            <q-input v-model="gameId" />
          </q-field>
          <q-btn
            icon="create"
            label="Join"
            color="tertiary"
            @click="$emit('game:join', gameId)"
          />
        </q-tab-pane>
        <q-tab-pane name="createGame">Creating game.</q-tab-pane>
        <q-tab slot="title" name="joinGame" icon="message" label="Join Game" />
        <q-tab
          slot="title"
          name="createGame"
          icon="accessibility"
          label="Create Game"
          @click="$emit('game:create')"
        />
      </q-tabs>
    </q-modal-layout>
  </q-modal>
</template>

<script>
export default {
  name: "JoinGameModal",
  props: {
    opened: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      error: false,
      gameId: "",
      show: this.opened,
      showCreateGame: false,
      selectedTab: "joinGame",
      tabsOptions: [
        {
          label: "Join Game",
          value: "joinGame"
        },
        {
          label: "Create Game",
          value: "createGame"
        }
      ]
    };
  },
  computed: {
    modalTitle() {
      return this.selectedTab === "createGame" ? "Create Game" : "Join Game";
    }
  },
  watch: {
    opened(to) {
      this.show = to;
    },
    show(to) {
      this.$emit("update:opened", to);
    }
  }
};
</script>

<style lang="scss">
.tab-panes {
  flex: 1;
}
</style>
