<template>
  <div v-if="tasks" class="mr-5">
    <v-card>
      <v-card-title class="pl-6 py-1 mb-2 card-header">{{ user.name }}</v-card-title>
      <v-card-text class="text-center pb-2 px-2 mb-5" style="display: flex;">
        <div class="weekbox" v-if="$root.info.placement != 'TASK_VIEW_TAB'">
          <div class="drop-zone" @drop="onDrop($event, 'queue')" @dragover.prevent @dragenter.prevent>
            <div class="queue">
              <p class="queuetitle">В очереди</p>
            </div>
            <div 
              v-for="task in queue" :key="task.id" 
              @dragstart="startDrag($event, task)"
              draggable 
              class="ma-3"
            >
              <task_card :task=task />
            </div>
          </div>
        </div>
        <div v-if="overdue.length" class="weekbox">
          <div class="drop-zone">
            <div class="overdue">
              <p class="queuetitle">Просроченные</p>
            </div>
            <div 
              v-for="task in overdue" :key="task.id" 
              @dragstart="startDrag($event, task)"
              draggable 
              class="ma-3"
            >
              <task_card :task=task />
            </div>
          </div>
        </div>
        <div v-for="(week, week_index) in weeks" :key="week_index" class="weekbox">
          <div class="drop-zone" @drop="onDrop($event, week_index)" @dragover.prevent @dragenter.prevent @dblclick="addCurrTask(week_index)">
            <div class="weekheader" :style="weekcolors[week_index]">
              <div style="display: flex; position: relative;">
                <p class="weektitle">Неделя {{ week_index + 1 }}</p>
                <p class="weekStartEnd">{{ week.start|dateToLocal }} - {{ week.end|dateToLocal }}</p>
                <div class="workdadys" v-if="week_index === 0">
                  <div class="circle" v-for="day in weekdays" :key="day" :class="day <= today ? 'past': ''"></div>
                </div>
              </div>
              <div style="display: flex;margin-top: 3px;">
                <div style="width: 70%; border: 1px solid #949494; border-radius: 7px;">
                  <v-progress-linear
                    v-if="week_index == 0"
                    height="15"
                    rounded 
                    :value="(taskWeeks.hours[week_index] * 100 / hoursLeft).toFixed(1)" 
                    :color="+taskWeeks.hours[week_index] > +hoursLeft ? '#d22e4d' : '#52ac62'"
                    background-color="white"
                  >
                    <template v-slot:default>
                      <span class="progress_text">{{taskWeeks.hours[week_index]}}ч/{{hoursLeft}}ч</span>
                    </template>
                  </v-progress-linear>
                  <v-progress-linear
                    height="15"
                    v-else
                    rounded 
                    :value="(taskWeeks.hours[week_index] * 100 / hoursInWeek).toFixed(1)" 
                    :color="+taskWeeks.hours[week_index] > +hoursInWeek ? '#d22e4d' : '#52ac62'"
                    background-color="white"
                  >
                    <template v-slot:default>
                      <span class="progress_text">{{taskWeeks.hours[week_index]}}ч/{{hoursInWeek}}ч</span>
                    </template>
                  </v-progress-linear>
                </div>
              </div>
            </div>
            <div 
              style="border-radius: 25px; margin: 15px; z-index: 10;"
              v-for="task in taskWeeks.tasks[week_index]"
              @dragstart="startDrag($event, task)"
              :key="task.id" 
              draggable 
            >
              <task_card :task=task />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="dialog"
      width="340"
    >
      <v-card>
        <v-card-title class="calendar-header">
          <p class="calendar-header-text">Укажите новый дедлайн</p>
        </v-card-title>
        <v-card-text>
        <v-row justify="center" class="mt-9">
          <v-date-picker 
            v-model="date"
            locale="ru-RU"
            first-day-of-week="1"
            :min="minDate"
            :max="maxDate"
            no-title
          >
          <v-row justify="center">
            <div style="width:290px;"  class="time-block d-flex">
              <v-col cols="5" class="pl-0 pr-1 d-flex align-center">
                <!-- <v-icon @click="timeControl(+hours - 1, true)">mdi-chevron-left</v-icon> -->
                <v-text-field style="text-align-last: center;" type="number" v-model="hours" outlined dense hide-details @input="timeControl($event, true)"></v-text-field>
                <!-- <v-icon @click="timeControl(+hours + 1, true)">mdi-chevron-right</v-icon> -->
              </v-col>
              <v-col cols="5" class="pr-0 pl-1 d-flex align-center">
                <!-- <v-icon @click="timeControl(+minutes - 1)">mdi-chevron-left</v-icon> -->
                <v-text-field style="text-align-last: center;" type="number" v-model="minutes" outlined dense hide-details  @input="timeControl($event)"></v-text-field>
                <!-- <v-icon @click="timeControl(+minutes + 1)">mdi-chevron-right</v-icon> -->
              </v-col>
            </div>
          </v-row>
          </v-date-picker>
        </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="text-xs-center px-0">
          <v-spacer></v-spacer>
          <div style="width:290px;">
            <v-btn
              color="primary"
              text
              @click="saveDeadline()"
            >
              принять
            </v-btn>
            <v-btn
              color="red"
              text
              @click="decline()"
            >
              отменить
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import moment from "moment";
  import {mapGetters} from 'vuex';
  import task_card from './task_card.vue';
  export default {
    name: 'user_card',
    components:{
      task_card
    },
    data: ()=>({
      dialog: false,
      currtask: '',
      prevDeadline:'',
      prevWeek:'',
      date:'',
      hours:'18',
      today: moment().day(),
      minutes:'00',
      maxDate:'',
      minDate:'',
      weekcolors:[
        'background-color: #97c89a',
        'background-color: #93cac4',
        'background-color: #8691c8',
        'background-color: #9786bd',
      ],
      weekdays: [1,2,3,4,5],
      xTasks:[]
      //hoursInWeek: 30,
    }),
    props:{
      user: Object,
      tasks: Object,
      weeks: Array
    },
    methods:{
      countHours(val){
        return (val/30).toFixed(3) * 100;
      },
      startDrag (evt, item) {
        evt.dataTransfer.dropEffect = 'move'
        evt.dataTransfer.effectAllowed = 'move'
        evt.dataTransfer.setData('itemID', item.id)
      },
      onDrop (evt, list) {
        const itemID = evt.dataTransfer.getData('itemID');
        const item = this.tasks.tasks.find(item => item.id == itemID);
        const itemIndex = this.tasks.tasks.findIndex(item => item.id == itemID);
        if(list != 'queue'){
          this.currtask = item;
          this.prevDeadline = item.deadline;
          this.prevWeek = item.weekNum;
          this.dialog = true;
          this.maxDate = this.weeks[list].end;
          this.minDate = this.weeks[list].start;
          this.date = this.weeks[list].start;
          item.weekNum = list;
        }
        else if(list == 'queue'){    
          BX24.callMethod(
            'tasks.task.update', 
            {taskId: itemID, fields: {DEADLINE: ''}}, 
            res=>{
              if(res.error())
                alert(res.error());
              else
              {
                item.deadline = 0;
                item.weekNum = list;
                this.tasks.tasks[itemIndex] = item;
        this.$set(this.tasks, 're', !this.tasks.re);
        this.$delete(this.tasks, 're');
              }
            }
          );
        }
      },
      decline(){
        const itemID = this.currtask.id;
        const item = this.tasks.tasks.find(item => item.id == itemID);
        item.weekNum = this.prevWeek;
        let currtask = this.$store.getters.GET_CURR_TASK;

        this.tasks.tasks = this.tasks.tasks.filter(item=>item.id != currtask.id || !item.currtask);
        this.dialog = false;
        this.currtask = '',
        this.prevDeadline = '',
        this.prevWeek = '',
        this.date = '',
        this.time = '',
        this.maxDate = '',
        this.minDate = '';
        this.$set(this.tasks, 're', !this.tasks.re);
        this.$delete(this.tasks, 're');
      },
      saveDeadline(){
        BX24.callMethod(
          'tasks.task.update', 
          {taskId: this.currtask.id, fields: {DEADLINE: new Date(this.date+'T'+this.hours+':'+this.minutes+":00")}}, 
          res=>{
            if(res.error())
              alert(res.error());
            else
            {
              this.dialog = false;
              const itemID = this.currtask.id;
              const item = this.tasks.tasks.find(item => item.id == itemID);
              item.deadline = new Date(this.date+'T'+this.hours+':'+this.minutes+":00");
              this.currtask = '',
              this.prevDeadline = '',
              this.prevWeek = '',
              this.date = '',
              this.time = '',
              this.maxDate = '',
              this.minDate = '';
              this.$set(this.tasks, 're', !this.tasks.re);
              this.$delete(this.tasks, 're');
            }
          }
        );
      },        
      timeControl(time, isHours = false) {
        this.$nextTick(() => {
          time = +(time.toString().replace(/[^\d-]+/, "")) || 0;
            if(isHours) {
              if(time == 24) time = 0;
                    if(time > 24) time = time % 10;
                    if(time < 0) time = 23;
                    time = time.toString().padStart(2, "0");
              } else {
                    if(time == 60) time = 0;
                    if(time > 60) time = time % 10;
                    if(time < 0) time = 59;
                    time = time.toString().padStart(2, "0");
                }
                this[isHours ? "hours" : "minutes"] = time;
            });
      },
      addCurrTask(list){
        let currtask = this.$store.getters.GET_CURR_TASK;
        if(currtask.id){
          this.currtask = currtask;
          this.dialog = true;
          this.maxDate = this.weeks[list].end;
          this.minDate = this.weeks[list].start;
          this.date = this.weeks[list].start;
          currtask.weekNum = list;
          let tmp = this.tasks.tasks.find(item=>item.id==currtask.id);
          if(!tmp)
            this.tasks.tasks.push(currtask);
          else
            this.prevWeek = tmp.weekNum;
            tmp.weekNum = list;
        }
      }
    },
    filters:{
      dateToLocal(date){
        return date.split('-').reverse().slice(0, 2).join('.');
      }
    },
    computed:{
      taskWeeks(){
        let result = [], temp, hours = 0, hres = [];
        if(!this.tasks) return {tasks:[], hours: [0,0,0,0]};
        for(let i in this.weeks){
          temp = this.tasks.tasks.filter(task=>task.weekNum == i);
          result.push(temp);
          for(let task of temp){
            if(task.timeEstimate){
              hours = (Number(task.timeEstimate) - Number(task.timeSpentInLogs)) > 0 ?
                +hours + +Number(task.timeEstimate) - Number(task.timeSpentInLogs) :
                hours;
              //hours = +hours + +Number(task.timeEstimate) - Number(task.timeSpentInLogs);
            }
          }
          hres.push((hours/3600).toFixed(1));
          hours = 0;
        }
  
        return {tasks:result, hours: hres};
      },
      queue(){
        if(this.tasks)
          return this.tasks.tasks.filter(task=>task.weekNum == 'queue');
        else 
          return [];
      },
      overdue(){
        if(this.tasks)
          return this.tasks.tasks.filter(task=>task.weekNum == 'overdue');
        else 
          return [];
      },
      hoursLeft(){
        return this.hoursInWeek - (((this.hoursInWeek/5).toFixed(1))*(this.today-1));
      },
      ...mapGetters({
        hoursInWeek: 'GET_HOURS'
      })
    },
    mounted(){
      this.xTasks = this.tasks.tasks;
    }
  }
