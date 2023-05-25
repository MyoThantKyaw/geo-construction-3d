<template>
  <div class="toolbar-frame toolbar">
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

    <button @click="deleteItem">
      <img :src="'v2GeoConst3D/images/delete-forever.svg'" />
    </button>

    <!-- <button @click="scene.selectionManager.setEditingItem(segment)">
      <img :src="'v2GeoConst3D/images/setting.svg'" />
    </button> -->
  </div>
</template>

<script>
import { watch } from "vue";
import CmdSetProperty from "../../core/commands/CmdSetProperty";
import { Vector3 } from "three";

export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
      selectedItem: {},
      visible: false,
      color: undefined,
      isDyanmicLabel: false,
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
      if (oldVal && oldVal.isSegemnt) {
        // clean up
      }

      if (oldVal && oldVal.isSegemnt) {
        this.onClose();
      }

      if (!newVal) {
        this.visible = false;
        return;
      }

      if (newVal.isAngle) {
        this.angle = newVal;

        this.isDyanmicLabel = this.angle.isDyanmicLabel;
        this.$refs.inputLabel.value = this.angle.labelItem.text;

        this.$el.style.opacity = 0;

        this.color = this.angle.color;
        this.prevColor = this.angle.color;

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

  mounted() {
    watch(this.scene.selectionManager.selectedItem, () => {});
  },

  methods: {
    updateFramePosition() {
      let pos = this.scene.getScreenCoordinate(
        new Vector3(this.angle.pt2.x, this.angle.pt2.y, 0)
      );

      pos.x += 8;
      pos.y += 20;

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

    colorUpdated(value) {
      this.angle.setColor(value);
      this.scene.requestRender();
    },

    colorChanged(value) {
      const cmd = new CmdSetProperty(this.angle.name, "color", value, this.prevColor);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);
    },

    toggleIsDyanmicLabel() {
      this.isDyanmicLabel = !this.isDyanmicLabel;

      if (this.isDyanmicLabel) {
        const cmd = new CmdSetProperty(
          this.angle.name,
          "isDyanmicLabel",
          this.isDyanmicLabel,
          !this.isDyanmicLabel
        );
        cmd.execute(this.scene);
        this.scene.addCommand(cmd);
      } else {
        const oldlb = this.angle.labelItem.text;
        this.$refs.inputLabel.value = oldlb;

        setTimeout(() => {
          this.$refs.inputLabel.select();
          this.$refs.inputLabel.focus();
        }, 0);

        const cmd = new CmdSetProperty(
          this.angle.name,
          "isDyanmicLabel",
          this.isDyanmicLabel,
          !this.isDyanmicLabel
        );
        cmd.execute(this.scene);
        const cmd1 = new CmdSetProperty(this.angle.name, "text", oldlb, "");
        cmd1.execute(this.scene);

        this.scene.addCommand([cmd, cmd1]);
      }

      this.scene.requestRender();
    },

    labelInputEnterPressed(e) {
      if (e.key !== "Enter") return;
      e.target.blur();
      this.setCustomLabel(e);
      this.close();
      this.scene.requestRender();
    },

    setCustomLabel(e) {
      const labelText = e.target.value;

      const cmd = new CmdSetProperty(this.angle.name, "text", labelText, this.angle.text);
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
      if (this.isDyanmicLabel) {
        //
      } else {
        const label = this.$refs.inputLabel.value;
        if (label === "") {
          //
        } else {
          ///
        }
      }
    },
  },
};
</script>

<style scoped></style>
