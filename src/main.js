import Vue from 'vue'
import App from './App.vue'
import Web3Plugin from './plugins/web3.js';
import './index.css'

Vue.config.productionTip = false;
Vue.use(Web3Plugin);

new Vue({
  render: h => h(App),
}).$mount('#app')
