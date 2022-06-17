import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import BX24 from './bitrix24-rest.js'//TODO: don't forget comment it!!!
import './bitrix24-complexBatch.js'
import store from './store'

Vue.config.productionTip = false

if(BX24 && typeof BX24.initAuth == "function") BX24.initAuth({
  client_id: "local.628df5b8f09c74.52146124",
  client_secret: "Kkxtpp6A2BOdo1CghL8j6U3QfE7phzZo4G670KDaU4WrddhaWY",
  access_token: "5c5c9462005ba40e003e858200000195000007ffddd31ec1dfb6d2cfcd864bae2939a1",
  domain: "crm.mywebstor.com",
  expires_in: 1653890139268,
  member_id: "5f7e43d175a5eb7df1558ddb4bf75221",
  refresh_token: "4cdbbb62005ba40e003e85820000019500000726737c12eebabd1fa1c6cdc4d250ac51",
});
BX24.init(()=>{
  new Vue({
    vuetify,
    store,
    render: h => h(App)
  }).$mount('#app')
})

