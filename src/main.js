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

  access_token: "b559e262005ba40e003e8582000001950000079a7cf406d79dcef38e2b106c5d3d0eb2",
  domain: "crm.mywebstor.com",
  expires_in: 1659001268002,
  member_id: "5f7e43d175a5eb7df1558ddb4bf75221",
  refresh_token: "a5d80963005ba40e003e85820000019500000769616490b0cf6d0b2929d9abf07237f4",

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

