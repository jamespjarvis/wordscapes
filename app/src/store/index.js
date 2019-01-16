import Vue from "vue";
import Vuex from "vuex";

import game from "@/store/game.module";
import chat from "@/store/chat.module";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    game,
    chat
  }
});
