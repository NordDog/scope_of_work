<template>
  <v-app>
    <v-main>
      <div style="display: flex;">
        <div :class="{'expanded': !mini}" class="pt-8" v-if="isAdmin">
          <v-btn
            v-if="$root.info.placement != 'TASK_VIEW_TAB'"
            large
            icon
            @click.stop="toggleMenu()"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <menu-app v-if="!mini"/>
        </div>
        <scope_of_work :class="{'menu-expanded': !mini }"/>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import scope_of_work from './components/scope_of_work';
import menuApp from './components/menu';
export default {
  name: 'App',

  components: {
    scope_of_work,
    menuApp
  },

  data(){
    return {
      mini: true,
      isAdmin: this.$root.isAdmin
    }
  },
  methods:{
    toggleMenu(){
      if(!this.mini){
        this.$store.dispatch('PUSH_SETTINGS');
      }
      this.mini = !this.mini;
    }
  },
  mounted(){
    this.$store.dispatch('GET_APP_SETTINGS');
    
    this.$store.dispatch('GET_FIRSTDATE');
  }
};
</script>
<style scoped>
.expanded{
  width: 15%;
}
.menu-expanded{
  width: 85%;
}
</style>