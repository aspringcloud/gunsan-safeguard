import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'

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

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')