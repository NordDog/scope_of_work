<template>
  <div class="pa-4">
    <v-text-field
      dense
      outlined
      label="Доступно часов в неделю"
      type="number"
      v
    ></v-text-field>
    <v-select
      dense
      outlined
      label="Заголовок карточки задачи"
      :items="taskHeaders"
      value="selectedHeader"
    ></v-select>
    <v-switch
      label="Указывать что-то основной задачи в подзадачах"
    ></v-switch>
    <p>Тэги:</p>
    <div class="tagsbox">
      <v-menu
        v-for="(tag, index) of tags"
        :key="index"
        v-model="tag.menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :color="tag.color"
            v-bind="attrs"
            v-on="on"
            small
            class="ma-1"
          >
            #{{tag.name}}
          </v-btn>
        </template>

        <v-card>
          <v-card-text>
            <v-color-picker
              canvas-height="200"
              hide-inputs
              v-model="tag.color"
            ></v-color-picker>
          </v-card-text>


          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text
              @click="tag.menu = false"
            >
              Отменить
            </v-btn>
            <v-btn
              color="primary"
              text
              @click="tag.menu = false"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>

  </div>
</template>

<script>

export default {
  name: 'menuApp',

  data(){
    return {
      settings: {},
      taskHeaders:[
        {
          text:'Группа задачи',
          value: 'group'
        },
        {
          text:'Название сделки',
          value: 'title'
        },
      ],
      selectedHeader: '',
      tags: [
        {
          name: 'Разработка',
          color: '#19CF21FF',
          oldColor: '',
          menu: false
        },
        {
          name: 'Баг',
          color: '#FF0000FF',
          oldColor: '',
          menu: false
        },
        {
          name: 'Оценка',
          color: '#09EDEDFF',
          oldColor: '',
          menu: false
        },
      ]
    }
  },
  mounted(){
    this.settings = this.$store.getters.GET_SETTINGS;
    this.tags = this.$store.getters.GET_TAGS;
  }
};
</script>
<style scoped>
.tagsbox{
  border: 2px solid grey;
  border-radius: 5px;
}
</style>