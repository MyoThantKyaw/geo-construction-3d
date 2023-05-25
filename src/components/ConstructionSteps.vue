<template>
  <div class="expansion-container">
    <div id="constr-steps-toolbar" class="toolbar">
      <button
        v-show="sceneStates.inEditMode"
        :class="[{ disabled: !nextStepAvailable }]"
        @click="scene.constructionStepManager.addNewStep()"
      >
        <img :src="'v2GeoConst3D/images/plus.svg'" />
      </button>
      <button
        :class="[
          {
            disabled:
              states.playMode === 'all' ||
              (sceneStates.constructionSteps.length === 1 &&
                !sceneStates.constructionSteps[0].isValid) ||
              sceneStates.constructionSteps.length === 0,
          },
        ]"
        @click="scene.constructionStepManager.drawAllSteps()"
      >
        <img :src="'v2GeoConst3D/images/play.svg'" />
      </button>

      <button
        @click="scene.constructionStepManager.showCompleteSteps()"
        :class="[{ disabled: sceneStates.mode !== 'play' || noIndices }]"
      >
        <img :src="'v2GeoConst3D/images/complete-list.svg'" />
      </button>

      <button
        @click="scene.constructionStepManager.stopPlaying()"
        :class="[{ disabled: states.animatingStepIndex === undefined }]"
      >
        <img :src="'v2GeoConst3D/images/stop-1.svg'" />
      </button>

      <div style="flex-grow: 1"></div>

      <button>
        <img :src="'v2GeoConst3D/images/menu.svg'" />

        <q-menu
          class="steps-toolbar-menu"
          transition-show="jump-down"
          transition-hide="jump-down"
        >
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup class="file-upload-constructions">
              <img :src="'v2GeoConst3D/images/import.svg'" />
              <q-item-section>
                Import Construction Steps
                <input
                  @change="fileUploaded($event)"
                  type="file"
                  id="myFile"
                  name="filename"
              /></q-item-section>
            </q-item>

            <q-item clickable @click="exportConstructionSteps" v-close-popup>
              <q-icon :size="'xs'" name="download" class="q-mr-sm" />
              <q-item-section text-caption>Export Constructions Steps</q-item-section>
            </q-item>

            <q-item
              @click="resetImportedSteps"
              v-if="sceneStates.importedData"
              clickable
              v-close-popup
            >
              <q-icon :size="'xs'" name="refresh" class="q-mr-sm" />
              <q-item-section> Reset Imported Steps </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </div>

    <div ref="stepRows" class="constr-steps-rows">
      <div ref="stepExpansionsContainer">
        <q-expansion-item
          v-for="(step, index) in scene.constructionStepManager.validSteps"
          :key="step"
          expand-icon-toggle
          expand-separator
          icon="draw"
          :id="'step-' + index"
          dense
          default-opened
          @dragover="allowDrop($event, index)"
          @drop="groupRowDroppedOnStep($event, index)"
          :class="[
            'expansion',
            'step-q-expansion',
            'command-list-row',
            {
              'animating-border': states.animatingStepIndex === index,
            },
            { 'empty-step': step.commandGroupNames.length === 0 },
          ]"
        >
          <template v-slot:header>
            <div
              :class="['expansion-header']"
              @click="scene.constructionStepManager.goToParticularStep(index)"
            >
              <div class="cmd-desc">
                {{ "အဆင့် (" + mmNums[index + 1] + ")" }}
              </div>
            </div>

            <div
              class="step-action-toolbar"
              v-show="scene.constructionStepManager.validSteps[index].isValid"
            >
              <button
                v-show="stepManagerStates.animatingStepIndex !== index"
                class="btn-animate-draw"
                @click="scene.constructionStepManager.drawParticularStep(index, $event)"
              >
                <img :src="'v2GeoConst3D/images/play.svg'" />
              </button>
            </div>

            <button class="btn-remove btn-transparent" @click="removeLastRow">
              <q-icon name="close" :color="'black'" />
            </button>
          </template>
          <div class="no-item-info" v-if="step.commandGroupNames.length === 0">
            <img :src="'v2GeoConst3D/images/info-circle.svg'" /> ဆောက်လုပ်ချက်များ
            မရှိသေးပါ
          </div>

          <div class="step-info">
            <div class="drawers-in-step">
              <div
                v-for="(name, groupIndex) in step.commandGroupNames"
                :key="name"
                :class="[
                  'drawer-in-step',
                  {
                    visible:
                      (stepManagerStates.currentGroupIndex === undefined &&
                        stepManagerStates.currentStepIndex === undefined) ||
                      (stepManagerStates.currentGroupIndex === undefined &&
                        stepManagerStates.currentStepIndex === index) ||
                      stepManagerStates.currentStepIndex > index ||
                      (stepManagerStates.currentStepIndex === index &&
                        stepManagerStates.currentGroupIndex >= groupIndex),
                  },
                ]"
                @dragstart="
                  groupRowDragStarted(
                    $event,
                    index,
                    groupIndex,
                    step.commandGroupNames.length
                  )
                "
                :draggable="
                  (groupIndex === 0 && index !== 0) ||
                  groupIndex === step.commandGroupNames.length - 1
                "
              >
                <div
                  v-if="name.isValid"
                  :class="[
                    'cmd-group-row',
                    {
                      'active-group': currentActiveGroup(index, groupIndex),
                      'animating-group': currentAnimatingGroup(index, groupIndex),
                    },
                  ]"
                  :id="'step-' + index + '-group-' + groupIndex"
                  @click="
                    scene.constructionStepManager.goToCommandGroupInStep(
                      index,
                      groupIndex,
                      $event
                    )
                  "
                >
                  <!-- <div style="display :content;"> -->
                  <svg
                    style="width: .9em; height: .9em"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M512 142.72l320 172.32v393.824l-320 172.32-320-172.32V315.04L512 142.72z m288 211.456l-272 147.616v334.336l272-146.4V354.176z m-576 0.032v335.52l271.968 146.4V501.792L224 354.208z m288-175.136l-272.896 146.912L512 474.112l272.896-148.128L512 179.072z"
                      fill="#666666"
                    />
                  </svg>
                  <div class="command-row-action-panel-in-step">
                    <button
                      class="btn-animate-draw"
                      @click="
                        scene.constructionStepManager.drawSingleGroup(
                          index,
                          groupIndex,
                          $event
                        )
                      "
                    >
                      <img :src="'v2GeoConst3D/images/play.svg'" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <textarea
              spellcheck="false"
              placeholder="Instructions"
              rows="1"
              :class="[
                'step-desc',
                {
                  editing: states.descEditingStepIndex === index,
                },
              ]"
              @input="auto_grow($event)"
              contenteditable="true"
              v-model="step.description"
              @blur="stepDescBlurred($event, step)"
              v-if="step.commandGroupNames.length > 0"
            >
            </textarea>
          </div>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw, warn, nextTick } from "vue";

