<template>
  <div class="expansion-container" >
    <div class="no-item-info" v-if="sceneStates.commandsStack.length === 0">
      <img :src="'v2GeoConst3D/images/info-circle.svg'" /> ဆောက်လုပ်ချက်များ မရှိသေးပါ
    </div>

    <div v-for="(group, index) in sceneStates.commandsStack" :key="group" :class="['command-history-list', {
      disabled : sceneStates.mode === 'play'
    }]">
      <q-expansion-item
        v-if="group.commands.length > 1"
        expand-icon-toggle
        expand-separator
        icon="draw"
        dense
        :label="group.commands[group.commands.length - 1].description"
        :class="[
          'expansion',
          'command-history-row',
          'command-list-row',
          { finished: sceneStates.mode === 'play' || index <= sceneStates.currentCommandIndex },
        ]">
        <template v-slot:header>
          <div :class="['expansion-header']" @click="scene.goToCommandHistory(index)">
            <img :src="'v2GeoConst3D/images/shapes.svg'" class="header-icon" />
            <div class="cmd-desc">
              {{ group.commands[group.commands.length - 1].description }}
            </div>
          </div>

        </template>
        <div v-for="cmd in group.commands" :key="cmd" class="cmd-group-row-exp-item">
          {{ cmd.description}} 
        </div>

      
      </q-expansion-item>

      <div
        :class="[
          'expansion-header',
          'command-history-row',
          'command-list-row',
          'command-header-single-row',
          { finished: sceneStates.mode === 'play' || index <= sceneStates.currentCommandIndex },
        ]"
        v-if="group.commands.length === 1"
        @click="scene.goToCommandHistory(index)"
      >
        <img :src="'v2GeoConst3D/images/shapes.svg'" class="header-icon" />
        <div class="cmd-desc">{{ group.commands[0].description }}</div>

        <div style="flex-grow: 1"></div>
        <div class="command-row-action-panel">
          <!-- <button @click="console.log('clicked')" class="btn-animate-draw">
            <img :src="'v2GeoConst3D/images/drawing-tablet.svg'" />
          </button> -->
        </div>
      </div>


    </div>
  </div>
</template>

<script>
export default {
  props: {
    scene: {},
  },

  created() {
    this.sceneStates = this.scene.states;
  },

  data() {
    return {
      sceneStates: {},
    };
  },

  mounted() {},
};
</script>

<style scoped>

.cmd-group-row-exp-item{
  font-size: .8rem;
  padding: 7px 2px 7px 40px;
}


.expansion-header{
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 40px;
  
}


.expansion-header img.header-icon {
    width: 13px;
    margin: 0 10px 0 0px;
    opacity: .7;
}

.expansion-header .cmd-desc{

}
.command-history-list{
  border-bottom: 1px dotted #00000018;
}

</style>

<style >
.expansion.q-expansion-item .q-item:hover{
  
}

.expansion.q-expansion-item .q-item,
.command-header-single-row {
    margin: 0;
    transition: all .1s ease;
    position: relative;
    min-height: 34px;

}

.expansion.q-expansion-item .q-item:hover,
.command-header-single-row:hover {
    background-color: #00000011 !important;

}



</style>
