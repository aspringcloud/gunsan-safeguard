import Vue from 'vue'
import Router from 'vue-router'
import Main from './components/main.vue'
import Login from './components/login.vue'
import Resetpw from './components/resetpw.vue'
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