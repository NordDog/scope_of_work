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

  access_token: "d5f34763005ba40e003e85820000044a0000071229c3ef24c1124275946e7d96a6201e",
  domain: "crm.mywebstor.com",
  expires_in: 1665659862456,
  member_id: "5f7e43d175a5eb7df1558ddb4bf75221",
  refresh_token: "c5726f63005ba40e003e85820000044a000007fcf300dfa5863ae196edfba73a10146c",

  // placement: "TASK_VIEW_TAB",
  // placement_options: {
  //   ID: 9454//75950
  // }
});
BX24.init(()=>{
  var i = BX24.placement.info();
  BX24.callMethod('profile',{},async user=>{
    const app = new Vue({
      data(){
        return{
          userID:user.answer.result.ID,
          isAdmin:user.answer.result.ADMIN,
          info: i,
        }
      },
      vuetify,
      store,
      render: h => h(App)
    });
    store.$app = app;
    app.$mount('#app');
  });
})

