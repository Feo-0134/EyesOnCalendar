// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import router from './router'
import Axios from 'axios'
import Vuex from 'vuex'
import AsyncComputed from 'vue-async-computed'
import state from './store.js'
import Popover from 'vue-js-popover'
import ElementUI from 'element-ui';
import App from './App'
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'

Vue.use(require('@websanova/vue-upload'));

Vue.use(Vuex);
Vue.use(AsyncComputed);
Vue.use(Popover);
Vue.use(ElementUI, { locale });

Vue.config.devtools = true;

Vue.config.productionTip = false;
Vue.prototype.$http = Axios;
Vue.prototype.$randomNumber = parseInt(Math.random() * 1000000);
Vue.prototype.$history = [];

/* eslint-disable no-new */
// you can just ignore the error message come up with eslint
// but they can help your code be tiny

Vue.component('modal', {
  template: '#modal-template',
  computed: {
    linkToCalendar() {
      return '/';
    },
  },
  methods: {
    backToCalendar() {
      this.$router.push('/');
    },
  },
});

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store: state,
});
