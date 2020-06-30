import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/main.vue'
import MainM from './views/mainM.vue'
import Login from './views/login.vue'
import Resetpw from './views/resetpw.vue'
Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [{
            path: '/',
            name: 'Main',
            components: {
                default: Main,
                mobile: MainM
            }
        },
        {
            path: '/login',
            name: 'Login',
            components: {
                default: Login,
                mobile: Login,
            }
        },
        {
            path: '/resetpw',
            name: 'Resetpw',
            components: {
                default: Resetpw,
                mobile: Resetpw,
            }
        },


    ]
})