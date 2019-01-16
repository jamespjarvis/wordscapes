<template>
  <div ref="gridContainer" class="grid__container" :style="gridStyle">
    <div
      v-for="(c, i) in cells"
      :key="`cell-${i}`"
      class="grid__cell"
      :class="getCellClassList(c)"
      :style="{ fontSize: `${cellSize * 0.75}px` }"
    >
      <span v-if="isProduction"> {{ c && !c.isHidden ? c.letter : "" }} </span>
      <span v-else>{{ c ? c.letter : "" }} </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Grid",
  props: {
    cellSize: {
      type: Number,
      required: true
    },
    gridStyle: {
      type: Object,
      required: true
    },
    cells: {
      type: Array,
      required: true
    },
    isProduction: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    getCellClassList(cell) {
      const classList = [];
      if (cell) {
        if (this.isProduction) {
          classList.push("letter");
          if (!cell.isHidden) {
            classList.push("is-visible", "bg-tertiary");
          }
        } else {
          classList.push("letter", "is-visible");
          if (!cell.isHidden) {
            classList.push("bg-tertiary");
          }
        }
        if (cell.animate) {
          classList.push("animated", "flip");
          setTimeout(() => {
            cell.animate = false;
          }, 1000);
        }
      }

      return classList.join(" ");
    }
  }
};
</script>

<style scoped lang="scss">
.grid__container {
  display: grid;
  justify-content: center;
  .grid__cell {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    border: 1px solid transparent;

    &.letter {
      background-color: rgba(221, 221, 221, 0.75);
      font-family: "Roboto";
      font-size: 1.5rem;
      font-weight: 700;
      --visible: #9068be;
      color: rgba(255, 255, 255, 0);
      box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.15);
      border-radius: 1px;
      backface-visibility: hidden;
      position: relative;
      transform-style: preserve-3d;
      &:after {
        content: "";
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
        background: var(--visible);
        transform: rotateY(180deg);
        transform-style: preserve-3d;
        backface-visibility: hidden;
        box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.15);
        border-radius: 1px;
        background-color: rgba(221, 221, 221, 0.75);
      }
      &.is-visible {
        color: #fff;
      }
    }
  }
}
@keyframes flip {
  from {
    transform: perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 0)
      rotate3d(0, 1, 0, -180deg);
    animation-timing-function: ease-out;
  }

  40% {
    transform: perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 150px)
      rotate3d(0, 1, 0, -110deg);
    animation-timing-function: ease-out;
  }

  50% {
    transform: perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 150px)
      rotate3d(0, 1, 0, -70deg);
    animation-timing-function: ease-in;
  }

  80% {
    transform: perspective(400px) scale3d(0.95, 0.95, 0.95) translate3d(0, 0, 0)
      rotate3d(0, 1, 0, 0deg);
    animation-timing-function: ease-in;
  }

  to {
    transform: perspective(400px) scale3d(1, 1, 1) translate3d(0, 0, 0)
      rotate3d(0, 1, 0, 0deg);
    animation-timing-function: ease-in;
  }
}

.animated.flip {
  animation-name: flip;
}
.animated {
  animation-duration: 750ms;
  animation-fill-mode: both;
}
</style>
