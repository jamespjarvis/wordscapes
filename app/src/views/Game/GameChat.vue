<template>
  <div class="chat__container">
    <div class="chat__wrapper">
      <q-toolbar color="secondary" style="z-index: 100000;">
        <q-btn
          flat
          round
          dense
          icon="keyboard_arrow_left"
          @click="$router.go(-1)"
        />
        <q-toolbar-title>Chat</q-toolbar-title>
      </q-toolbar>
      <div class="chat__messages">
        <q-chat-message :label="new Date().toDateString()" />
        <q-chat-message
          v-for="(m, i) in messages"
          :key="i"
          :name="m.nickname"
          :text="m.message"
          :stamp="m.timestamp"
          :sent="m.sent"
          size="6"
          :avatar="m.sent ? 'avatars/penguin.png' : 'avatars/ninja.png'"
        />
      </div>
      <div class="chat__form">
        <form @submit.prevent="sendMessage">
          <q-field> <q-input v-model="message" type="text" /> </q-field>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ADD_MESSAGE } from "@/store/mutations.type";

export default {
  name: "GameChat",
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: ""
    };
  },
  computed: {
    messages() {
      return this.$store.state.chat.messages;
    }
  },
  methods: {
    updateTimestamps() {
      this.messages = this.messages.map(m => {
        m.timestamp = this.getTimestamp(m.time);
        return m;
      });
    },
    sendMessage() {
      if (this.message.length) {
        const time = Date.now();

        const message = {
          gameId: this.gameId,
          message: [this.message],
          time
        };

        this.$socket.emit("SEND_MESSAGE", message);

        this.$store.commit(ADD_MESSAGE, {
          ...message,
          sent: true
        });
        this.message = "";
      }
    }
  }
};
</script>

<style lang="scss">
.chat__container {
  z-index: 1000;
  background-color: WHITE;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .chat__wrapper {
    position: relative;
    max-height: 100%;
    height: 100%;

    .chat__messages {
      overflow-y: auto;
      padding: 1rem;
    }
    .chat__form {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem;
    }
  }
}
</style>
