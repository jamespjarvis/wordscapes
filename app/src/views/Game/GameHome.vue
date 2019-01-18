<template>
  <div ref="gameContainer" class="game__container">
    <Grid
      :cell-size="cellSize"
      :grid-style="gridStyle"
      :is-production="isProduction"
      :cells="cells"
    />
    <Pressed
      :pressed="pressed"
      :pressed-class-list="pressedClassList"
      @clear-pressed="clearPressed"
    />
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
import { UPDATE_CELLS } from "@/store/mutations.type";

export default {
  name: "GameHome",
  components: {
    Grid,
    Pressed,
    Key
  },
  data() {
    return {
      cellSize: 0,
      pressed: "",
      pressedKeys: [],
      isProduction,
      gridStyle: {},
      pressedClassList: ""
    };
  },
  computed: {
    ...mapState({
      key: state => state.game.key,
      grid: state => state.game.board.grid,
      cells: state => state.game.board.cells,
      guessed: state => state.game.guessed
    })
  },
  watch: {
    grid() {
      this.$nextTick(() => {
        this.computeGridStyle();
      });
    }
  },
  mounted() {
    window.addEventListener("resize", this.onWindowResize);
    this.$socket.on("CLEAR_PRESSED", this.clearPressed);
    this.computeGridStyle();
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

        this.gridStyle = {
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
      if (!this.guessed.includes(this.pressed)) {
        const gameId = this.$store.state.game.id;
        this.$socket.emit("CHECK_PRESSED", {
          gameId,
          pressed: this.pressed
        });
      } else {
        const cellList = [...this.cells];
        const cells = cellList.map(cell => {
          if (cell && cell.words.includes(this.pressed)) {
            return { ...cell, animate: true, animation: "wobble" };
          }
          return cell;
        });

        this.$store.commit(UPDATE_CELLS, cells);

        // this.pressedClassList = "animated wobble";
        // this.timeout = setTimeout(() => {
        //   this.pressedClassList = "";
        //   clearTimeout(this.timeout);
        // }, 1000);
      }
    },
    // window resize event handler
    onWindowResize: throttle(function() {
      this.computeGridStyle();
    }, 50)
  }
};
</script>
