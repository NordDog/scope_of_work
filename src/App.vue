<template>
  <v-app>
    <v-main>
      <!-- <drag_n_drop /> -->
      <scope_of_work/>
    </v-main>
  </v-app>
</template>

<script>
import scope_of_work from './components/scope_of_work';
// import drag_n_drop from './components/drag_n_drop.vue';
export default {
  name: 'App',

  components: {
    scope_of_work,
    // drag_n_drop
  },

  data: () => ({
    //
  }),
};
</script>