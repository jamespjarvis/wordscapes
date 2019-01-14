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

import ApiService from "@/common/api.service";

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

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
