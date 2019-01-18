<template>
  <div class="pressed__container" @click="() => $emit('clear-pressed')">
    <div
      class="pressed q-display-2 text-weight-bolder"
      :class="pressedClassList"
    >
      {{ pressed }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Pressed",
  props: {
    pressed: {
      type: String,
      required: true
    },
    pressedClassList: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss">
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
</style>
