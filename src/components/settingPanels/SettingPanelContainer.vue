<template>
  <transition name="dialog" >
    <div id="setting-container-root">
      <div class="setting-container">
        <LabelSettingsPanel
          v-if="selectionManager.editingItem && selectionManager.editingItem.isLabel"
          :scene="scene"
          :label="selectionManager.editingItem"
        />

        <SegmentSettingsPanel
          v-if="selectionManager.editingItem && selectionManager.editingItem.isSegment"
          :scene="scene"
          :segment="selectionManager.editingItem"
        />
        
      </div>
    </div>
  </transition>
</template>

<script>

import LabelSettingsPanel from "./LabelSettingsPanel.vue";
import SegmentSettingsPanel from "./SegmentSettingsPanel.vue";

export default {
  props: ["scene"],

  data() {
    return {
      selectionManager: this.scene.selectionManager,
    };
  },

  components: {
    LabelSettingsPanel,
    SegmentSettingsPanel,
  },

  mounted() {
    //

  },
};
</script>

<style scoped>
#setting-container-root {
  background: #f8f8f8b3;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}

.setting-container {
  background: #fff;
  position: absolute;
  bottom: 0;
  width: stretch;
  height: 380px;
  border-radius: 10px;
  margin: 5px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 0px, rgba(0, 0, 0, 0.2) 0px 0px 8px;
  border: 1px solid #00000022;
  padding: 8px 10px;
}
</style>

<style>
.setting-panel-title {
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  margin: 3px 0 0px 0;
  padding: 0 0 5px 0;
  border-bottom: 1px dashed #00000019;
}

.setting-panel-title img {
  width: 14px;
  height: 14px;
  margin-right: 7px;
  opacity: 0.8;
}

.setting-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* background: cadetblue; */
  padding: 3px;
}

.setting-row input {
  text-align: right;
  padding: 0 10px 0 5px;
}

.setting-row > div:first-child {
  min-width: 150px;
  font-size: 0.8rem;
}

.setting-row > *:nth-child(2) {
  width: stretch;
  min-width: unset;
}

.setting-row .q-field--dense .q-field__control,
.q-field--dense .q-field__marginal,
.setting-row .q-field--auto-height.q-field--dense .q-field__control,
.q-field--auto-height.q-field--dense .q-field__native {
  height: 35px;
}

/* Chrome, Safari, Edge, Opera */
.setting-row input::-webkit-outer-spin-button,
.setting-row input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.setting-row input[type="number"] {
  -moz-appearance: textfield;
}

.setting-row .q-field--standard .q-field__control:before {
  border-bottom: 1px solid rgb(0 0 0 / 10%);
}
</style>
