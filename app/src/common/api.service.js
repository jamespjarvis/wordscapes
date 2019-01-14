import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";

const ApiService = {
  init() {
    Vue.use(VueAxios, axios);
    Vue.axios.defaults.baseURL = "/api";
  },
  get(resource) {
    return Vue.axios.get(`${resource}`).catch(error => {
      throw new Error(`[WORDSCAPES] ApiService ${error}`);
    });
  },
  post(resource, params) {
    return Vue.axios.post(`${resource}`, params).catch(error => {
      throw new Error(`[WORDSCAPES] ApiService ${error}`);
    });
  }
};

export default ApiService;
