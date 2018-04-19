import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import Vuex from 'vuex';
import App from './App.vue';

import socket from './socket';
import store from './store';

Vue.use(VueRouter);
Vue.use(Vuetify);
Vue.use(Vuex);

const router =  new VueRouter({
  mode: 'history',
  routes: [
    {path: '/room/:roomId', component: App},
  ],
});

const app = new Vue({
  el: '#app',
  store,
  router,
});

socket.on('log', (log: Log) => {
  store.commit('appendLogBuffer', log);
});
