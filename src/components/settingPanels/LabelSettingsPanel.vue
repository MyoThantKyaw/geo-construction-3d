<template>
  <div>
    <div class="setting-panel-title">
      <img :src="'v2GeoConst3D/images/edit.svg'" />{{ label.name.substring(0, 25) }}
    </div>

    <div class="setting-row">
      <div>Font Size</div>
      <q-input
        v-model="fontSize"
        type="number"
        dense
        @update:model-value="propertyInputChanged($event, 'fontSize', 0.1, 1)"
        @blur="changeProperty(fontSize, originalFontSize, 'fontSize')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorFontSize"
        :error-message="fontSizeErrorMsg"
        hide-bottom-space
      />
    </div>

    <div class="setting-row" v-if="hAlign !== undefined">
      <div>Horizontal Align</div>
      <q-select
        v-model="hAlign"
        :options="hAligns"
        dense
        options-dense
        @update:model-value="
          propertyInputChanged(getHAlignCode($event), 'hAlign', undefined, undefined)
        "
        @blur="changeProperty(getHAlignCode(hAlign), originalHAlign, 'hAlign')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorHAlign"
        :error-message="hAlignErrorMsg"
        hide-bottom-space
      />
    </div>

    <div class="setting-row" v-if="vAlign !== undefined">
      <div>Vertical Align</div>
      <q-select
        v-model="vAlign"
        :options="vAligns"
        dense
        options-dense
        @update:model-value="
          propertyInputChanged(getVAlignCode($event), 'vAlign', undefined, undefined)
        "
        @blur="changeProperty(getVAlignCode(vAlign), originalVAlign, 'vAlign')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorVAlign"
        :error-message="vAlignErrorMsg"
        hide-bottom-space
      />
    </div>

    <div class="setting-row" v-if="hOffset !== undefined">
      <div>Horizontal Offset</div>
      <q-input
        v-model="hOffset"
        dense
        @update:model-value="propertyInputChanged($event, 'hOffset', 0, 4)"
        @blur="changeProperty(hOffset, originalHOffset, 'hOffset')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorHOffset"
        :error-message="hOffsetErrorMsg"
        hide-bottom-space
      />
    </div>

    <div class="setting-row" v-if="vOffset !== undefined">
      <div>Vertical Offset</div>
      <q-input
        v-model="vOffset"
        type="number"
        dense
        @update:model-value="propertyInputChanged($event, 'vOffset', 0, 4)"
        @blur="changeProperty(vOffset, originalVOffset, 'vOffset')"
        @keyup="inputKeyUp"
        no-error-icon
        :error="errorVOffset"
        :error-message="vOffsetErrorMsg"
        hide-bottom-space
      />
    </div>
  </div>
</template>
<script>
import CmdSetProperty from "../../core/commands/CmdSetProperty";
import DefLabelBetween2Points from "../../core/definitions/labels/DefLabelBetween2Points";
import DefLabelBetween2StaticPoints from "../../core/definitions/labels/DefLabelBetween2StaticPoints";

import * as util from "../../core/helper/util";

export default {
  props: ["scene", "label"],

  data() {
    return {
      vAlign: "Center",
      hAlign: "Center",

      vAligns: ["Top", "Center", "Bottom"],
      hAligns: ["Left", "Center", "Right"],

      fontSize: 1,
      hOffset: 0,
      vOffset: 0,

      errorFontSize: false,
      errorHOffset: false,
      errorVOffset: false,
      errorHAlign: false,
      errorVAlign: false,

      fontSizeErrorMsg: "",
      hOffsetErrorMsg: "",
      vOffsetErrorMsg: "",

      hAlignErrorMsg: "",
      vAlignErrorMsg: "",

      

    };
  },

  mounted() {

    this.fontSize = this.label.fontSize;
    this.lbDef = this.label.definition;

    if (
      this.lbDef.constructor === DefLabelBetween2Points ||
      this.lbDef.constructor === DefLabelBetween2StaticPoints
    ) {
      this.vAlign = this.getVAlign(this.label.vAlign);
      this.hAlign = this.getHAlign(this.label.hAlign);

      this.hOffset = this.label.hOffset;
      this.vOffset = this.label.vOffset;

      this.originalHOffset = this.hOffset;
      this.originalVOffset = this.vOffset;
      this.originalFontSize = this.label.fontSize;
      this.originalHAlign = this.label.hAlign;
      this.originalVAlign = this.label.vAlign;
    } else {
      this.hAlign = this.vAlign = this.hOffset = this.vOffset = undefined;
    }
  },

  methods: {
    inputEnterPressed(e) {
      if (e.key !== "Enter") return;
      e.target.blur();
    },

    fontSizeInputChanged(value) {
      if (value < 0.1 || value > 3) this.fontSize = this.originalFontSize;

      this.label.setFontSize(this.fontSize);
      this.scene.requestRender();
    },

    propertyInputChanged(value, valName, min, max) {
      const capValName = util.capitalize(valName);

      if (value === "" || value < min || value > max) this["error" + capValName] = true;
      else this["error" + capValName] = false;

      this.label["set" + capValName](
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
        const cmd = new CmdSetProperty(this.label.name, valName, value, originalVal);
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
