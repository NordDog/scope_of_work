/*
        getTasks() {
          let 
          taskFilter = {
            'STATUS': ['1', '2', '3'],
          },
          userFilter = {
            'USER_TYPE':'employee', 
            'ACTIVE': true
          };
          this.getTimeRange();
          if(this.selected.length > 0){
            userFilter.ID = [];
            for(let item of this.selected){
              if(item.type == 'user'){
                if(taskFilter.RESPONSIBLE_ID) taskFilter.RESPONSIBLE_ID.push(item.id)
                else taskFilter.RESPONSIBLE_ID = [item.id]
                userFilter.ID.push(item.id);
              }
              else if(item.type == 'dept'){
                for(let elem of this.deptsAndUsers){
                  if(elem.type == 'user' && elem.dept == item.id) {
                    if(taskFilter.RESPONSIBLE_ID) taskFilter.RESPONSIBLE_ID.push(item.id)
                    else taskFilter.RESPONSIBLE_ID = [item.id]
                    userFilter.ID.push(elem.id);
                  } 
                }
              }
            }
          }
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
                    'PARENT_ID'
                  ], 
                  order: { DEADLINE: "asc" }
                }
              ],
              users: ['user.get', {filter:userFilter}],
              depts: ['department.get', {}],
              task_types: ['task.item.userfield.get', {'ID': 804}], 
            },res => {
              let 
                tasks = [], 
                resusers = [],
                secans, 
                ans, 
                parents = [];
              for (let i = 0; (ans = res["users_" + i], secans = res["depts_"+i]); i++) {
                resusers.push(...ans.data())
                if(this.deptsAndUsers.length == 0) {
                  for(let user of ans.data()){
                    this.deptsAndUsers.push({name: user.NAME+' '+user.LAST_NAME, id: user.ID, type: 'user', dept: user.UF_DEPARTMENT});
                  }
                  for(let dept of secans.data()){
                    this.deptsAndUsers.push({name: dept.NAME, id: dept.ID, type: 'dept'});
                  }
                }
              }
              for (let i = 0; (ans = res["tasks_" + i]); i++) {
                ans = ans.data().tasks;
                for(let task of ans){
                  if(task.parentId && !parents.includes(task.parentId) && task.parentId != 0) parents.push(task.parentId);
                }
                tasks.push(...ans);
              }
          if(parents.length){
            this.getParentTasks(parents)
          }
              for(let item of res.task_types_0.data().LIST){
                this.$set(this.taskTypes, item.ID, item.VALUE);
              }
              // 
              BX24.callMethod('user.option.get',{},res=>{
                let answer = res.data();
                if(answer.selected.length > 5 && this.selected.length == 0) {
                  this.selected = JSON.parse(answer.selected);
                  this.getTasks();
                }
                else this.parseTasks(tasks, resusers);
              })
            }
          );
        },
        parseTasks(tasks, users) {
          let res = {}, taskIDs = [];
          for (let user of users) {
            res[user.ID]= {
              userData: {
                name: user.NAME+' '+user.LAST_NAME,
                id: user.ID,
              },
              tasks: [],
            }
            taskIDs = [];
            for(let weekCounter in this.weeks){
              for(let task of tasks){
                this.$set(task, 'type', this.taskTypes[Number(task.ufTaskType)])
                if(task.responsibleId != user.ID) continue;
                if(task.timeEstimate == 0 || !task.deadline){
                  if(taskIDs.includes(task.id)) continue;
                  task.weekNum = 'queue';
                  res[task.responsibleId].tasks.push(task);
                  taskIDs.push(task.id);
                  continue;
                }
                if (
                  moment(task.deadline).isSameOrAfter(moment(this.weeks[weekCounter].start + "T00:00:00"))
                  && moment(task.deadline).isSameOrBefore(moment(this.weeks[weekCounter].end + "T23:59:59"))
                ) {
                  task.weekNum = weekCounter;
                  res[task.responsibleId].tasks.push(task);
                }
              }
            }
          }
          this.tasks = res;
        },
        getTimeRange() {
          let dateStart = moment().startOf("week").add(1, "d"),
            dateEnd = moment().startOf("week").add(28, "d"),
            startString = dateStart.format("D.MM.YYYY"),
            endString = dateEnd.format("D.MM.YYYY");

          this.getWeeks(dateStart);
          return { start: startString, end: endString };
        },
        getWeeks(start) {
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
          this.weeks = weeks;
        },
        getParentTasks(parents){
          BX24.complexBatch({tasks: ["tasks.task.list",{filter: {ID: parents}, select:['NAME', 'GROUP_ID','TITLE']}]}, res=>{
            let 
              tasks = [],
              ans;
            for (let i = 0; (ans = res["tasks_" + i]); i++) {
              ans = ans.data().tasks;
              tasks.push(...ans);
            }
          });
        }
      */