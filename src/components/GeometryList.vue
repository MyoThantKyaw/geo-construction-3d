<template>
  <div :class="['geo-list-container', { enabled: sceneStates.modeType !== 'play' }]">
    <div class="no-item-info" v-if="sceneStates.userCreatedGeometries.length === 0">
      <img :src="'v2GeoConst3D/images/info-circle.svg'" /> ဆောက်လုပ်ချက်များ မရှိသေးပါ
    </div>

    <div
      v-for="geometry in sceneStates.userCreatedGeometries"
      :key="geometry"
      @click="selectGeometry(geometry)"
      :class="['geometry-row', { selected: geometry.isSelected.value }]"
    >
      <div class="visibility-control-container" @click="toggleVisibility(geometry)">
        <button class="btn-visibility-control" :class="[{ visible: geometry.visible }]" />
      </div>
      <div class="geometry-desc">
        {{ geometry.desc }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scene: {},
  },
  data() {
    return {
      sceneStates: {},
      states: {},
    };
  },

  created() {
    this.sceneStates = this.scene.states;
  },

  methods: {
    toggleVisibility(geometry) {
      if (geometry.visible) {
        geometry.hide();
      } else {
        geometry.show();
      }

      this.scene.requestRender();
    },

    selectGeometry(geometry) {
      // geometry.setSelection(true);
      this.scene.setSelection(geometry);
      this.scene.requestRender();
    },
  },
};
</script>

<style scoped>
.geo-list-container {
  pointer-events: none;
  padding: 5px;
  flex-grow: 1;
}

.geo-list-container.enabled {
  pointer-events: all;
}

.geometry-row {
  display: flex;
  border-bottom: 1px dotted #00000017;
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 42px;
}

.geometry-row:hover {
  background-color: #00000012;
}

.geometry-row.selected {
  background-color: #00000014;
  font-weight: bold;
  color: #333;
}

.visibility-control-container {
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #4444441c;
}

.btn-visibility-control {
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 1px solid #245f99;
}

.btn-visibility-control.visible {
  background-color: #2d70b3;
}

.geometry-desc {
  padding: 10px 5px 10px 9px;
}
</style>
