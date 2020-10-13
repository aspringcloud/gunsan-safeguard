import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'
import axios from "axios";

import "@/assets/css/mainStyle.css";

const VueCookie = require('vue-cookie');

var options = {
  persist: true
}

Vue.use(VueCookie);
Vue.use(VueSession, options)
Vue.config.productionTip = false
Vue.prototype.$http = axios;

// 분리 필요
Vue.prototype.$api = "https://gunsanapi.tasio.io:300/api/"
// Vue.prototype.$api = "https://test.aspringcloud.com/api/"
Vue.prototype.$headers = {
  accept: "application/json",
  authorization: "",
  "Content-Type": "application/json"
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')