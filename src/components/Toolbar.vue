<template>
  <div ref="statusBar" class="status-bar">
    <!-- <button>
      <img :src="'v2GeoConst3D/images/history_list.svg'" />
    </button> -->

    <div style="flex-grow: 1"></div>

    <ConstructorToolbarArc
      v-show="sceneStates.mode === 'arcConstructor'"
      :constructor="scene.modeManager.arcConstructor"
    />

    <ConstructorToolbarSegment
      v-show="sceneStates.mode === 'segmentConstructor'"
      :constructor="scene.modeManager.segmentConstructor"
    />
    <ConstructorToolbarPoint
      v-show="sceneStates.mode === 'pointConstructor'"
      :constructor="scene.modeManager.pointConstructor"
    />

    <ConstructorToolbarAngle
      v-show="sceneStates.mode === 'angleConstructor'"
      :constructor="scene.modeManager.angleConstructor"
    />

    <ConstructorToolbarCircleWith2Points
      v-show="sceneStates.mode === 'circleWithCenterAndPointOnCircumConstructor'"
      :constructor="scene.modeManager.circleWithCenterAndPointOnCircumConstructor"
    />

    <RulerToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isRuler"
      :ruler="scene.ruler"
    />

   
    <MultiSelectToolbar
      v-show="sceneStates.selectedItems.length > 1"
      :sceneStates="sceneStates"
    />


    <ConstructorWithInstrumentsToolbar 
      v-show="sceneStates.mode === 'constructorWithInstruments'"
      :scene="scene"
      :states="scene.modeManager.constructorWithInstruments.states"
      :constructor="scene.modeManager.constructorWithInstruments"
    />

    <button @click="exitAnimationMode" class="btn-exit-play-mode" v-show="sceneStates.mode === 'play'">
      Exit Animation
    </button>

    <!-- <EditorToolbarLabel
      :sceneStates="sceneStates"
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isLabel"
    />
    <EditorToolbarPoint
      :sceneStates="sceneStates"
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isPoint"
    /> -->
  </div>
</template>

<script>
import ConstructorToolbarArc from "./constructorInput/ConstructorToolbarArc.vue";
import ConstructorToolbarSegment from "./constructorInput/ConstructorToolbarSegment.vue";
import ConstructorToolbarPoint from "./constructorInput/ConstructorToolbarPoint.vue";
import ConstructorToolbarAngle from "./constructorInput/ConstructorToolbarAngle.vue";
import ConstructorToolbarCircleWith2Points from "./constructorInput/ConstructorToolbarCircleWith2Points.vue";
import ConstructorWithInstrumentsToolbar from "./constructorInput/ConstructorWithInstrumentsToolbar.vue";

import RulerToolbar from "./instrumentToolbars/RulerToolbar.vue";
import MultiSelectToolbar from "./toolbars/MultiSelectToolbar.vue";

// import EditorToolbarLabel from "./editorToolbars/EditorToolbarLabel.vue";
// import EditorToolbarPoint from "./editorToolbars/EditorToolbarPoint.vue";

export default {
  components: {
    ConstructorToolbarArc,
    ConstructorToolbarSegment,
    ConstructorToolbarPoint,
    ConstructorToolbarAngle,
    ConstructorToolbarCircleWith2Points,

    RulerToolbar,
    MultiSelectToolbar,

    ConstructorWithInstrumentsToolbar,


    // EditorToolbarLabel,
    // EditorToolbarPoint,
  },

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

  mounted() {
    this.scene.on("Ctrl+z:down", () => {
      if(this.sceneStates.mode === 'play') return;
      this.scene.undo();
    });

    this.scene.on("Ctrl+y:down", () => {
      if(this.sceneStates.mode === 'play') return;
      this.scene.redo();
    });
  },

  methods: {

    exitAnimationMode(){

      this.scene.modeManager.setMode("constructorWithInstruments");
      this.scene.requestRender();

    },
    
   
  },
};
</script>

<style scoped>
.status-bar {
  min-height: 38px;
  max-height: 38px;
}
</style>

<style>
.constr-input-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 0.8rem;
  color: #333;
}

.constr-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 2px;
}

.constr-draw-mode-btn {
  border: 1px solid #0072d6;
  border-radius: 4.5px;
  margin: 0 5px;
}

.constr-input-bar input[type="text"]:focus {
  outline: none !important;
  /* border: 2px solid #097eeb; */
}

.constr-input-bar input::-moz-selection {
  background: #70b9ff;
}

.constr-input-bar input::selection {
  background: #70b9ff;
}

.status-bar > button {
  min-width: 38px;
  background-color: transparent;
  font-size: 0.76rem;
}

.status-bar .btn-exit-play-mode {
  border-radius: 18px;
  background:#0178be;
  padding: 1px 12px;
  color: white;
  font-size: 0.7rem;
  height: 26px;
}

.status-bar .btn-exit-play-mode:hover {
  background: #006aa7;
}

.status-bar .btn-exit-play-mode:active {
  background: #005382;
}

.status-bar img {
  height: 18px;
  margin: 0 5px;
}
</style>
