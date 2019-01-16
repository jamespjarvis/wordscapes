<template>
  <div
    v-touch-swipe.right="
      () => $router.replace({ name: 'GameHome', params: { gameId } })
    "
    class="chat__container"
  >
    <div class="chat__wrapper">
      <div ref="messages" class="chat__messages">
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
          <q-field>
            <q-input
              v-model="message"
              type="textarea"
              autofocus
              color="primary"
              :after="[
                {
                  icon: 'ion-ios-send',
                  handler: () => sendMessage()
                }
              ]"
              @keydown.enter.prevent="sendMessage"
            />
          </q-field>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
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
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.computeScrollHeight();
        });
      },
      deep: true
    }
  },
  methods: {
    computeScrollHeight() {
      const el = this.$refs.messages;
      if (el) {
        el.scrollTop = el.scrollHeight + 53;
      }
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
        this.message = "";
      }
    }
  }
};
</script>

<style lang="scss">
.chat__container {
  background-color: WHITE;
  height: 100%;
  width: 100vw;
  .chat__wrapper {
    position: relative;
    height: 100%;

    .chat__messages {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 1rem;
      // height: 100%;
      padding-bottom: 53px;
      overflow-y: scroll;
    }
    .chat__form {
      background: linear-gradient(
        to top,
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 0.75)
      );
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem;
      height: 53px;
    }
  }
}
</style>
