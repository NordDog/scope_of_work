<template>
  <div class="pa-4 mr-1">
    <v-text-field
      dense
      outlined
      placeholder="Доступно часов в неделю"
      type="number"
      v-model="settings.hInWeek"
      @input="updateSettings()"
      hide-details
      class="mb-5"
    >
      <template v-slot:append-outer>
        <v-tooltip right max-width="400">
          <template v-slot:activator="{on}">
            <v-icon
              v-on="on"
              style="margin-left: auto;"
            >mdi-information-outline</v-icon>
          </template>
          <span>Укажите в этом поле сколько часов в неделю доступно для планирования</span>
        </v-tooltip>
      </template>
    </v-text-field>
    <v-select
      dense
      outlined
      placeholder="Заголовок карточки задачи"
      :items="taskHeaders"
      v-model="settings.taskHeader"
      @change="updateSettings()"
      hide-details
      class="mb-4"
    >
      <template v-slot:append-outer>
        <v-tooltip right max-width="400">
          <template v-slot:activator="{on}">
            <v-icon
              v-on="on"
              style="margin-left: auto;"
            >mdi-information-outline</v-icon>
          </template>
          <span>Выберите в этом поле какая информация будет отображена как заголовок карточки заявки</span>
        </v-tooltip>
      </template>
    </v-select>
    <div style="display: flex;">
      <v-switch
        label="Заголовок родителя"
        v-model="settings.setHeaderFromMainTask"
        @change="updateSettings()"
        hide-details
      ></v-switch>
      <v-tooltip right max-width="400">
        <template v-slot:activator="{on}">
          <v-icon
            v-on="on"
            style="margin-left: auto;"
          >mdi-information-outline</v-icon>
        </template>
        <span>Указывать ли в подзадаче заголовком группу или сделку из основной задачи</span>
      </v-tooltip>
    </div>
    <div style="display: flex;" class="mb-4">
      <v-switch
        label="Задачи на проверке"
        v-model="settings.useTaskUnderReview"
        @change="updateSettings()"
        hide-details
      ></v-switch>
      <v-tooltip right max-width="400">
        <template v-slot:activator="{on}">
          <v-icon
            v-on="on"
            style="margin-left: auto;"
          >mdi-information-outline</v-icon>
        </template>
        <span>Учитывать в приложении задачи, находящиеся на проверке у постановщика</span>
      </v-tooltip>
    </div>
    <div style="display: flex;" class="mb-3">
      <p class="mb-0">Тэги:</p>
      <v-tooltip right max-width="400">
        <template v-slot:activator="{on}">
          <v-icon
            v-on="on"
            style="margin-left: auto;"
          >mdi-information-outline</v-icon>
        </template>
        <span>Выберите цвета тэгов, для отображения в карточках задач</span>
      </v-tooltip>
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