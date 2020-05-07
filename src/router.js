import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/main.vue'
import Login from './views/login.vue'
import Resetpw from './views/resetpw.vue'
Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [{
            path: '/',
            name: 'Main',
            component: Main,
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
        },
        {
            path: '/resetpw',
            name: 'Resetpw',
            component: Resetpw,
        }
    ]
})