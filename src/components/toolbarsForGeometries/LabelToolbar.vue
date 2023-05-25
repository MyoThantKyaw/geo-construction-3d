<template>
  <div class="toolbar-frame toolbar">
    <button>
      <img :src="'v2GeoConst3D/images/paint.svg'" />
      <q-popup-proxy
        :class="['geo-edit-toolbar-color-dialog']"
        @hide="colorChanged(color)"
      >
        <q-color
          v-model="color"
          no-header-tabs
          no-footer
          @update:model-value="colorUpdated"
        />
      </q-popup-proxy>
    </button>

    <div class="btn-group">
      <button
        v-if="lengthLabelAvailable"
        :class="[{ active: withLengthLabel }]"
        @click="toggleLabelMode"
      >
        <img :src="'v2GeoConst3D/images/mesurement_length.svg'" />
      </button>
      <input
        v-show="!withLengthLabel || !lengthLabelAvailable"
        ref="inputLabel"
        placeholder="Label"
        @keyup="labelInputEnterPressed"
      />
    </div>

    <button v-if="isFlippable" @click="flipSide">
      <img :src="'v2GeoConst3D/images/flip-side.svg'" />
    </button>

    <button @click="deleteItem">
      <img :src="'v2GeoConst3D/images/delete-forever.svg'" />
    </button>
    <button @click="scene.selectionManager.setEditingItem(this.label)">
      <img :src="'v2GeoConst3D/images/setting.svg'" />
    </button>
  </div>
</template>

<script>
import { watch } from "vue";
import DefLabelBetween2Points from "../../core/definitions/labels/DefLabelBetween2Points";
import CmdRemoveGeometry from "../../core/commands/CmdRemoveGeometry";
import CmdSetProperty from "../../core/commands/CmdSetProperty";
import DefLabelBetween2StaticPoints from "../../core/definitions/labels/DefLabelBetween2StaticPoints";
import CmdFlipSideOfLabel from "../../core/commands/label/CmdFlipSideOfLabel";

export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
      selectedItem: {},
      visible: false,
      label: undefined,
      color: undefined,
      withLengthLabel: false,
      lengthLabelAvailable: false,
      isFlippable: false,
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
      if (oldVal && oldVal.isLabel) {
        // clean up
      }

      if (oldVal && oldVal.isLabel) {
        this.onClose();
      }

      if (!newVal) {
        this.visible = false;
        return;
      }

      if (newVal.isLabel) {
        this.label = newVal;
        this.labelDef = this.label.definition;

        this.color = this.label.color;
        this.prevColor = this.label.color;

        const lbDefConstru = this.label.definition.constructor;
        this.isFlippable =
          lbDefConstru === DefLabelBetween2StaticPoints ||
          lbDefConstru === DefLabelBetween2Points;

        this.lengthLabelAvailable = this.labelDef.constructor === DefLabelBetween2Points;

        this.$refs.inputLabel.value = this.label.isDynamicValue
          ? ""
          : this.label.text
          ? this.label.text
          : "";

        this.withLengthLabel = this.label.isDynamicValue;

        this.$el.style.opacity = 0;

        this.visible = true;

        setTimeout(() => {
          this.updateFramePosition();
          this.$el.style.opacity = 1;
          // this.$refs.inputLabel.setSelectionRange(
          //   this.$refs.inputLabel.value.length,
          //   this.$refs.inputLabel.value.length
          // );
          // this.$refs.inputLabel.focus();
        }, 0);
      }
    },
  },

  mounted() {
    watch(this.scene.selectionManager.selectedItem, () => {});
  },

  methods: {
    colorUpdated(value) {
      this.label.setColor(value);
      this.scene.requestRender();
    },

    colorChanged(value) {
      if (value === this.prevColor) return;

      const cmd = new CmdSetProperty(this.label.name, "color", value, this.prevColor);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);
    },
    updateFramePosition() {
      let pos = this.scene.getScreenCoordinate(this.label.position.clone());

      pos.x += 8;
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

    toggleLabelMode() {
      this.withLengthLabel = !this.withLengthLabel;

      if (this.withLengthLabel) {
        this.$refs.inputLabel.value = "";
      } else {
        this.$refs.inputLabel.value = this.label.text;
        this.$refs.inputLabel.focus();
        setTimeout(() => {
          this.$refs.inputLabel.select();
        }, 0);
      }

      const cmd = new CmdSetProperty(
        this.label.name,
        "isDynamicValue",
        this.withLengthLabel,
        !this.withLengthLabel
      );
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);

      this.scene.requestRender();
    },

    labelInputEnterPressed(e) {
      if (e.key !== "Enter") return;
      this.inputBlurred(e);
      this.close();
      this.scene.requestRender();
    },

    inputBlurred(e) {
      this.editLabel(e);
    },

    editLabel(e) {
      const labelText = e.target.value;

      if (labelText === "") return;

      if (labelText === this.label.text) return;

      const cmd = new CmdSetProperty(this.label.name, "text", labelText, this.label.text);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);

      this.scene.requestRender();
    },

    flipSide() {
      const cmd = new CmdFlipSideOfLabel(this.label.name);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);

      this.scene.requestRender();
    },

    deleteItem() {
      this.scene.selectionManager.deleteSelectedItems();
      this.close();
    },

    close() {
      this.scene.selectionManager.clearSelection();
    },

    onClose() {
      if (!this.withLengthLabel && this.$refs.inputLabel.value === "") {
        const cmd = new CmdRemoveGeometry(this.label.name);
        cmd.execute(this.scene);
        this.scene.addCommand(cmd);
        this.scene.requestRender();
      }
    },
  },
};
</script>

<style scoped></style>