</script>
<style scoped>
.weekbox {
  display: inline-flex;
  width: 20%;
  max-width: 400px;
  min-width: 320px;
  margin-right: 4px;
}
.weekbox:last-child{
  border-right: 0;
  margin-right: 0;
}
.mws_table_div{
  margin-left: 10px;
  padding-bottom: 10px;
}
.drop-zone {
  background-color: #e8e8e8;
  padding-bottom: 10px;
  width: 100%;
  min-height: 100px;
  height: 100%;
  max-height: 500px;
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.drop-zone::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.hbadge{
  border-radius: 30px;
  background-color: #D7853B;
  padding: 10px 1px;
  margin-right: 15px;
}
.time-block {
  flex: 0 0 100%;
  max-width: 100%;
  justify-content: center;
}
.weekheader{
  box-shadow: 0px 7px 8.6px 1.4px rgba(0, 0, 0, 0.13);
  height: 55px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 5;
  padding: 5px 15px;
}
.queue{
  background-color: #88a3d6;
  box-shadow: 0px 7px 8.6px 1.4px rgba(0, 0, 0, 0.13);
  height: 55px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 5;
  padding: 5px 15px;
}
.overdue{
  background-color: rgb(212, 79, 104);
  box-shadow: 0px 7px 8.6px 1.4px rgba(0, 0, 0, 0.13);
  height: 55px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 5;
  padding: 5px 15px;
}
.weektitle{
  margin: 0;
  font-weight: 900;
  color: white;
  font-size: larger;
}
.queuetitle{
  text-align: left;
  font-weight: 900;
  color: white;
  font-size: larger;
}
.weekStartEnd{
  color: white;
  margin-left: auto !important;
  margin: 0;
}
.circle{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
  margin-right: 4px;
}
.workdadys{
  display: flex;
  position: absolute;
  right: -3px;
  bottom: -7px;
}
.past{
  background-color: #db7380;
}
/deep/ .v-progress-linear__content{
  justify-content:left;
  padding-left: 3px;
  font-size: 12px;
}
.calendar-header {
  background-color: rgb(136, 163, 214);
  color: white;
}
.calendar-header-text{
  width: 100%;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
}
.user-card {
}
.card-header {
  color: white;
  background: linear-gradient(to right, #130cb7c2, #52e5e782);
  box-shadow: 0px 3px 1.96px 0.04px rgba(0, 0, 0, 0.18);
}

</style>