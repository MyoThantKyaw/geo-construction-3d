<template>
  <div>
    <div class="setting-panel-title">
      <img :src="'v2GeoConst3D/images/edit.svg'" />{{ segment.name.substring(0, 25) }}
    </div>

    <div class="setting-row">
      <div>Line Width</div>
      <q-input
        v-model="lineWidth"
        type="number"
        dense
        @update:model-value="propertyInputChanged($event, 'lineWidth', 0.01, 0.5)"
        @blur="changeProperty(lineWidth, originalLineWidth, 'lineWidth')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorLineWidth"
        :error-message="lineWidthErrorMsg"
        hide-bottom-space
      />
    </div>


  </div>
</template>
<script>
import CmdSetProperty from "../../core/commands/CmdSetProperty";

import * as util from "../../core/helper/util";

export default {
  props: ["scene", "segment"],

  data() {
    return {

      lineWidth: 0,
      errorLineWidth: false,
      lineWidthErrorMsg: "",
    };
  },

  mounted() {
    this.lineWidth = this.segment.lineWidth;
    this.originalLineWidth = this.lineWidth;
  },

  methods: {
    inputEnterPressed(e) {
      if (e.key !== "Enter") return;
      e.target.blur();
    },

    fontSizeInputChanged(value) {
      if (value < 0.1 || value > 3) this.lineWidth = this.originalLineWidth;

      this.segment.setFontSize(this.lineWidth);
      this.scene.requestRender();
    },

    propertyInputChanged(value, valName, min, max) {
      const capValName = util.capitalize(valName);

      if (value === "" || value < min || value > max) this["error" + capValName] = true;
      else this["error" + capValName] = false;

      this.segment["set" + capValName](
        this["error" + capValName] ? this["original" + capValName] : value
      );

      this.scene.requestRender();
    },

    changeProperty(value, originalVal, valName) {
      if (value === originalVal) return;

      const capValName = util.capitalize(valName);

      if (this["error" + capValName]) {
        this["error" + capValName] = false;
        this[valName] = this["original" + capValName];
      } else {
        const cmd = new CmdSetProperty(this.segment.name, valName, value, originalVal);
        cmd.execute(this.scene);
        this.scene.addCommand(cmd);

        this["original" + capValName] = value;
      }
    },

    inputKeyUp(e) {
      if (e.key !== "Enter") return;
      e.target.blur();
      this.scene.requestRender();
    },

    getVAlign(value) {
      if (value === 1) return "Top";
      else if (value === 0) return "Center";
      else if (value === -1) return "Bottom";
    },

    getVAlignCode(value) {
      if (value === "Top") return 1;
      else if (value === "Center") return 0;
      else if (value === "Bottom") return -1;
    },

    getHAlign(value) {
      if (value === 1) return "Left";
      else if (value === 0) return "Center";
      else if (value === -1) return "Right";
    },

    getHAlignCode(value) {
      if (value === "Left") return 1;
      else if (value === "Center") return 0;
      else if (value === "Right") return -1;
    },
  },
};
</script>

<style scoped></style>
