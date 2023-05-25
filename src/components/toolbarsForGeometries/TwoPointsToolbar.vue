<template>
  <div class="toolbar-frame toolbar">
    <div class="btn-group">
      <button :class="[{ active: isDyanmicLabel }]" @click="toggleIsDyanmicLabel">
        <img :src="'v2GeoConst3D/images/mesurement_length.svg'" />
      </button>
      <input
        v-show="!isDyanmicLabel"
        ref="inputLabel"
        placeholder="Label"
        @keyup="labelInputEnterPressed"
      />
    </div>

    <button v-if="labelName" @click="flipSide">
      <img :src="'v2GeoConst3D/images/flip-side.svg'" />
    </button>
  </div>
</template>

<script>
import CmdCreateGeometry from "../../core/commands/CmdCreateGeometry";
import Label from "../../core/graphics/Label";
import CmdRemoveGeometry from "../../core/commands/CmdRemoveGeometry";
import CmdSetProperty from "../../core/commands/CmdSetProperty";
import DefLabelBetween2Points from "../../core/definitions/labels/DefLabelBetween2Points";

import * as util from "../../core/helper/util";
import CmdFlipSideOfLabel from '../../core/commands/label/CmdFlipSideOfLabel';

export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
      selectedItems: {},
      color: undefined,
      visible: false,
      point1: undefined,
      point2: undefined,
      isDyanmicLabel: false,
      labelName: undefined,
      label: undefined,
    };
  },

  created() {
    this.sceneStates = this.scene.states;
    this.selectedItems = this.scene.selectionManager.selectedItems;

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
    selectedItems: {
      handler(newVal, oldVal) {
        if (this.selectedItems.length !== 2 || !(this.selectedItems[0].isPoint && this.selectedItems[1].isPoint)) {
          this.onClose();
          this.visible = false;
          return;
        }

        const point1 = this.selectedItems[0];
        const point2 = this.selectedItems[1];

        this.point1 = point1;
        this.point2 = point2;

        // find label...
        this.$el.style.opacity = 0;
        this.visible = true;

        this.labelName = undefined;

        this.$refs.inputLabel.value = "";
        this.isDyanmicLabel = false;

        setTimeout(() => {
          this.updateFramePosition();
          this.$el.style.opacity = 1;
          this.$refs.inputLabel.focus();
        }, 0);
      },
      deep: true,
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

    deleteItem() {
      this.scene.selectionManager.deleteSelectedItems();
      this.close();
    },

    updateFramePosition() {
      const pos1 = this.scene.getScreenCoordinate(this.point1.position);
      const pos2 = this.scene.getScreenCoordinate(this.point2.position);

      let pos = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };

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

      if (labelText === "") {
        if (this.labelName) {
          //delete
          const cmd = new CmdRemoveGeometry(this.labelName);
          cmd.execute(this.scene);
          this.labelName = undefined;
          this.scene.addCommand(cmd);
        }
        return;
      }

      if (this.labelName) {
        const cmd = new CmdSetProperty(
          this.labelName,
          "text",
          labelText,
          this.labelName.text
        );
        cmd.execute(this.scene);
        this.scene.addCommand([cmd]);
      } else {
        // create
        const cmd = new CmdCreateGeometry(
          Label,
          new DefLabelBetween2Points(this.point2.name, this.point1.name),
          {
            isDynamicValue: this.isDyanmicLabel,
            vOffset: 0.18,
            vAlign: Label.V_ALIGN_TOP,
            text: labelText,
          }
        );
        const label = cmd.execute(this.scene);
        this.labelName = label.name;

        this.scene.addCommand(cmd);
      }

      this.scene.requestRender();
    },

    toggleIsDyanmicLabel() {
      this.isDyanmicLabel = !this.isDyanmicLabel;

      this.$refs.inputLabel.value = "";

      const cmds = [];

      if (this.labelName) {
        // delete
        const cmd = new CmdRemoveGeometry(this.labelName);
        cmd.execute(this.scene);
        this.labelName = undefined;

        cmds.push(cmd);
      }
      if (this.isDyanmicLabel) {
        // Create
        const cmd = new CmdCreateGeometry(
          Label,
          new DefLabelBetween2Points(this.point2.name, this.point1.name),
          {
            isDynamicValue: true,
            vOffset: 0.18,
            vAlign: Label.V_ALIGN_TOP,
          }
        );
        const label = cmd.execute(this.scene);

        this.labelName = label.name;

        cmds.push(cmd);
      }
      else{
        setTimeout(() => {
          this.$refs.inputLabel.focus();
        }, 0);
      }

      this.scene.addCommand(cmds);
      this.scene.requestRender();

    },

    flipSide() {
      const cmd = new CmdFlipSideOfLabel(this.labelName);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);

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
