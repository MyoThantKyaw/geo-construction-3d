<template>
  <div class="toolbar-frame toolbar">
    <div class="btn-group">
      <img :src="'v2GeoConst3D/images/text.svg'" />
      <input ref="inputLabel" placeholder="Label" @keyup="labelInputEnterPressed" />
    </div>

    <button @click="createIntersctionPoint">
      <img :src="'v2GeoConst3D/images/point-1.svg'" />
    </button>
  </div>
</template>

<script>
import { watch } from "vue";
import CmdCreateGeometry from "../../core/commands/CmdCreateGeometry";
import Label from "../../core/graphics/Label";
import CmdSetProperty from "../../core/commands/CmdSetProperty";

import DefLabelForPoint from "../../core/definitions/labels/DefLabelForPoint";
import Point from "../../core/geometries/Point";
import { Vector3 } from "three";
import DefPointOnIntersection from "../../core/definitions/points/DefPointOnIntersection";
import IntersectionPoint from "../../core/geometryConstructors/materials/IntersectionPoint";

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
      if (oldVal && oldVal.isIntersectionPt) {
        this.onClose();
      }

      if (!newVal) {
        this.visible = false;
        return;
      }

      if (newVal.isIntersectionPt) {
        /**
         * @type {IntersectionPoint}
         */
        this.pt = newVal;

        this.$refs.inputLabel.value = "";

        this.$el.style.opacity = 0;

        this.visible = true;

        this.scene.saveCommandIndex();

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

  mounted() {
    watch(this.scene.selectionManager.selectedItem, () => {});
  },

  methods: {
    updateFramePosition() {
      const pos = this.scene.getScreenCoordinate(
        new Vector3(this.pt.position.x, this.pt.position.y, 0)
      );

      pos.x += 8;
      pos.y += 10;

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
      e.target.blur();
      this.createCustomLabel(e);
      this.close();
      this.scene.requestRender();
    },

    createCustomLabel(e) {

      const labelText = e.target.value;

      if (labelText === "") {
        this.scene.restoreCommandIndex();
        this.point = this.label = undefined;

        this.scene.requestRender();

        return;
      }

      if (this.pointName) {
        // edit
        const label = this.scene.getItemByName(this.labelName);

        const cmd = new CmdSetProperty(label.name, "text", labelText, label.text);
        cmd.execute(this.scene);

        this.scene.addCommand([cmd]);
      } else {
        // create point
        const cmds = [];

        const cmd = new CmdCreateGeometry(
          Point,
          new DefPointOnIntersection(
            this.pt.item1.name,
            this.pt.item2.name,
            this.pt.ptIndex
          ),
          {}
        );

        this.point = cmd.execute(this.scene);
        cmds.push(cmd);

        // create label
        const cmd1 = new CmdCreateGeometry(
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

        this.label = cmd1.execute(this.scene);

        cmds.push(cmd1);

        this.scene.addCommand(cmds);
      }

      this.selectedItem.label = "Point - " + labelText;
      this.scene.requestRender();
    },

    createIntersctionPoint(e) {
      const cmd = new CmdCreateGeometry(
        Point,
        new DefPointOnIntersection(
          this.pt.item1.name,
          this.pt.item2.name,
          this.pt.ptIndex
        )
      );

      cmd.execute(this.scene);
      this.scene.addCommand(cmd);

      this.close();
    },

    close() {
      this.scene.selectionManager.clearSelection();
    },

    onClose() {
      
      this.pt.delete();
      this.scene.updateIntersectionPts();
      this.scene.requestRender();
    },

    getLabelAngle(point) {
      return util.THREE_PI_BY_2;
    },
  },
};
</script>

<style scoped></style>
