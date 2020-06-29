import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'
import axios from "axios";

import "@/assets/css/mainStyle.css";

// import io from 'socket.io-client';
// const socket = io('ws://115.93.143.2:9104/ws/vehicle');

// Vue.prototype.$socket = socket;

const VueCookie = require('vue-cookie');

var options = {
  persist: true
}

Vue.use(VueCookie);
Vue.use(VueSession, options)
Vue.config.productionTip = false
Vue.prototype.$http = axios;

// 분리 필요
Vue.prototype.$api = "http://115.93.143.2:9103/api/"
Vue.prototype.$headers = {
  accept: "application/json",
  authorization: "",
  "Content-Type": "application/json"
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')