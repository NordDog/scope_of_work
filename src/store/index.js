//import { resolve } from 'core-js/fn/promise';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings:{},
    tags:[]
  },
  mutations: {
    SET_APP_SETTINGS(state, setings){
      state.setings = setings;
    },
    SET_TAGS(state, tags){
      state.tags = tags;
    }
  },
  actions: {
    async GET_APP_SETTINGS({commit}){
      let options =  new Promise(resolve=>{
        BX24.callMethod('app.option.get',{}, res=>{
          resolve(res.data());
        })
      });
      let tags = new Promise(resolve=>{
        BX24.callMethod('task.item.userfield.get', {ID: 804}, res=>(
          resolve(res.data().LIST)
        ))
      })

      Promise.all([options, tags]).then(results=>{
        let settings = results[0];
        if(!Object.keys(settings).includes('tags')) settings.tags = [];
        for(let item of results[1]){
          settings.tags.push({
            name
          })
        }
      })

    },
    SET_APP_SETTINGS({commit}, settings){
      commit('SET_APP_SETTINGS', settings)
    }
  },
  getters:{
    GET_TAGS(state){
      return state.tags;
    },
    GET_SETTINGS(state){
      return state.settings;
    }
  }
})