import * as util from "../core/helper/util";

import * as scrollIntoView from "scroll-into-view";

import ConstructionStep from "../core/animation/ConstructionStep";

export default {
  props: {
    scene_: {},
  },

  data() {
    return {
      sceneStates: {},
      states: {},
      stepManagerStates: {},
      scene: this.scene_,
      mmNums: markRaw(["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"]),
    };
  },

  created() {
    this.sceneStates = this.scene.states;
    this.states = this.scene.constructionStepManager.states;
    this.stepManagerStates = this.scene.constructionStepManager.states;
  },

  updated() {},

  mounted() {
    this.scene.constructionStepView = this;

    nextTick(() => {
      for (let textarea of this.$el.querySelectorAll(".step-desc")) {
        textarea.dispatchEvent(new Event("input"));
      }
    });
  },

  computed: {
    nextStepAvailable() {
      // console.log("gg ", (this.scene.constructionStepManager.validSteps.length === 0 ||
      //   !this.sceneStates.constructionSteps[this.sceneStates.constructionSteps.length - 1]
      //     .isValid));
      return (
        this.scene.constructionStepManager.validSteps.length === 0 ||
        this.scene.constructionStepManager.validSteps[
          this.scene.constructionStepManager.validSteps.length - 1
        ].isValid
      );
    },

    noIndices() {
      return (
        this.states.animatingStepIndex === undefined &&
        this.states.animatingGroupIndex === undefined &&
        this.states.currentStepIndex === undefined &&
        this.states.currentGroupIndex === undefined
      );
    },
  },

  methods: {
    fileUploaded(e) {
      const uploadedFile = e.target.files[0];

      // if (
      //   uploadedFile.type !== "text/javascript"

      // ) {
      //   alert("Wrong file type == " + uploadedFile.type);
      //   return false;
      // }

      if (uploadedFile) {
        this.$q.loading.show({
          message: "ခေတ္တစောင့်ပါ ...",
        });

        if (this.currentFetchingExample) {
          this.currentFetchingExample.abortController.abort();
          this.currentFetchingExample = undefined;
        }

        const readFile = new FileReader();
        readFile.onload = (e) => {
          const contents = e.target.result;
          const json = JSON.parse(contents);

          this.scene.importConstructionSteps(json);

          this.$q.loading.hide();

        };
        readFile.readAsText(uploadedFile);
      } else {
        console.log("Failed to load file");
      }
    },

    groupRowDragStarted(e, stepIndex, groupIndex, noOfGroups) {
      e.dataTransfer.setData("stepIndex", stepIndex);
      e.dataTransfer.setData("groupIndex", groupIndex);

      this.draggedStepIndex = stepIndex;
      this.draggedGroupIndex = groupIndex;
      this.draggedStepNoOfGroups = noOfGroups;
    },

    allowDrop(e, stepIndex) {
      // console.log('this.draggedStepIndex ', stepIndex, this.draggedStepIndex, this.draggedGroupIndex, );

      if (this.draggedStepNoOfGroups === 1 && this.draggedGroupIndex === 0) {
        if (Math.abs(this.draggedStepIndex - stepIndex) === 1) {
          e.preventDefault();
        }
      } else {
        if (this.draggedGroupIndex === 0) {
          if (this.draggedStepIndex - stepIndex === 1) e.preventDefault();
        } else {
          if (stepIndex - this.draggedStepIndex === 1) e.preventDefault();
        }
      }
    },

    groupRowDroppedOnStep(e, stepIndex) {
      e.preventDefault();

      // stepIndex

      if(this.stepManagerStates.currentStepIndex !== undefined){
        // 
        this.scene.constructionStepManager.showCompleteSteps()
      }

      const movedStepIndex = parseInt(e.dataTransfer.getData("stepIndex"));
      const movedGroupIndex = parseInt(e.dataTransfer.getData("groupIndex"));

      // console.log("movedStepIndex ", movedStepIndex);

      if (stepIndex === movedStepIndex) return;

      const receivingStep = this.scene.constructionStepManager.steps[stepIndex];
      const movedStep = this.scene.constructionStepManager.steps[movedStepIndex];
      const movedGroupName = movedStep.commandGroupNames[movedGroupIndex];

      let newGroupIndex;

      // console.warn("movedGroupIndex ", movedGroupIndex);

      if (movedGroupIndex === 0) {

        console.log(movedStepIndex,  stepIndex);

        if(movedStepIndex < stepIndex){
          receivingStep.insertCommandGroupName(0, movedGroupName );
          newGroupIndex = 0;
        }
        else{
          receivingStep.insertCommandGroupName(receivingStep.commandGroupNames.length, movedGroupName );
          newGroupIndex = receivingStep.commandGroupNames.length - 1;
        }

      } else if (movedGroupIndex === movedStep.commandGroupNames.length - 1) {
        receivingStep.insertCommandGroupName(0, movedGroupName);
        newGroupIndex = 0;
      }

      // if (
      //   this.stepManagerStates.currentStepIndex === movedStepIndex &&
      //   this.stepManagerStates.currentGroupIndex === movedGroupIndex
      // ) {

      //   this.stepManagerStates.currentStepIndex = stepIndex;
      //   this.stepManagerStates.currentGroupIndex = newGroupIndex;

      // } else if (
      //   this.stepManagerStates.currentStepIndex === stepIndex &&
      //   movedGroupIndex === movedStep.commandGroupNames.length - 1
      // ) {

      //   this.stepManagerStates.currentGroupIndex = this.stepManagerStates.currentGroupIndex + 1;

      //   if (movedStep.commandGroupNames.length === 1) {
      //     this.stepManagerStates.currentStepIndex = movedStepIndex;
      //   }

      // }

      movedStep.removeCommandGroupName(movedGroupName);
      this.scene.constructionStepManager.updateGroupStatus();
    
    },

    stepDescBlurred(e, step) {
      step.description = e.target.value;
    },

    editStepDec(stepIndex) {
      if (!this.$refs.stepRows) return;

      if (this.sceneStates.constructionSteps[stepIndex].commandGroupNames.length === 0)
        return;

      this.states.descEditingStepIndex = stepIndex;

      let ele = this.$refs.stepRows.querySelector("#step-" + stepIndex);

      if (!ele) return;

      ele = ele.querySelector(".step-desc");

    },

    getCommandGroupName(name) {
      const g = this.sceneStates.animationCommandsStack.find((ele) => ele.name === name);
      if (g) {
        return g.description;
      }
    },

    currentActiveGroup(index, groupIndex) {
      return (
        (this.states.animatingGroupIndex === undefined &&
          this.states.animatingStepIndex === undefined &&
          this.states.currentGroupIndex === groupIndex &&
          this.states.currentStepIndex === index) ||
        (!this.states.playMode &&
          this.states.currentStepIndex === index &&
          this.states.currentGroupIndex === undefined)
      );
    },

    currentAnimatingGroup(index, groupIndex) {
      return (
        this.states.animatingGroupIndex === groupIndex &&
        this.states.animatingStepIndex === index
      );
    },

    scrollToStep(stepIndex, options = {}) {

      if (!this.$refs.stepRows) return;

      const waitToUpdate = options.waitToUpdate || false;
      const align = options.align || "top";
      const duration = options.duration || 500;

      const scroll = () => {
        const ele = this.$refs.stepRows.querySelector("#step-" + stepIndex);

        if (!ele) return;

        const parentBBox = this.$refs.stepRows.getBoundingClientRect();
        const eleBBox = ele.getBoundingClientRect();

        if (eleBBox.top - 7 > parentBBox.top && eleBBox.bottom < parentBBox.bottom) {
          return;
        }

        scrollIntoView(ele, {
          ease: util.easingSmooth,
          time: duration,
          align: {
            top: align === "top" ? 0 : 1,
            topOffset: align === "top" ? 7 : -10,
          },
        });
      };

      if (waitToUpdate) {
        this.$nextTick(() => {
          scroll();
        });
      } else {
        scroll();
      }
    },

    scrollToGroup(stepIndex, groupIndex) {
      if (!this.$refs.stepRows) return;

      const ele = this.$refs.stepRows.querySelector(
        "#step-" + stepIndex + "-group-" + groupIndex
      );

      if (!ele) return;

      const parentBBox = this.$refs.stepRows.getBoundingClientRect();
      const eleBBox = ele.getBoundingClientRect();

      if (eleBBox.top - 7 > parentBBox.top && eleBBox.bottom < parentBBox.bottom) {
        return;
      } else if (eleBBox.top - 7 <= parentBBox.top) {
        scrollIntoView(ele, {
          top: 0,
          topOffset: 0,
        });
      } else {
        scrollIntoView(ele, {
          top: 1,
          topOffset: 0,
        });
      }
    },

    exportConstructionSteps() {
      this.scene.exportConstructionSteps();
    },

    auto_grow(e) {
      e.target.style.height = "auto";
      if (e.target.scrollHeight > e.target.parentElement.getBoundingClientRect().height) {
        e.target.style.height = (e.target.scrollHeight + 5) + "px";
      }
    },

    resetImportedSteps() {
      this.scene.importConstructionSteps(this.scene.states.importedData);
      this.scene.requestRender();
    },

    removeLastRow() {
      this.scene.constructionStepManager.removeStep(
        this.scene.constructionStepManager.steps[
          this.scene.constructionStepManager.steps.length - 1
        ]
      );
    },
  },
};
</script>

