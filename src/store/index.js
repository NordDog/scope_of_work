import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings:{},
    selected: [],
    usersAndDepts: [],
    rawTasks:[],
    tasksParents:[],
    deals: [],
    loading: false
  },
  mutations: {
    SET_APP_SETTINGS(state, settings){
      state.settings = settings;
    },
    SET_SELECTED(state, selected){
      state.selected = selected;
    },
    SET_USERS_AND_DEPTS(state, usersAndDepts){
      state.usersAndDepts = usersAndDepts;
    },
    SET_TASKS(state, tasks){
      state.rawTasks = tasks;
    },
    SET_PARENTS(state, parents){
      state.tasksParents = parents;
    },
    SET_DEALS(state, deals){
      state.deals = deals
    },
    ADD_DEALS(state, deals){
      state.deals.push(...deals)
    },
    TOGGLE_LOADING(state){
      state.loading = !state.loading
    }
  },
  actions: {
    /**
     * получаем настройки приложения из битрикса
     */
    async GET_APP_SETTINGS({commit}){
      let options = new Promise(resolve=>{
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
        let settings = results[0].scopeOfWork ? results[0].scopeOfWork : '', tagsIds = [];
        if(settings.length == 0){
          settings = {
            hInWeek: 30,
            taskHeader: 'group',
            setHeaderFromMainTask: true
          }
        }
        if(!Object.keys(settings).includes('tags')) settings.tags = [];
        else {
          tagsIds = settings.tags.map(tag=> {return tag.value});
          for(let t in settings.tags){
            settings.tags[t].darkMode = Boolean(settings.tags[t].darkMode);
          }
        }
        for(let item of results[1]){
          if(tagsIds.includes(item.ID)) continue;
          settings.tags.push({
            name: item.VALUE,
            value: item.ID,
            color: '',
            darkMode: true
          })
        }
        commit('SET_APP_SETTINGS', settings);
      })

    },
    /**
     * обновляем настройки приложения в приложении
     */
    SET_APP_SETTINGS({commit}, settings){
      commit('SET_APP_SETTINGS', settings);
    },
    /**
     * кидаем настройки приложения в портал
     */
    PUSH_SETTINGS(){
      BX24.callMethod('app.option.set', {scopeOfWork:this.state.settings});
    },
    /**
     * забираем пользователей, департаменты и пользовательские настройки
     */
    async GET_FIRSTDATE({commit, dispatch,}){
      console.log('let us do some magical stuff...');
      commit('TOGGLE_LOADING');
      let users = new Promise(resolve=>{
        BX24.callMethod('user.get', {'USER_TYPE':'employee', 'ACTIVE': true}, res=>{
          resolve(res.data());
        })
      });
      let depts = new Promise(resolve=>{
        BX24.callMethod('department.get', {}, res=>{
          resolve(res.data());
        })
      });
      let userOptions = new Promise(resolve=>{
        BX24.callMethod('user.option.get', {}, res=>{
          if(res.data().selected.length > 5) {
            let selected = JSON.parse((res.data().selected));
            commit('SET_SELECTED', selected)
            resolve(selected)
          }
        })
      });
      Promise.all([users, depts, userOptions]).then(res=>{
        let deptsAndUsers = [];
        for(let user of res[0]){
          deptsAndUsers.push({name: user.NAME+' '+user.LAST_NAME, id: user.ID, type: 'user', dept: user.UF_DEPARTMENT});
        }
        for(let dept of res[1]){
          deptsAndUsers.push({name: dept.NAME, id: dept.ID, type: 'dept'});
        }
        commit('SET_USERS_AND_DEPTS', deptsAndUsers)
      }).finally(()=>{
        dispatch('GET_USERS_TASKS');
      });
    },
    /**
     * тут забираем либо все задачи, либо только задачи выбранных юзеров
     */
    GET_USERS_TASKS({state, dispatch, commit}){
      let 
      parents = [],
      deals = [],
      tasks = [],
      taskFilter = {'STATUS': ['1', '2', '3']};
      if(state.selected.length > 0){
        let selectedUsers = [];
        for(let item of state.selected){
          if(item.type == 'user'){
            if(taskFilter.RESPONSIBLE_ID) taskFilter.RESPONSIBLE_ID.push(item.id)
            else taskFilter.RESPONSIBLE_ID = [item.id]
            selectedUsers.push(item.id);
          }
          else if(item.type == 'dept'){
            for(let elem of state.usersAndDepts){
              if(elem.type == 'user' && elem.dept == item.id) {
                if(taskFilter.RESPONSIBLE_ID) taskFilter.RESPONSIBLE_ID.push(item.id)
                else taskFilter.RESPONSIBLE_ID = [item.id]
                selectedUsers.push(elem.id);
              } 
            }
          }
        }
      }
      let alltasks = new Promise(resolve=>{
        BX24.complexBatch({
          tasks: ["tasks.task.list",
            {
              filter: taskFilter, 
              select: [
                'REAL_STATUS', 
                'UF_TASK_TYPE', 
                'RESPONSIBLE_ID', 
                'TIME_ESTIMATE', 
                'NAME', 
                'GROUP_ID',
                'TITLE',
                'TIME_SPENT_IN_LOGS',
                'CREATED_BY',
                'DEADLINE',
                'PARENT_ID',
                'UF_CRM_TASK'
              ], 
              order: { DEADLINE: "asc" }
            }
          ]
          },res => {
          let 
            ans;
          for (let i = 0; (ans = res["tasks_" + i]); i++) {
            ans = ans.data().tasks;
            for(let task of ans){
              if(task.parentId && !parents.includes(task.parentId) && task.parentId != 0) parents.push(task.parentId);
              if(task.ufCrmTask && task.ufCrmTask.length > 0) deals.push(...task.ufCrmTask.filter(entity=>entity.split('_')[0] == 'D'));
            }
            tasks.push(...ans);
          }
          resolve({tasks:tasks, parents: parents});
        })
      })
      alltasks.then(()=>{
        commit('ADD_DEALS', deals);
        commit('SET_TASKS', tasks);
        if(parents.length > 0) dispatch('GET_PARENTS', parents);
        else dispatch('GET_DEALS');
      })
    },
    /**
     * тут забираем родительские задачи
     */
    GET_PARENTS({dispatch, commit},parents){
      let tasks = [], deals = [],
      alltasks = new Promise(resolve=>{
        BX24.complexBatch({
          tasks: ["tasks.task.list",
            {
              filter: {ID: parents}, 
              select: [
                'NAME', 
                'GROUP_ID',
                'TITLE',
                'UF_CRM_TASK'
              ],
            }
          ]
          },res => {
          let 
            ans;
          for (let i = 0; (ans = res["tasks_" + i]); i++) {
            ans = ans.data().tasks;
            for(let task of ans){
              if(task.ufCrmTask && task.ufCrmTask.length > 0) deals.push(...task.ufCrmTask.filter(entity=>entity.split('_')[0] == 'D'));
            }
            tasks.push(...ans);
          }
          resolve(tasks);
        })
      })
      alltasks.then(()=>{
        commit('ADD_DEALS', deals);
        commit('SET_PARENTS', tasks);
        dispatch('GET_DEALS');
      })
    },
    /**
     * тут забираем сделки, связанные с задачами
     */
    GET_DEALS({state, commit, dispatch}){
      let dealIds = [];
      for(let deal of state.deals){
        dealIds.push(deal.split('_')[1]);
      }
      let deals = [],
      alltasks = new Promise(resolve=>{
        BX24.complexBatch({
          tasks: ["crm.deal.list",
            {
              filter: {ID: dealIds}, 
              select: [
                'TITLE',
                'ID'
              ],
            }
          ]
          },res => {
          let 
            ans;
          for (let i = 0; (ans = res["tasks_" + i]); i++) {
            ans = ans.data();
            deals.push(...ans);
          }
          resolve(deals);
        })
      })
      alltasks.then(()=>{
        commit('SET_DEALS', deals);
        dispatch('DO_MAGIC')
      })
    },
    /**
     * тут собираем всё это во что-то
     */
    DO_MAGIC({state}){
      console.log('let us do some magical stuff...');
    }
  },
  getters:{
    GET_SETTINGS(state){
      return state.settings;
    },
    GET_HOURS(state){
      return state.settings.hInWeek;
    }
  }
})
