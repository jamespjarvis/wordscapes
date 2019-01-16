<template>
  <q-modal v-model="show" minimized :content-css="{ padding: '20px' }">
    <div class="q-title">Join Game</div>
    <div class="layout-padding">
      <q-field
        helper="Game ID"
        orientation="vertical"
        :error="error"
        error-label="Not a valid game id."
      >
        <q-input v-model="gameId" />
      </q-field>
    </div>
    <q-btn
      icon="done"
      label="Join"
      color="tertiary"
      @click="handleJoinGameClick"
    />
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
      show: this.opened
    };
  },
  watch: {
    opened(to) {
      this.show = to;
    },
    show(to) {
      this.$emit("update:opened", to);
    }
  },
  methods: {
    handleJoinGameClick() {
      this.show = false;
      this.$emit("game:join", this.gameId);
    }
  }
};
</script>
