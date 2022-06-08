<template>
  <div>
    <v-card flat>
      <v-card-title class="pl-9">{{ user.userData.name }}</v-card-title>
      <v-card-text class="text-center" style="display: flex;">
        <div class="weekbox mr-1">
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
        <div v-for="(week, week_index) in weeks" :key="week_index" class="weekbox mr-1">
          <div class="drop-zone" @drop="onDrop($event, week_index)" @dragover.prevent @dragenter.prevent>
            <div class="weekheader" :style="weekcolors[week_index]">
              <div style="display: flex; position: relative;">
                <p class="weektitle">Неделя {{week_index + 1}}</p>
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
                    :color="taskWeeks.hours[week_index] > hoursLeft ? '#d22e4d' : '#52ac62'"
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
                    :color="taskWeeks.hours[week_index] > hoursInWeek ? '#d22e4d' : '#52ac62'"
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
              style="border-radius: 25px; margin: 15px;"
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
      width="380"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Укажите новый дедлайн
        </v-card-title>
        <v-card-text>
        <v-row justify="center">
          <v-date-picker 
            v-model="date"
            locale="ru-RU"
            first-day-of-week="1"
            :min="minDate"
            :max="maxDate"
          ></v-date-picker>
        </v-row>
        <v-row>
          <div class="time-block d-flex">
            <v-col cols="6" class="pl-0 pr-1 d-flex align-center">
              <v-icon @click="timeControl(+hours - 1, true)">mdi-chevron-left</v-icon>
              <v-text-field type="number" v-model="hours" outlined dense hide-details label="Часы" @input="timeControl($event, true)"></v-text-field>
              <v-icon @click="timeControl(+hours + 1, true)">mdi-chevron-right</v-icon>
            </v-col>
            <v-col cols="6" class="pr-0 pl-1 d-flex align-center">
              <v-icon @click="timeControl(+minutes - 1)">mdi-chevron-left</v-icon>
              <v-text-field type="number" v-model="minutes" outlined dense hide-details label="Минуты" @input="timeControl($event)"></v-text-field>
              <v-icon @click="timeControl(+minutes + 1)">mdi-chevron-right</v-icon>
            </v-col>
          </div>
        </v-row>   
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
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
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import moment from "moment";
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
      weekHours:[],
      weekcolors:[
        'background-color: #97c89a',
        'background-color: #93cac4',
        'background-color: #8691c8',
        'background-color: #9786bd',
      ],
      weekdays: [1,2,3,4,5],
      hoursInWeek: 30,
    }),
    props:{
      user: Object,
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
        const item = this.user.tasks.find(item => item.id == itemID);
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
              }
            }
          );
        }
      },
      decline(){
        const itemID = this.currtask.id;
        const item = this.user.tasks.find(item => item.id == itemID);
        item.weekNum = this.prevWeek;
        this.dialog = false;
        this.currtask = '',
        this.prevDeadline = '',
        this.prevWeek = '',
        this.date = '',
        this.time = '',
        this.maxDate = '',
        this.minDate = ''
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
              const item = this.user.tasks.find(item => item.id == itemID);
              item.deadline = new Date(this.date+'T'+this.hours+':'+this.minutes+":00");
              this.currtask = '',
              this.prevDeadline = '',
              this.prevWeek = '',
              this.date = '',
              this.time = '',
              this.maxDate = '',
              this.minDate = ''	
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
    },
    filters:{
      dateToLocal(date){
        return date.split('-').reverse().slice(0, 2).join('.');
      }
    },
    computed:{
      taskWeeks(){
        let result = [], temp, hours = 0, hres = [];
        for(let i in this.weeks){
          temp = this.user.tasks.filter(task=>task.weekNum == i);
          result.push(temp);
          for(let task of temp){
            if(task.timeEstimate){
              hours = +hours + +Number(task.timeEstimate);
            }
          }
          hres.push((hours/3600).toFixed(1));
          hours = 0;
        }
  
        return {tasks:result, hours: hres};
      },
      queue(){
        return this.user.tasks.filter(task=>task.weekNum == 'queue')
      },
      hoursLeft(){
        return this.hoursInWeek - (((this.hoursInWeek/5).toFixed(1))*(this.today-1));
      }
    }
  }
</script>
<style scoped>
.weekbox {
  display: inline-flex;
  width: 19%;
  max-width: 400px;
  min-width: 320px;
}
.weekbox:last-child{
  border-right: 0;
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
  background-color: rgb(136, 163, 214);
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
</style>