<template>
  <div class="pa-4">
    <v-text-field
      dense
      outlined
      label="Доступно часов в неделю"
      type="number"
      v-model="settings.hInWeek"
      @input="updateSettings()"
    >
      <template v-slot:append-outer>
        <v-menu
          open-on-hover
          top
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-bind="attrs"
              v-on="on"
            >mdi-information-outline</v-icon>
          </template>
          <v-card width="200">
            <v-card-text>
              <p class="ma-0">Укажите в этом поле сколько часов в неделю доступно для планирования</p>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-text-field>
    <v-select
      dense
      outlined
      label="Заголовок карточки задачи"
      :items="taskHeaders"
      v-model="settings.taskHeader"
      @change="updateSettings()"
    >
      <template v-slot:append-outer>
        <v-menu
          open-on-hover
          top
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-bind="attrs"
              v-on="on"
            >mdi-information-outline</v-icon>
          </template>
          <v-card width="200">
            <v-card-text>
              <p class="ma-0">Выберите в этом поле какая информация будет отображена как заголовок карточки заявки</p>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-select>
    <div style="display: flex;">
      <v-switch
        label="Заголовок родителя"
        v-model="settings.setHeaderFromMainTask"
        @change="updateSettings()"
      ></v-switch>
      <v-menu
        open-on-hover
        top
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            v-bind="attrs"
            v-on="on"
            style="margin-left: auto;"
          >mdi-information-outline</v-icon>
        </template>
        <v-card width="200">
          <v-card-text>
            <p class="ma-0">Указывать ли в подзадаче заголовком группу или сделку из основной задачи</p>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
    <div style="display: flex;">
      <p class="mb-0">Тэги:</p>
      <v-menu
        open-on-hover
        top
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            v-bind="attrs"
            v-on="on"
            style="margin-left: auto;"
          >mdi-information-outline</v-icon>
        </template>
        <v-card width="200">
          <v-card-text>
            <p class="ma-0">Выберите цвета тэгов, для отображения в карточках задач</p>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
    <div class="tagsbox">
        <v-menu
          v-for="(tag, index) of settings.tags"
          :key="index"
          :v-model="Boolean(tag.menu)"
          :close-on-content-click="false"
          width="200"
          offset-x
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :color="tag.color"
              v-bind="attrs"
              v-on="on"
              small
              :dark="Boolean(tag.darkMode)"
              class="ma-1"
            >
              #{{tag.name}}
            </v-btn>
          </template>

          <v-card>
            <v-card-text>
              <v-color-picker
                canvas-height="200"
                mode="hexa"
                v-model="tag.color"
                @input="updateSettings()"
              ></v-color-picker>
              <v-switch
                :label="tag.darkMode ? 'Белый' : 'Черный'"
                v-model="tag.darkMode"
              ></v-switch>
            </v-card-text>
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
    }
  },
  methods:{
    updateSettings(){
      this.$store.dispatch('SET_APP_SETTINGS', this.settings)
    }
  },
  mounted(){
    this.settings = this.$store.getters.GET_SETTINGS;
  }
};
</script>
<style scoped>
.tagsbox{
  border: 2px solid grey;
  border-radius: 5px;
  width: 100%;
}
</style>