<style scoped>
.expansion-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 5px;
  overflow-x: hidden;
}

.step-q-expansion {
  border-radius: 4px;
  margin: 1px 3.5% 12px 3.5%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #00264407;
  border: 1px solid #00000030;
}

#constr-steps-toolbar {
  display: flex;
  flex-direction: row;
  padding: 0 0px 0 10px;
}

.step-row-header {
  display: flex;
  flex-grow: 1;
  cursor: pointer;
  align-items: stretch;
  font-size: 0.85rem;
  padding: 0px 10px 0px 9px;
  box-sizing: border-box;
  min-height: 42px;
}

.constr-steps-rows {
  overflow: auto;
  position: relative;
}

.constr-steps-rows .expansion-header {
  font-weight: bold;
  color: #444;
  align-items: center;
  font-size: 0.75rem;
}

.empty-step .expansion-header {
  pointer-events: none;
}

.step-info {
  display: flex;
}

.drawers-in-step{
  padding: 8px 0 8px 0;
}

.drawer-in-step {
  width: 35px;
  display: flex;
  flex-direction: column;
}

.drawer-in-step .cmd-group-row {
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relatives;
  border-left: 3px solid transparent;
}

.drawer-in-step .cmd-group-row > svg path {
  height: 10px;
  opacity: 0.4;
  fill: #444;
}

