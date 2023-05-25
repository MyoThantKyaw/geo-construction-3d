<template>
  <div class="toolbar-frame toolbar">
    <div class="btn-group">
      <img :src="'v2GeoConst3D/images/text.svg'" />
      <input
        ref="inputLabel"
        placeholder="Label"
        @keyup="labelInputEnterPressed"
      />
    </div>

    <button>
      <img :src="'v2GeoConst3D/images/paint.svg'" />
      <q-popup-proxy :class="['geo-edit-toolbar-color-dialog']">
        <q-color
          v-model="color"
          no-header-tabs
          no-footer
          @update:model-value="colorUpdated"
          @change="colorChanged"
        />
      </q-popup-proxy>
    </button>

    <!-- <button>
      <img :src="'v2GeoConst3D/images/edit.svg'" />
    </button> -->
    <!-- 
      <button>
      <img :src="'v2GeoConst3D/images/hide.svg'" @click="hideItem"/>
    </button> -->

    <button @click="deleteItem">
      <img :src="'v2GeoConst3D/images/delete-forever.svg'" />
    </button>
  </div>
</template>

<script>
import CmdCreateGeometry from "../../core/commands/CmdCreateGeometry";
import Label from "../../core/graphics/Label";
import CmdSetProperty from "../../core/commands/CmdSetProperty";
import DefLabelForPoint from "../../core/definitions/labels/DefLabelForPoint";
import Point from "../../core/geometries/Point";

import * as util from "../../core/helper/util";

export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
      selectedItem: {},
      color: undefined,
      visible: false,
      point: undefined,
      label: undefined,
    };
  },

  created() {
    this.sceneStates = this.scene.states;
    this.selectedItem = this.scene.selectionManager.selectedItem;

    this.scene.on("control", () => {
      if (this.visible) {
        this.updateFramePosition();
      }
    });

    this.scene.on("wheel", () => {
      if (this.visible) {
        this.updateFramePosition();
      }
    });
  },

  watch: {
    selectedItem: function (newVal, oldVal) {
      if (oldVal && oldVal.isPoint) {
        // clean up
      }

      if (oldVal && oldVal.isPoint) {
        this.onClose();
      }

      if (!newVal) {
        this.visible = false;
        return;
      }

      if (newVal.isPoint) {
        /**
         * @type {Point}
         */
        this.point = newVal;
        this.color = this.point.color;
        this.prevColor = this.point.color;

        this.label = undefined;

        // search label
        for (let lb of this.scene.labels) {
          if (lb.definition.constructor === DefLabelForPoint) {
            const lbDef = lb.definition;

            if (lbDef.pointName === this.point.name) {
              this.$refs.inputLabel.value = lb.text ? lb.text : "";
              this.label = lb;
              break;
            }
          }
        }

        if (!this.label) {
          this.$refs.inputLabel.value = "";
        }

        this.$el.style.opacity = 0;

        this.visible = true;

        setTimeout(() => {
          this.updateFramePosition();
          this.$el.style.opacity = 1;
          this.$refs.inputLabel.setSelectionRange(
            this.$refs.inputLabel.value.length,
            this.$refs.inputLabel.value.length
          );
          this.$refs.inputLabel.focus();
        }, 0);
      }
    },
  },

  mounted() {},

  methods: {
    colorUpdated(value) {
      this.point.setColor(value);
      this.scene.requestRender();
    },

    colorChanged(value) {
      const cmd = new CmdSetProperty(this.point.name, "color", value, this.prevColor);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);
    },

    // hideItem(){

    //   const cmd = new CmdH(this.point.name);
    //   cmd.execute(this.scene);
    //   this.scene.addCommand(cmd);

    //   this.close();
    // },

    deleteItem() {
   
      this.scene.selectionManager.deleteSelectedItems();
      this.close();
      
    },

    updateFramePosition() {
      const pos = this.scene.getScreenCoordinate(this.point.position);

      pos.x += 10;
      pos.y += 15;

      this.$el.style.left = pos.x + "px";
      this.$el.style.top = pos.y + "px";

      const parentRect = this.$el.parentElement.getBoundingClientRect();
      const eleRect = this.$el.getBoundingClientRect();

      if (parentRect.right - 8 < eleRect.right) {
        const diff = Math.min(
          Math.abs(eleRect.right - (parentRect.right - 8)),
          eleRect.width
        );

        this.$el.style.left = pos.x - diff + "px";
      }
    },

    labelInputEnterPressed(e) {
      if (e.key !== "Enter") return;

      this.createCustomLabel(e);
      this.close();
      this.scene.requestRender();
    },

    createCustomLabel(e) {
      const labelText = e.target.value;

      if (labelText === "") return;

      if (this.label) {
        // edit
    
        const cmd = new CmdSetProperty(this.label.name, "text", labelText, this.label.text);
        cmd.execute(this.scene);

        this.scene.addCommand([cmd]);
      } else {
        // create

        const cmd = new CmdCreateGeometry(
          Label,
          new DefLabelForPoint(this.point.name, 0.35, this.getLabelAngle(this.point)),
          {
            isDynamicValue: false,
            vOffset: 0,
            hOffset: 0,
            vAlign: Label.V_ALIGN_CENTER,
            hAlign: Label.H_ALIGN_CENTER,
            text: labelText,
            label: "Label - " + labelText,
          }
        );
        this.label = cmd.execute(this.scene);
        this.scene.addCommand(cmd);

      }

      this.selectedItem.label = "Point - " + labelText;
      this.scene.requestRender();
    },

    getLabel() {
      return "A";
    },

    close() {
      this.scene.selectionManager.clearSelection();
    },

    onClose() {
      //
    },

    getLabelAngle(point) {
      return util.THREE_PI_BY_2;
    },
  },
};
</script>

<style scoped></style>
