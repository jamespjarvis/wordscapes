import Vue from "vue";
import Router from "vue-router";
import Game from "@/views/Game";
import { GameHome, GameChat } from "@/views/Game";

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "",
      component: Game,
      children: [
        {
          path: "/:gameId",
          component: GameHome,
          name: "GameHome",
          props: route => ({
            gameId: route.params.gameId
          })
        },
        {
          path: "/:gameId/chat",
          component: GameChat,
          name: "GameChat",
          props: route => ({ gameId: route.params.gameId })
        }
      ]
    }
  ]
});
