import Vue from 'vue'
import Vuex from 'vuex'
import moment from "moment";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings:{},
    selected: [],
    usersAndDepts: [],
    rawTasks:[],
    tasksParents:[],
    deals: [],
    loadingDialog: false,
    loadingText: '',
    weeks: [],
    timeRange: {},
    result: {},
    currtask: {},
    isResp: true
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
    TOGGLE_LOADING(state, val){
      state.loadingDialog = val;
    },
    SET_LOADING_TEXT(state, text){
      state.loadingText = text;
    },
    SET_WEEKS(state, weeks){
      state.weeks = weeks;
    },
    SET_TIME_RANGE(state, range){
      state.timeRange = range;
    },
    SET_RESULT(state, result){
      state.result = result;
    },
    RESET_DEALS(state){
      state.deals = [];
    },
    SET_CURRTASK_DATA(state, value){
      state.currtask = value;
    },
    SET_IS_RESP(state, value){
      state.isResp = value;
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
        BX24.callMethod('task.item.userfield.get', {ID: 804}, res=>(//TODO: вот это для маркета заменить на тэг
          resolve(res.data().LIST)
        ))
      })

      Promise.all([options, tags]).then(results=>{
        let settings = results[0].scopeOfWork ? results[0].scopeOfWork : '', tagsIds = [];
        if(settings.length == 0){
          settings = {
            hInWeek: 30,
            taskHeader: 'group',
            setHeaderFromMainTask: true,
            useTaskUnderReview: false
          }
        } else {
          settings.setHeaderFromMainTask = settings.setHeaderFromMainTask === 'true';
          settings.useTaskUnderReview = settings.useTaskUnderReview === 'true';
        }
        if(!Object.keys(settings).includes('tags')) settings.tags = [];
        else {
          tagsIds = settings.tags.map(tag=> {return tag.value});
          for(let t in settings.tags){
            settings.tags[t].darkMode = settings.tags[t].darkMode === 'true';
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
      commit('SET_LOADING_TEXT', 'Получаем данные пользователя');
      commit('TOGGLE_LOADING', true);
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
          let selected = [];
          if(res.data().selected && res.data().selected.length > 5) {
            selected = JSON.parse((res.data().selected));
          }
          commit('SET_SELECTED', selected)
          resolve(selected)
        })
      });
      let timeRange = new Promise(resolve=>{
        let dateStart = moment().startOf("week").add(1, "d"),
        dateEnd = moment().startOf("week").add(28, "d"),
        startString = dateStart.format("DD.MM.YYYY"),
        endString = dateEnd.format("DD.MM.YYYY");

        dispatch('GET_WEEKS', dateStart);
        commit('SET_TIME_RANGE', { start: startString, end: endString })
        resolve({ start: startString, end: endString });
      })
      Promise.all([users, depts, userOptions, timeRange]).then(res=>{
        let deptsAndUsers = [];
        for(let user of res[0]){
          deptsAndUsers.push({name: user.NAME+' '+user.LAST_NAME, id: user.ID, type: 'user', dept: user.UF_DEPARTMENT, isResponsible: true});
        }
        for(let dept of res[1]){
          deptsAndUsers.push({name: dept.NAME, id: dept.ID, type: 'dept'});
        }
        commit('SET_USERS_AND_DEPTS', deptsAndUsers)
      }).finally(()=>{
        if(this.$app.info.placement == 'TASK_VIEW_TAB')
          dispatch('GET_CURRTASK_DATA');
        else
          dispatch('GET_USERS_TASKS');
      });
    },
    /**
     * если приложение открыто в задаче, получаем данные из задачи
     */
    async GET_CURRTASK_DATA({commit, dispatch, state}){
      BX24.callMethod(
        'tasks.task.get', 
        { 
          taskId: this.$app.info.options.taskId, 
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
            'UF_CRM_TASK',
            'STATUS',
            'STATUS_COMPLETE'
          ]
        }, 
        res=>{
          let currtask = res.data().task;
          currtask.currtask = true;
          commit('SET_CURRTASK_DATA', currtask);
          let resp = state.usersAndDepts.find(item=>item.id == currtask.responsibleId && item.type == 'user');
          commit('SET_SELECTED', [resp]);
          dispatch('GET_USERS_TASKS');
        }
      );
    },
    /**
     * тут забираем либо все задачи, либо только задачи выбранных юзеров
     */
    GET_USERS_TASKS({state, dispatch, commit}){
      commit('TOGGLE_LOADING', true);
      commit('RESET_DEALS');
      commit('SET_LOADING_TEXT', 'Получаем задачи');
      let 
      parents = [],
      deals = [],
      tasks = [],
      taskFilter = {'REAL_STATUS': ['1', '2', '3'], '>TIME_ESTIMATE': 0},
      task1Filter = {'REAL_STATUS': ['1', '2', '3'], '>TIME_ESTIMATE': 0};
      if(state.settings.useTaskUnderReview){
        taskFilter.STATUS.push('4');
        task1Filter.STATUS.push('4');
      }
      //taskFilter['>DEADLINE'] = state.timeRange.start;
      taskFilter['<DEADLINE'] = state.timeRange.end;
      task1Filter.DEADLINE = '';
      if(state.selected.length > 0){
        if(state.isResp){
          for(let item of state.selected){
            if(item.type == 'user'){
              if(taskFilter.RESPONSIBLE_ID){
                taskFilter.RESPONSIBLE_ID.push(item.id)
                task1Filter.RESPONSIBLE_ID.push(item.id)
              } else {
                taskFilter.RESPONSIBLE_ID = [item.id]
                task1Filter.RESPONSIBLE_ID = [item.id]
              }
            }
            else if(item.type == 'dept'){
              for(let elem of state.usersAndDepts){
                if(elem.type == 'user' && elem.dept.includes(Number(item.id))) {
                  if(taskFilter.RESPONSIBLE_ID){
                    taskFilter.RESPONSIBLE_ID.push(elem.id)
                    task1Filter.RESPONSIBLE_ID.push(elem.id)
                  } else {
                    taskFilter.RESPONSIBLE_ID = [elem.id]
                    task1Filter.RESPONSIBLE_ID = [elem.id]
                  }
                } 
              }
            }
          }
        } else {
          for(let item of state.selected){
            if(item.type == 'user'){
              if(taskFilter.CREATED_BY){
                taskFilter.CREATED_BY.push(item.id)
                task1Filter.CREATED_BY.push(item.id)
              } else {
                taskFilter.CREATED_BY = [item.id]
                task1Filter.CREATED_BY = [item.id]
              }
            }
            else if(item.type == 'dept'){
              for(let elem of state.usersAndDepts){
                if(elem.type == 'user' && elem.dept.includes(Number(item.id))) {
                  if(taskFilter.CREATED_BY){
                    taskFilter.CREATED_BY.push(elem.id)
                    task1Filter.CREATED_BY.push(elem.id)
                  } else {
                    taskFilter.CREATED_BY = [elem.id]
                    task1Filter.CREATED_BY = [elem.id]
                  }
                } 
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
                'UF_CRM_TASK',
                'STATUS',
                'STATUS_COMPLETE'
              ], 
              order: { DEADLINE: "asc" }
            }
          ],
          tasks1: ["tasks.task.list",
            {
              filter: task1Filter, 
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
                'UF_CRM_TASK',
                'STATUS',
                'STATUS_COMPLETE'
              ], 
              order: { DEADLINE: "asc" }
            }
          ]
          },res => {
          let ans;

          for (let i = 0; (ans = res["tasks_" + i]); i++) {
            ans = ans.data().tasks;
            for(let task of ans){
              if(task.parentId && !parents.includes(task.parentId) && task.parentId != 0) parents.push(task.parentId);
              if(task.ufCrmTask && task.ufCrmTask.length > 0) deals.push(...task.ufCrmTask.filter(entity=>entity.split('_')[0] == 'D'));
            }
            tasks.push(...ans);
          }
          for (let i = 0; (ans = res["tasks1_" + i]); i++) {
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
     * собираем недели
     */
    GET_WEEKS({commit}, start){
      let weeks = [];
      weeks.push({
        start: start.format("YYYY-MM-DD"),
        end: start.add(6, "d").format("YYYY-MM-DD"),
      });
      weeks.push({
        start: start.add(1, "d").format("YYYY-MM-DD"),
        end: start.add(6, "d").format("YYYY-MM-DD"),
      });
      weeks.push({
        start: start.add(1, "d").format("YYYY-MM-DD"),
        end: start.add(6, "d").format("YYYY-MM-DD"),
      });
      weeks.push({
        start: start.add(1, "d").format("YYYY-MM-DD"),
        end: start.add(6, "d").format("YYYY-MM-DD"),
      });
      commit('SET_WEEKS', weeks);
    },
    /**
     * тут забираем родительские задачи
     */
    GET_PARENTS({dispatch, commit},parents){
      commit('SET_LOADING_TEXT', 'Получаем родительские задачи');
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
      commit('SET_LOADING_TEXT', 'Получаем связанные сделки');
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
    DO_MAGIC({state, commit}){
      commit('SET_LOADING_TEXT', 'Творим некоторую магию');
      let 
      tasks = state.rawTasks,
      parents = state.tasksParents,
      deals = state.deals,
      result = {};
      for(let task of tasks){
        if(task.parentId > 0){
          task.parentTask = parents.filter(parent=>parent.id == task.parentId)[0];
        }
        //добавляем в задачу родителя и сделку
        if((task.ufCrmTask && task.ufCrmTask.length > 0) || (task.parentId > 0 && task.parentTask.ufCrmTask && task.parentTask.ufCrmTask.length > 0)){
          let taskDeal = 0, parentTaskDeal = 0;
          if(task.ufCrmTask){
            taskDeal = task.ufCrmTask.filter(entity=>entity.split('_')[0] == 'D').map(item=>item.split('_')[1])[0];
            task.deal = deals.filter(d=>d.ID == taskDeal)[0]; 
          }
          if(task.parentId > 0 && task.parentTask.ufCrmTask){
            parentTaskDeal = task.parentTask.ufCrmTask.filter(entity=>entity.split('_')[0] == 'D').map(item=>item.split('_')[1])[0];
            task.parentTask.deal = deals.filter(d=>d.ID == parentTaskDeal)[0];
          }
        }
        //TODO:добавляем неделю или ставим в очередь
        if (task.timeEstimate == 0 || !task.deadline) task.weekNum = 'queue';
        else if(moment(task.deadline).isSameOrBefore(moment(state.timeRange.start.split('.').reverse().join('-') + "T00:00:00"))) task.weekNum = 'overdue';
        else{
          for(let i in state.weeks){
            if (
              moment(task.deadline).isSameOrAfter(moment(state.weeks[i].start + "T00:00:00"))
              && moment(task.deadline).isSameOrBefore(moment(state.weeks[i].end + "T23:59:59"))
            ) {
              task.weekNum = i;
            }
          }
        }
        //раскидываем по пользователям
        if(result[task.responsibleId]){
          result[task.responsibleId].tasks.push(task);
        } else {
          result[task.responsibleId] = {
            tasks: [task],
            userData: {
              id: task.responsibleId,
              name: task.responsible.name
            }
          }
        }
      }
      commit('SET_RESULT', result);
      commit('TOGGLE_LOADING', false);
    },
    /**
     * устанавливаем выбранных пользователей/департаменты и запрашиваем их из б24
     */
    SET_SELECTED({commit}, selected){
      commit('SET_SELECTED', selected);
    },
    SET_IS_RESP({commit}, value){
      commit('SET_IS_RESP', value);
    }
  },
  getters:{
    GET_SETTINGS(state){
      return state.settings;
    },
    GET_HOURS(state){
      return state.settings.hInWeek;
    },
    GET_LOADING_DIALOG(state){
      return state.loadingDialog;
    },
    GET_LOADING_TEXT(state){
      return state.loadingText;
    },
    GET_WEEKS(state){
      return state.weeks;
    },
    GET_RESULT(state){
      return state.result;
    },
    GET_DEPTS_AND_USERS(state){
      return state.usersAndDepts;
    },
    GET_SELECTED(state){
      return state.selected;
    },
    GET_CURR_TASK(state){
      return state.currtask;
    },
    GET_SELECTED_USERS(state){
      let result = [];
      for(let item of state.selected){
        if(item.type == 'user'){
          result.push(item)
        } else if(item.type == 'dept') {
          result.push(...state.usersAndDepts.filter(elem=>{return elem.type == 'user' && (elem.dept && elem.dept.includes(+item.id))}));
        }
      }
      return result;
    },
    GET_IS_RESP(state){
      return state.isResp;
    }
  }
})
