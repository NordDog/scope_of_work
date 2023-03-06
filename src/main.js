import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
// import BX24 from './bitrix24-rest.js'//TODO: don't forget comment it!!!
import './bitrix24-complexBatch.js'
import store from './store'

Vue.config.productionTip = false

if(BX24 && typeof BX24.initAuth == "function") BX24.initAuth({
  client_id: "local.628df5b8f09c74.52146124",
  client_secret: "Kkxtpp6A2BOdo1CghL8j6U3QfE7phzZo4G670KDaU4WrddhaWY",

  access_token: "572ea963005ba40e003e858200000195000007e75d99eaa36d9d8ae5b4675988d56ee0",
  domain: "crm.mywebstor.com",
  expires_in: 1672031832732,
  member_id: "5f7e43d175a5eb7df1558ddb4bf75221",
  refresh_token: "47add063005ba40e003e85820000019500000760eff220205874ab99870de3406759a6",

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

