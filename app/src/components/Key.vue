<template>
  <transition-group
    v-touch-swipe.horizontal="handleKeyContainerSwipe"
    name="shuffle-list"
    tag="div"
    move-class="shuffle-list-move"
    class="key__container"
    :css="true"
  >
    <q-btn
      v-for="k in innerLetters"
      :key="`key-${k.id}`"
      :class="pressedKeys.includes(k.id) ? 'is-hidden' : ''"
      color="primary"
      size="xl"
      :label="k.letter"
      @click="handleKeyPress(k)"
    />
  </transition-group>
</template>

<script>
import { shuffle, throttle } from "@/utils";

export default {
  name: "Key",
  props: {
    letters: {
      type: Array,
      required: true
    },
    pressedKeys: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      innerLetters: this.letters
    };
  },
  computed: {
    availableKeys() {
      return this.letters.reduce((a, c) => {
        return this.pressedKeys.includes(c.id) ? a : [...a, c];
      }, []);
    }
  },
  watch: {
    letters() {
      this.innerLetters = this.letters;
    }
  },
  created() {
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  },
  destroyed() {
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
  },
  methods: {
    handleKeyContainerSwipe: throttle(function() {
      this.innerLetters = shuffle(this.innerLetters);
    }, 500),
    handleKeyPress(k) {
      this.$emit("keypress", k);
    },
    handleKeyUp(e) {
      if (e.key === "Backspace") {
        this.$emit("update:pressed");
      } else {
        const pressedKey = this.availableKeys.find(
          k => k.letter === e.key.toUpperCase()
        );
        if (pressedKey) {
          this.$emit("keypress", pressedKey);
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
.shuffle-list-move {
  transition: transform 400ms !important;
}
.key__container {
  display: flex;
  padding: 0.5rem;
  & > * {
    flex: 1;
    margin: 4px;
    font-family: "Roboto";
    font-size: 1.25rem !important;
    transition: opacity 500ms;
    &.is-hidden {
      opacity: 0;
    }
  }
}
</style>
