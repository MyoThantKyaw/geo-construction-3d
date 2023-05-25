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
      <button :class="[{ active: isDyanmicLabel }]" @click="toggleSegmentLabelMode">
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

    <button @click="scene.selectionManager.setEditingItem(segment)">
      <img :src="'v2GeoConst3D/images/setting.svg'" />
    </button>
  </div>
</template>

<script>
import { watch } from "vue";
import CmdCreateGeometry from "../../core/commands/CmdCreateGeometry";
import DefLabelBetween2Points from "../../core/definitions/labels/DefLabelBetween2Points";
import Label from "../../core/graphics/Label";
import CmdSetProperty from "../../core/commands/CmdSetProperty";

export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
      selectedItem: {},
      visible: false,
      segment: undefined,
      label: undefined,
      isDyanmicLabel: false,
      color: undefined,
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

      if (newVal.isSegment) {
        this.segment = newVal;

        let isDyanmicLabel = false;
        this.label = undefined;

        // search label
        for (let lb of this.scene.labels) {
          if (lb.definition.constructor === DefLabelBetween2Points) {
            const lbDef = lb.definition;

            if (
              (lbDef.point1Name === this.segment.definition.point1Name &&
                lbDef.point2Name === this.segment.definition.point2Name) ||
              (lbDef.point2Name === this.segment.definition.point1Name &&
                lbDef.point1Name === this.segment.definition.point2Name)
            ) {
              if (lb.isDynamicValue) {
                isDyanmicLabel = true;
                this.$refs.inputLabel.value = "";
              } else {
                this.$refs.inputLabel.value = lb.text ? lb.text : "";
              }

              this.label = lb;

              break;
            }
          }
        }

        if (!this.label) {
          this.$refs.inputLabel.value = "";
        }

        this.isDyanmicLabel = isDyanmicLabel;
        this.color = this.segment.color;
        this.prevColor = this.segment.color;
        this.$el.style.opacity = 0;

        this.point1 = this.scene.getItemByName(this.segment.definition.point1Name);
        this.point2 = this.scene.getItemByName(this.segment.definition.point2Name);

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
      const pos1 = this.scene.getScreenCoordinate(this.point1.position);
      const pos2 = this.scene.getScreenCoordinate(this.point2.position);

      let pos = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };

      pos.x += 20;
      pos.y += 25;

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
      this.segment.setColor(value);
      this.scene.requestRender();
    },

    colorChanged(value) {
      const cmd = new CmdSetProperty(this.segment.name, "color", value, this.prevColor);
      cmd.execute(this.scene);
      this.scene.addCommand(cmd);
    },

    deleteItem() {
      this.scene.selectionManager.deleteSelectedItems();
      this.close();
    },

    toggleSegmentLabelMode() {
      this.isDyanmicLabel = !this.isDyanmicLabel;

      this.$refs.inputLabel.value = "";

      if (this.label) {

        const cmd = new CmdSetProperty(
          this.label.name,
          "isDynamicValue",
          this.isDyanmicLabel,
          !this.isDyanmicLabel
        );
        cmd.execute(this.scene);
        this.scene.addCommand(cmd);

        if (this.isDyanmicLabel) {
        } else {
          setTimeout(() => {
            this.$refs.inputLabel.focus();
          }, 0);
        }
      } else {
        // Create
        const cmd = new CmdCreateGeometry(
          Label,
          new DefLabelBetween2Points(this.point1.name, this.point2.name),
          {
            isDynamicValue: true,
            vOffset: 0.18,
            vAlign: Label.V_ALIGN_TOP,
          }
        );
        const label = cmd.execute(this.scene);

        this.label = label;

        this.scene.addCommand(cmd);
      }


      this.scene.requestRender();
    },

    labelInputEnterPressed(e) {
      if (e.key !== "Enter") return;

      this.createCustomLabel(e);
      this.close();
      this.scene.requestRender();
    },

    createCustomLabel(e) {

      const labelText = e.target.value;

      if(labelText === "") return;

      if (this.label) {
        // edit
        const cmd = new CmdSetProperty(this.label.name, "text", labelText, this.label.text);
        cmd.execute(this.scene);

        this.scene.addCommand([cmd]);
      } else {
        // create
        const cmd = new CmdCreateGeometry(
          Label,
          new DefLabelBetween2Points(this.point1.name, this.point2.name),
          {
            isDynamicValue: false,
            vOffset: 0.18,
            vAlign: Label.V_ALIGN_TOP,
            text: labelText,
            label: "Label - " + labelText,
          }
        );

        this.label = cmd.execute(this.scene);
        this.scene.addCommand(cmd);

      }

      // this.selectedItem.label = "Segment - " + labelText;
      this.scene.requestRender();
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
