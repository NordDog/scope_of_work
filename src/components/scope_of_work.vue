<template>
  <div class="pr-5 pt-7" style="width: 100%;">
    <v-row>
      <v-col cols="7" style="min-width:600px;">
        <v-autocomplete
          dence
          multiple
          outlined
          placeholder="Фильтр по пользователям или подразделениям"
          :items="deptsAndUsers"
          return-object
          item-text="name"
          v-model="selected"
          color="blue darken-3"
          item-color="blue darken-3"
        >
          <template v-slot:append>
            <v-btn icon @click="setOpt()">
              <v-icon large>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <!-- <template v-slot:append-outer v-if="selected.length">
            <v-btn icon @click="()=>{selected = []}">
              <v-icon large>mdi-close</v-icon>
            </v-btn>
          </template> -->
          <template v-slot:prepend-item>
              <div class="first-item">
                <v-btn
                  text
                  class="selectall"
                  @click="toggleSelected()"
                >
                  {{isSelectAll ? 'выбрать всех' : 'очистить'}}
                </v-btn>
                <v-btn 
                  outlined 
                  :color="isResp ? 'teal' : 'secondary'" 
                  text
                  @click="$store.dispatch('SET_IS_RESP', true)"
                >
                  ответственный
                </v-btn>
                <v-btn 
                  class="ml-5" 
                  :color="!isResp ? 'teal' : 'secondary'" 
                  outlined 
                  text
                  @click="$store.dispatch('SET_IS_RESP', false)"
                >
                  постановщик
                </v-btn>
              </div>
          </template>
        </v-autocomplete>
      </v-col>
      <!-- <v-col cols="1">
        <v-btn 
          x-large color="primary" 
          @click="setOpt()"
        >Go!</v-btn>
      </v-col> -->
    </v-row>
    
    <div>

<!--       <div v-if="isResp">
        <v-row v-for="(user, user_index) in selectedUsers" :key="user_index">
          <div class="pa-0" style="flex-basis: 0; flex-grow: 1;">
            <user_card :user="user" :tasks="tasks[+user.id]" :weeks="weeks"/>
          </div>
        </v-row>
      </div> -->

      <div>
        <v-row v-for="user in dispUser" :key="user.id">
          <div class="pa-0" style="flex-basis: 0; flex-grow: 1;">
            <user_card :user="user" :tasks="tasks[+user.id]" :weeks="weeks"/>
          </div>
        </v-row>
      </div>
    
      <v-pagination v-model="page" :length="pages" :total-visible="5"></v-pagination>
    
    </div>
    

    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{loaderText}}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import moment from "moment";
  import user_card from './user_card.vue'
  export default {
    name: 'scope_of_work',
    components:{
      user_card
    },
    data:()=>({
      // tasks: [],
      // weeks: [],
      //selected: [],
      // //deptsAndUsers:[],
      // isResp: true
      isSelectAll: true,
      page: 1,
      onPage: 5,
    }),
    methods: {
      setOpt(){
        BX24.callMethod('user.option.set',{options:{selected: JSON.stringify(this.selected)}});
        this.$store.dispatch('GET_USERS_TASKS')
      },
      toggleSelected(){
        this.isSelectAll = !this.isSelectAll;
        if(!this.isSelectAll){
          this.selected = this.deptsAndUsers.filter(item=>item.type == 'user');
        } else {
          this.selected = [];
        }
      }
    },
    computed: {
      ...mapGetters({
        dialog: 'GET_LOADING_DIALOG',
        loaderText: 'GET_LOADING_TEXT',
        weeks: 'GET_WEEKS',
        tasks: 'GET_RESULT',
        deptsAndUsers: 'GET_DEPTS_AND_USERS',
        selectedUsers: 'GET_SELECTED_USERS',
        isResp: 'GET_IS_RESP'
      }),
      selected:{
        get(){return this.$store.getters.GET_SELECTED;},
        set(val){this.$store.dispatch('SET_SELECTED', val);}
      },
      responsibles(){
        let result = [], userIds = Object.keys(this.tasks);

        for(let item of this.deptsAndUsers){
          if(item.type == 'user' && userIds.includes(item.id)){
            result.push(item);
            console.log(item);
          }

        }

        return result;
      },
      dispUser(){
        let 
        limit = this.onPage * this.page,
        i = limit - this.onPage, 
        visibleUs = []; 
        while(i < limit){
          if(this.isResp){
            if(this.selectedUsers[i] && this.selectedUsers[i].id) visibleUs.push(this.selectedUsers[i]);
          } else {
            if(this.selected[i] && this.selected[i].id) visibleUs.push(this.selected[i]);
          }
          i++;
        }
        return visibleUs;
      },
      pages(){
        return this.isResp ? Math.ceil(this.selectedUsers.length / this.onPage) : Math.ceil(this.selected.length / this.onPage)
      }
    },
    mounted() {
      //this.selected = this.$store.getters.GET_SELECTED;
    }
  }
</script>
<style>
.v-application{
  font-family: 'Gotham Pro', sans-serif;                                             
}
html{
  overflow-x: auto;
}
.v-application--is-ltr .v-text-field .v-input__append-inner{
  margin-top: 0px;
  align-self: center;
}
.v-text-field--outlined .v-input__append-outer{
  margin-top: 10px !important;
}
.first-item{
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.v-select__slot{
  padding-left: 15px;
}
.selectall{
  position: absolute;
  left: 35px;
}
</style>