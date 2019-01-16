import "./pwa-compat";

import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";

import "./styles/quasar.styl";
import "quasar-framework/dist/quasar.ie.polyfills";
import "quasar-extras/animate";
import "quasar-extras/roboto-font";
import "quasar-extras/material-icons";
import "quasar-extras/fontawesome";
import "quasar-extras/ionicons";
import "quasar-extras/mdi";
import Quasar from "quasar";

import VueSocketIO from "vue-socket.io-extended";
import io from "socket.io-client";

import ApiService from "@/common/api.service";
import store from "@/store";
import router from "@/router";

ApiService.init();

Vue.use(Quasar, {
  config: {
    brand: {
      primary: "#368cbf",
      secondary: "#3d3d3f",
      tertiary: "#7ebc59"
    }
  }
});
const isProduction = process.env.NODE_ENV === "production";
const SocketInstance = isProduction ? io("/") : io("http://localhost:8001");

Vue.use(VueSocketIO, SocketInstance, { store });

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  if (!to.params.gameId && !to.params.gameId.length) {
    return next({ name: "GameHome" });
  }
  next();
});

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