.drawer-in-step.visible .cmd-group-row path {
  opacity: 1;
}

.drawer-in-step .cmd-group-row.active-group {
  border-left-color: #f62d00 !important;
}

.drawer-in-step .cmd-group-row.active-group path {
  fill: #f62d00 !important;
}

.drawer-in-step .cmd-group-row.animating-group {
  border-left-color: #008bf5b6 !important;
}

.drawer-in-step .cmd-group-row.animating-group path {
  fill: #008bf5 !important;
}

.step-info .step-desc {
  flex-grow: 1;
  padding: 5px 5px 4px 8px;
  font-size: 0.87rem;
  border-left: 1px solid #00000020;
  line-height: 1.7rem;
}

.step-row-header img.header-icon {
  width: 13px;
  margin-right: 10px;

  margin-top: 13px;
  align-self: flex-start;
  opacity: 0.7;
}

.step-row-header .cmd-desc {
  margin: 8px 0;
}

.constr-steps-toolbar {
  height: 30px;
  display: flex;
  align-items: center;
}

.cmd-group-row {
  position: relative;
  display: flex;
  cursor: pointer;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.step-desc {
  flex-grow: 1;
  width: stretch;
  outline: none;
  margin: 5px 5px 5px 0px;
  border: none;
  border: 1px solid transparent;
  border-radius: 0px;
  background: transparent;
  resize: none;
  overflow: hidden;
}

.step-desc:focus {
  border-color: rgba(41, 41, 41, 0.527) !important;
}

.step-desc.editing {
  padding: 5px 4px;
  cursor: auto;
  border: 1px solid rgb(17, 17, 17);
  border-radius: 5px !important;
}

.step-desc:focus{
  border-radius: 5px !important;
}

.cmd-group-row:focus {
  /* background: cadetblue; */
}

.btn-animate-draw {
  height: 100%;
  background-color: transparent;
}

.btn-animate-draw:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

button.btn-animate-draw img {
  height: 16px !important;
  opacity: 0.8;
  background-color: transparent;
}

.command-row-action-panel,
.command-row-action-panel-in-step {
  align-self: stretch;
  display: flex;
  align-items: stretch;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.command-row-action-panel-in-step {
  position: absolute;
  right: -35px;
  background: #ffffff;
  height: 100%;
}

.cmd-group-row:hover .command-row-action-panel-in-step {
  display: flex;
  opacity: 1;
  pointer-events: all;
}

.command-row-action-panel-in-step button {
  background-color: transparent;
}

.icon-ani-group-index-status {
  position: absolute;
  left: 6px;
  top: 7px;
  font-weight: bold;
  font-size: 11px;
}

.btn-remove {
  display: none;
  background-color: transparent;
  width: 35px;
  font-size: 0.7rem;
}

.btn-remove i {
  color: #000000aa !important;
}

.expansion.empty-step .btn-remove {
  display: inline-block;
}

.step-action-toolbar{
  opacity: .3;
}

.step-action-toolbar:hover{
  opacity: 1;
}

.step-action-toolbar button{
  width: 38px;
}
.step-action-toolbar button img{
  width: 13px;
}

</style>

<style>
.step-q-expansion.q-expansion-item .q-item {
  margin: 0 5px 0 5px;
  transition: all 0.1s ease;
  position: relative;
  padding: 0 !important;
}

.step-q-expansion .q-item {
  background-color: #6969690a;
  box-shadow: rgba(0, 0, 0, 0.01) 0px 1px 3px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px;
}

.constr-steps-rows hr {
  display: none !important;
}

.animating-border {
  border-color: #007fe0 !important;
}
@keyframes border-dance {
  0% {
    background-position: left top, right bottom, left bottom, right top;
  }
  100% {
    background-position: left 10px top, right 10px bottom, left bottom 10px,
      right top 10px;
  }
}
</style>

<style>
.expansion.empty-step .q-item__section--side {
  display: none !important;
}
</style>
