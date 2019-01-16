<template>
  <div ref="gameContainer" class="game__container">
    <Grid
      :cell-size="cellSize"
      :grid-style="gridStyle"
      :is-production="isProduction"
      :cells="cells"
    />
    <Pressed :pressed="pressed" @clear-pressed="clearPressed" />
    <Key
      :letters="key"
      :pressed-keys="pressedKeys"
      @update:pressed="updatePressed"
      @keypress="handleKeyPress"
    />
  </div>
</template>

<script>
const isProduction = process.env.NODE_ENV === "production";
import Grid from "@/components/Grid";
import Pressed from "@/components/Pressed";
import Key from "@/components/Key";
import { round, throttle } from "@/utils";
import { mapState } from "vuex";

export default {
  name: "Game",
  components: {
    Grid,
    Pressed,
    Key
  },
  props: {
    isMultiplayer: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      cellSize: 0,
      pressed: "",
      pressedKeys: [],
      isProduction
    };
  },
  computed: {
    ...mapState({
      key: state => state.game.key,
      grid: state => state.game.board.grid,
      cells: state => state.game.board.cells
    }),
    gridStyle() {
      return this.computeGridStyle();
    }
  },
  mounted() {
    window.addEventListener("resize", this.onWindowResize);
    this.$socket.on("CLEAR_PRESSED", this.clearPressed);
  },
  destroyed() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    getCellSize(numCells, gap, padding) {
      const containerSize = this.$refs.gameContainer.offsetWidth;
      // console.log(this.$refs);

      let gridWidth = Math.min(containerSize, 720);
      gridWidth -= 2 * padding;
      gridWidth -= gap * (numCells - 1);
      this.cellSize = round(gridWidth / numCells, 2);
    },
    computeGridStyle() {
      if (this.grid[0]) {
        const padding = 15;
        const gap = 2;
        const maxDimension = Math.max(this.grid.length, this.grid[0].length);

        this.getCellSize(maxDimension, gap, padding);

        return {
          gridGap: `${gap}px`,
          padding: `${padding}px`,
          gridTemplateColumns: `repeat(${this.grid[0].length}, ${
            this.cellSize
          }px)`,
          gridTemplateRows: `repeat(${this.grid.length}, ${this.cellSize}px)`
        };
      }
      return {};
    },
    clearPressed() {
      this.pressed = "";
      this.pressedKeys = [];
    },
    updatePressed() {
      this.pressed = this.pressed.substr(0, this.pressed.length - 1);
      this.pressedKeys.pop();
    },
    handleKeyPress(key) {
      if (!this.pressedKeys.includes(key.id)) {
        this.pressedKeys.push(key.id);
        this.pressed += key.letter;
        this.checkPressed();
      }
    },
    checkPressed() {
      const game = this.$store.state.game;
      this.$socket.emit("CHECK_PRESSED", {
        game,
        pressed: this.pressed
      });
    },
    // window resize event handler
    onWindowResize: throttle(function() {
      this.computeGridStyle();
    }, 50)
  }
};
</script>
