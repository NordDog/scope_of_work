<template>
  <div>
    <div class='drop-zone' @drop="onDrop($event, 1)" @dragover.prevent @dragenter.prevent>
      <div>
        <span>Какой-то этап</span>
      </div>
      <div   
        class="drag-el"
        v-for="item in listOne"
        :key="item.title"
        draggable
        @dragstart="startDrag($event, item)"
      >
        {{ item.title }}
      </div>
    </div>
    <div class='drop-zone' @drop="onDrop($event, 2)" @dragover.prevent @dragenter.prevent>
      <div>
        <span>Другой этап</span>
      </div>
      <div   
        class="drag-el"
        v-for="item in listTwo"
        :key="item.title"
        draggable
        @dragstart="startDrag($event, item)"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'drag_n_drop',
    data:()=>({
        items: [
        {
          id: 0,
          title: 'Написать что-нибудь',
          list: 1
        },
        {
          id: 1,
          title: 'Задебажить что-нибудь',
          list: 1
        },
        {
          id: 2,
          title: 'Удолить это и не позориться',
          list: 2
        }]
    }),
    methods:{
      startDrag (evt, item) {
        evt.dataTransfer.dropEffect = 'move'
        evt.dataTransfer.effectAllowed = 'move'
        evt.dataTransfer.setData('itemID', item.id)
      },
      onDrop (evt, list) {
        const itemID = evt.dataTransfer.getData('itemID')
        const item = this.items.find(item => item.id == itemID)
        item.list = list
      }
    },
    computed:{
      listOne () {
        return this.items.filter(item => item.list === 1)
      },
      listTwo () {
        return this.items.filter(item => item.list === 2)
      }
    }
  }
</script>
<style scoped>
  .drop-zone {
    background-color: #eee;
    margin: 10px;
    padding: 10px;
    display: inline-grid;
    width: 200px;
    min-height: 50px;
  }

  .drag-el {
    background-color: #fff;
    margin-bottom: 10px;
    padding: 5px;
  }
</style>