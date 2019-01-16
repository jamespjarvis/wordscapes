import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home.vue";

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/:gameId?",
      name: "home",
      component: Home,
      props: route => ({ gameId: route.params.gameId })
    }
  ]
});
