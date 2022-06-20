<template>
  <v-card class="card">
    <v-card-text class="pa-0">
      <div class="card_header">
        <p class="task_project" v-if="task.group.name" :title="task.group.name">{{ task.group.name|cutProjectTitle }}</p>
        <p class="task_project" style="color: darkred" v-else :title="task.group.name">НЕТ ГРУППЫ!!!</p>
        <p class="task_deadline">{{ deadline }}</p>
      </div>
      
      <div style="display: flex;position: relative; width: 100%;">
        <p class="pr-1 mb-1" style="font-size: 12px;">{{progress}}%</p>
        <div class="progress_bar">
          <v-progress-linear 
            :value="progress" 
            :color="color"
            background-color="white" 
            :height="9" 
            rounded
          >
          </v-progress-linear>
        </div>
        <p class="mb-1" style="font-size: 12px;text-align: end;width: inherit;">{{(task.timeSpentInLogs/3600).toFixed(1)}}ч./{{ task.timeEstimate / 3600 }}ч.</p>
      </div>

      <div style="display: flex;">
        <div class="task_body">{{task.title}}</div>
        <v-btn icon @click="goto(task.id)" style="margin-left: auto; margin-right: -7px;">
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </div>


      <div class="card_footer">
        <!-- <div class="task_type" v-if="task.ufTaskType" ><span class="px-2">{{task.type}}</span></div> -->
        <div 
          :style="'background-color:' + tag.color + '; color:'+tag.textColor"
          class="task_type" 
          v-for="tag in this.tags"
          :key="tag.value" 
        ><span class="px-2">{{tag.name}}</span></div>
        <div :title="task.creator.name">
          <img
            v-if="!task.creator.icon.includes('default_avatar.png')"
            class="avatar" 
            :src="'https://crm.mywebstor.com'+task.creator.icon"
          >
          <img
            v-else
            class="avatar"
            src="../../public/def_avatar.jpg"
          >
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from 'moment';
import {mapGetters} from 'vuex';
  export default {
    name: 'task_card',
    props:{
      task: Object,
    },
    data:()=>({
      progress: 0,
      color: '#97c89a'
    }),
    computed:{
      deadline(){
        let result = 'нет дедлайна';
        if(this.task.deadline) result = moment(this.task.deadline).format('DD.MM.YYYY');
        return result;
      },
      ...mapGetters({
        settings:'GET_SETTINGS'
      }),
      tags(){
        let result = [];
        for(let tag of this.settings.tags){
          if(tag.value == this.task.ufTaskType){
            tag.textColor = Boolean(tag.darkMode) ? 'white' : 'black'; 
            result.push(tag);
          }
        }
        return result;
      }
    },
    filters:{
      cutProjectTitle(string){
        if(string && string.length > 11) return string.slice(0, 11) + '...';
        else return string;
      }
    },
    methods:{
      goto(id){
        BX24.openPath('/company/personal/user/'+this.task.responsibleId+'/tasks/task/view/'+id+'/');
      }
    },
    mounted(){
      if(this.task.timeSpentInLogs > 0 && this.task.timeEstimate > 0)
        this.progress = (this.task.timeSpentInLogs * 100 / this.task.timeEstimate).toFixed(0);
      this.color = this.progress>100 ?'#d44f68':'#97c89a';
    }
  }
</script>
<style scoped>
.card {
  border-radius: 9px !important;
  background-color: rgb(255, 255, 255);
  box-shadow: 0px 7px 8.6px 1.4px rgba(0, 0, 0, 0.13);
  padding: 10px 15px;
}
.progress_bar{
  min-width: 60%; 
  border: 1px solid #949494; 
  border-radius: 5px; 
  height: 11px;
  margin-top: 5px;
}
.card_header{
  display: inline-flex;
  position: relative;
  width: 100%;
}
.task_project{
  font-weight: 900;
  margin-bottom: 0px;
}
.task_deadline{
  margin-left: auto;
  margin-bottom: 0;
  font-size: 12px;
  line-height: 1.2;
}
.task_body{
  text-align: left;
  line-height: normal;
  font-size: 13px;
}
.card_footer{
  position:relative;
  height: 50px;
}
.task_type{
  /* background-color: rgb(125, 109, 173); */
  color: white;
  border-radius: 5px;
  position: absolute;
  bottom: 2px;
  line-height: 1.2;
  font-size: 12px;
  padding: 2px 0px 2px 0px;
}
.avatar{
  border-radius: 50%;
  width: 40px;
  position: absolute;
  right: 0;
  bottom: 2px;
  
}
</style>
