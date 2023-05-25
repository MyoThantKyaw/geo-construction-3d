<template>
  <div class="toolbar-container">
    <SegmentToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isSegment"
      :scene="scene"
    />

    <PointToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isPoint"
      :scene="scene"
    />

    <IntersectionPtToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isIntersectionPt"
      :scene="scene"
    />

    <LabelToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isLabel"
      :scene="scene"
    />

     <AngleToolbar
      v-show="sceneStates.selectedItem && sceneStates.selectedItem.isAngle"
      :scene="scene"
    />

    <TwoPointsToolbar
      v-show="sceneStates.selectedItems.length === 2 && sceneStates.selectedItems[0].isPoint && sceneStates.selectedItems[1].isPoint"
      :scene="scene"
    />
    
  </div>
</template>

<script>
import SegmentToolbar from "./toolbarsForGeometries/SegmentToolbar.vue";
import PointToolbar from "./toolbarsForGeometries/PointToolbar.vue";
import IntersectionPtToolbar from "./toolbarsForGeometries/IntersectionPtToolbar.vue";
import LabelToolbar from "./toolbarsForGeometries/LabelToolbar.vue";
import AngleToolbar from "./toolbarsForGeometries/AngleToolbar.vue";
import TwoPointsToolbar from "./toolbarsForGeometries/TwoPointsToolbar.vue";

export default {
  components: {
    SegmentToolbar,
    PointToolbar,
    IntersectionPtToolbar,
    LabelToolbar,
    AngleToolbar,
    TwoPointsToolbar,
  },

  props: {
    scene: {},
  },

  created() {
    this.sceneStates = this.scene.states;
  },

  mounted() {},
};
</script>

<style scoped>
.toolbar-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.toolbar-container * {
  pointer-events: all;
}
</style>

<style>
.toolbar-frame {
  position: absolute;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  background: #fff;
  border-radius: 4px;
  padding: 5px 1px;
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
    rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
  border: 1px solid #00000022;
}

.toolbar-frame.toolbar button img ,
.toolbar-frame.toolbar .btn-group img {

  width: 18px;
  height: 18px;
}

.toolbar-frame.toolbar button {
  width: 35px;
  height: 35px;
  border: 1px solid #00000020;
  margin: 0 4px;
  position: relative;
  border-radius: 5px;
}

.toolbar-frame.toolbar .btn-group img{
  margin: 8px;
}

.toolbar-frame .btn-group {
  border: 1px solid #00000021;
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  margin: 0 4px;
}

.toolbar-frame .btn-group button {
  padding: 0;
  width: auto;
  height: auto;
  margin: 0;
  border: none;
  
}

.toolbar-frame .btn-group input {
  margin: 2px;
  border-radius: 6px;
  border: none;
  outline: none;
  font-size: 0.75rem;
  width: 52px;
  border-bottom: 1px solid #0000004d;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 0 5px;
  border-radius: 0;
  margin: 4px 4px 4px 0px;
  text-align: center;
}

.toolbar-frame .btn-group input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  font-weight: normal;
  color: #aaa;
  opacity: 1; /* Firefox */
}

.toolbar-frame .btn-group input::-ms-input-placeholder { /* Microsoft Edge */
  font-weight: normal;
  color: #aaa;
}

.toolbar-frame .btn-group input:focus {
  border-color: #000000b4;
}

.geo-edit-toolbar-color-dialog {
    padding: 10px 0;
    background-color: transparent !important;
    box-shadow: none !important;
}


</style>
