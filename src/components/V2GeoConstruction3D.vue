<template>
  <div
    :class="[
      'geo-constrct-3d-container',
      {
        'view-mode': !inEditMode,
        'layout-horizontal': isLayoutHorizontal,
        'layout-vertical': !isLayoutHorizontal,
      },
    ]"
  >
    <Transition name="fade">
      <div
        v-if="!isSreenSizeOk && !screenSizeInfoMsgScreenShown"
        class="screen-size-messages"
      >
        <div>
          Sorry. Screen size is too small for <b>Construction Mode</b>. Please open in
          desktop browsers.
        </div>
        <div>You can play examples in <b>Presentation Mode</b>.</div>

        <div v-show="!isPointerOk" class=""></div>
        <button
          :class="[{ disabled : !sceneStates.ready}]"
          @click="
            enterPresentationMode();
            screenSizeInfoMsgScreenShown = true;
          "
          id="btn-enter-presentation-mode"
        >
          Enter Presentation Mode
        </button>
      </div>
    </Transition>

    <div style="z-index: 2">
      <div class="toolbar" v-if="false">
        <div style="flex-grow: 1"></div>

        <div>
          <div style="flex-grow: 1"></div>
          <q-chip
            outline
            square
            color="grey-8"
            size="12px"
            text-color="white"
            style="border-radius: 10px"
          >
            <q-icon name="draw" color="grey-8" size="16px" />
            {{ sceneStates.mode === "play" ? "Playing" : "Drawing" }}
          </q-chip>
        </div>
      </div>

      <div class="top-panel">
        <q-toolbar>
          <q-btn flat size="md" id="btn-menu">
            <q-icon size="sm" name="menu" />

            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 100px">
                <q-item
                  v-show="isDesktop && !inEditMode"
                  @click="enterEditMode"
                  clickable
                  v-close-popup
                >
                  <q-icon :size="'xs'" name="edit" class="q-mr-sm" />
                  <q-item-section>Enter Construction Mode</q-item-section>
                </q-item>

                <q-item
                  v-show="isDesktop && inEditMode"
                  @click="enterPresentationMode"
                  clickable
                  v-close-popup
                >
                  <q-icon :size="'xs'" name="ondemand_video" class="q-mr-sm" />
                  <q-item-section>Enter Presentation Mode</q-item-section>
                </q-item>

                <q-item clickable>
                  <q-icon :size="'xs'" name="list" class="q-mr-sm" />

                  <q-item-section> Examples </q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>

                  <q-menu>
                    <q-list>
                      <q-item
                        @click="openExample(example)"
                        clickable
                        v-close-popup
                        v-for="example in examples"
                        :key="example"
                        class="example-list"
                      >
                        <img class="ex-thumb" :src="example.thumb" />
                        <div class="ex-desc">
                          {{ example.description }}
                        </div>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>

                <q-item @click="openTutorials" clickable v-close-popup>
                  <q-icon :size="'xs'" name="cast_for_education" class="q-mr-sm" />
                  <q-item-section>Tutorials</q-item-section>
                </q-item>

                <q-item @click="clearAll" clickable v-close-popup>
                  <q-icon :size="'xs'" name="delete_sweep" class="q-mr-sm" />
                  <q-item-section text-caption>Clear All</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <div class="logo"><b>V2</b> GEOMETRY</div>

          <div style="flex-grow: 1"></div>

          <!-- <q-separator vertical inset class="q-mr-sm"/> -->
          <q-btn
            @click="toggleFullscreen"
            flat
            round
            size="md"
            id="btn-toggle-fullscreen"
          >
            <q-icon
              v-show="!inFullscreenMode"
              size="xs"
              name="fullscreen"
              color="grey-4"
            />
            <q-icon
              v-show="inFullscreenMode"
              size="xs"
              name="fullscreen_exit"
              color="grey-4"
            />
          </q-btn>

          <q-btn @click="openInfoDialog" flat round size="md" id="btn-info">
            <q-icon size="xs" name="info_outline" color="grey-4" />
          </q-btn>
        </q-toolbar>
      </div>
    </div>

    <div :class="['panel-center']">
      <div
        ref="commandHistroyPanel"
        :class="['left-panel', { 'in-play-mode': sceneStates.mode === 'play' }]"
        tabindex="2"
      >
        <q-tabs
          v-model="tab"
          dense
          outside-arrows
          mobile-arrows
          class="text-grey"
          active-color="grey-9"
          indicator-color="grey-9"
          align="justify"
          narrow-indicator
        >
          <q-tab name="constructionStep" label="ဆွဲသားပုံ အဆင့်များ" />
          <q-tab name="geometryList" label="ဆွဲသားချက် မှတ်တမ်း" />
          <q-tab name="commandHistroy" label="HISTORY" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated v-if="sceneStates.ready">
          <q-tab-panel name="constructionStep">
            <ConstructionSteps :scene_="scene" />
          </q-tab-panel>

          <q-tab-panel name="geometryList">
            <GeometryList :scene="scene" />
          </q-tab-panel>

          <q-tab-panel name="commandHistroy">
            <CommandHistroy :scene="scene" />
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <div class="center-panel">
        <Toolbar v-if="sceneStates.ready" ref="statusBar" :scene="scene" />
        <div class="graphic-view">
          <div ref="canvasContainer" class="canvas-container"></div>
          <div class="btn-panel-left-top" v-if="sceneStates.ready">
            <div id="container-btns-undo-redo">
              <button
                @click="scene.undo()"
                :class="[
                  'btn-undo-redo',
                  {
                    disabled:
                      sceneStates.currentCommandIndex <= -1 ||
                      sceneStates.mode === 'play',
                  },
                ]"
              >
                <img :src="'v2GeoConst3D/images/undo.svg'" />
              </button>

              <button
                @click="scene.redo()"
                :class="[
                  'btn-undo-redo',
                  {
                    disabled:
                      sceneStates.currentCommandIndex >=
                        sceneStates.commandsStack.length - 1 ||
                      sceneStates.mode === 'play',
                  },
                ]"
              >
                <img :src="'v2GeoConst3D/images/redo.svg'" />
              </button>
            </div>
          </div>
          <div class="btn-panel-bottom-right">
            <button id="btn-home" @click="scene.goToHome" :class="[]">
              <img :src="'v2GeoConst3D/images/home.svg'" />
            </button>
          </div>

          <!-- <q-btn id="btnHome" round color="grey-9" text-color="grey-7" icon="home" /> -->

          <UIPanel ref="uiPanel" />
          <ToolbarContainer v-if="sceneStates.ready" :scene="scene" />
          <SplashScreen ref="splashScreen" />
        </div>
      </div>

      <div
        v-if="sceneStates.ready"
        class="right-panel"
        :class="[{ hiddend: sceneStates.modeType === 'play' }]"
      >
        <div class="panel-construction-modes">
          <!-- <div style="flex-grow : 1"></div> -->
          <q-btn
            stretch
            flat
            no-caps
            :class="[
              'btn-toggle-draw-mode',
              { active: sceneStates.modeType === 'constructionWithInstruments' },
            ]"
            @click="setDrawingMethod('constructorWithInstruments')"
          >
            <img :src="'v2GeoConst3D/images/compass-white.svg'" />
            Tools
          </q-btn>
          <q-btn
            stretch
            flat
            no-caps
            :class="[
              'btn-toggle-draw-mode',
              { active: sceneStates.modeType === 'constructionWithPointer' },
            ]"
            @click="setDrawingMethod('select')"
          >
            <img :src="'v2GeoConst3D/images/cursor-pointer.svg'" style="padding: 2px" />
            Pointer
          </q-btn>
        </div>
        <div class="constructor-toolbar-container">
          <ConstructorWithInstrumentsToolbar
            v-show="visibleConstructionToolbar === 'instrument'"
            :scene="scene"
          />

          <ConstructorWithPointerToolbar
            v-show="visibleConstructionToolbar === 'pointer'"
            :scene="scene"
          />
        </div>

        <transition name="setting-panel-container">
          <SettingPanelContainer
            v-if="scene.selectionManager.editingItem.value"
            :scene="scene"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Scene from "../core/Scene";
// import Point from "../core/geometries/Point";
// import TestObj from "../core/geometries/TestObj";
// import Segment from "../core/geometries/Segment";
// import Ruler from "../core/instruments/Ruler";
// import Label from "../core/graphics/Label";
import { useQuasar } from "quasar";

import { markRaw } from "vue";

import Toolbar from "./Toolbar.vue";
import SplashScreen from "./SplashScreen.vue";
import UIPanel from "./UIPanel.vue";
import ToolbarContainer from "./ToolbarContainer.vue";
import SettingPanelContainer from "./settingPanels/SettingPanelContainer.vue";

import CommandHistroy from "./CommandHistroy.vue";
import GeometryList from "./GeometryList.vue";

import ConstructionSteps from "./ConstructionSteps.vue";
import ConstructorWithInstrumentsToolbar from "./ConstructorWithInstrumentsToolbar.vue";
import ConstructorWithPointerToolbar from "./ConstructorWithPointerToolbar.vue";
// import DefCircleWithCenterAndPointOnBoundary from "../core/definitions/circles/DefCircleWithCenterAndPointOnBoundary";
// import DefCircleWithFixedRadius from "../core/definitions/circles/DefCircleWithFixedRadius";
// import Geometry from "../core/geometries/abstract/Geometry";

import examples from "./steps.json";

import TutorialVideos from "./TutorialVideos.vue";
import InfoDialog from "./InfoDialog.vue";
import { Vector3 } from "three";
const util = require("../core/helper/util");

// import Label from "../core/graphics/Label";
// import ConstructionStep from "../core/animation/ConstructionStep";

export default {
  props: {
    defaultMode: {
      default: "edit",
    },
  },

  components: {
    Toolbar,
    CommandHistroy,
    GeometryList,
    ConstructionSteps,
    SplashScreen,
    ConstructorWithInstrumentsToolbar,
    ConstructorWithPointerToolbar,

    UIPanel,
    ToolbarContainer,
    SettingPanelContainer,
  },

  data() {
    return {
      inEditMode: true,
      isSreenSizeOk: true,
      screenSizeInfoMsgScreenShown: false,
      isDesktop: true,
      isLayoutHorizontal: true,
      tab: "constructionStep",
      sceneStates: {},
      scene: {},
      visibleConstructionToolbar: "instrument",
      examples: examples,
      inFullscreenMode: false,
      mode: this.defaultMode,
      test: {},
    };
  },

  setup() {},

  computed: {},

  created() {
    this.isDesktop = !util.isMobileAndTablet();

    window.addEventListener("resize", () => {
      const screenRatio = window.innerWidth / window.innerHeight;
      this.isLayoutHorizontal = screenRatio > 1;
      this.isSreenSizeOk =
        this.mode === "view" || (this.isLayoutHorizontal && window.innerWidth > 800);
    });

    window.dispatchEvent(new Event("resize"), {});
  },

  mounted() {
    this.$q = useQuasar();

    const scene = new Scene(this.$refs.canvasContainer, {
      statusBar: this.$refs.statusBar,
      commandHistroyPanel: this.$refs.commandHistroyPanel,
      splashScreen: this.$refs.splashScreen,
      uiPanel: this.$refs.uiPanel,
    });

    scene.states.inEditMode = this.defaultMode === "edit";
    this.inEditMode = scene.states.inEditMode;

    this.scene = markRaw(scene);

    window.scene = this.scene;

    this.scene.goToHome = () => {
      this.goToHome();
    };

    scene.onReady = () => {

      draw();

      this.$emit("ready");

      setTimeout(() => {
        this.goToHome(false);
      }, 0);
    };

    const draw = () => {
      // this.scene = scene;
      this.sceneStates = this.scene.states;

      // window.scene = this.scene;

    };
  
    scene.render();
  },

  methods: {
    setDrawingMethod(mode) {
      if (mode === "constructorWithInstruments")
        this.visibleConstructionToolbar = "instrument";
      else if (mode === "select") this.visibleConstructionToolbar = "pointer";

      this.scene.setMode(mode);
    },

    async openExample(example) {
      this.$q.loading.show({
        message: "ခေတ္တစောင့်ပါ ...",
        spinnerSize: 40,
      });

      if (this.currentFetchingExample) {
        this.currentFetchingExample.abortController.abort();
        this.currentFetchingExample = undefined;
      }

      this.currentFetchingExample = example;
      this.currentFetchingExample.abortController = new AbortController();

      fetch(example.url, {
        signal: this.currentFetchingExample.abortController.signal,
      })
        .then((response) => {
          if (this.currentFetchingExample === example) {
            this.currentFetchingExample = undefined;
            return response.json();
          } else {
            this.currentFetchingExample = undefined;
            return Promise.reject({ message: "Opened example changed." });
          }
        })
        .then((data) => {
          this.scene.importConstructionSteps(data);
          this.$q.loading.hide();
        })
        .catch((error) => {
          console.log(error);
          this.$q.loading.hide();
        });
    },

    enterEditMode() {
      this.scene.states.inEditMode = this.inEditMode = true;
      this.scene.modeManager.setMode("constructorWithInstruments");
      setTimeout(() => {
        this.goToHome(false);
      }, 0);
    },

    enterPresentationMode() {
      this.scene.states.inEditMode = this.inEditMode = false;
      this.scene.modeManager.setMode("play");
      setTimeout(() => {
        this.goToHome(false);
      }, 0);
    },

    openTutorials() {
      this.$q
        .dialog({
          // title: 'Confirm',
          // message: 'Would you like to turn on the wifi?',
          // cancel: true,
          // persistent: true,
          component: TutorialVideos,
        })
        .onOk(() => {
          // console.log('>>>> OK')
        })
        .onOk(() => {
          // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },

    openInfoDialog() {
      this.$q
        .dialog({
          // title: 'Confirm',
          // message: 'Would you like to turn on the wifi?',
          // cancel: true,
          // persistent: true,
          component: InfoDialog,
        })
        .onOk(() => {
          // console.log('>>>> OK')
        })
        .onOk(() => {
          // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },

    toggleFullscreen() {
      var element = document.body;

      var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

      element.requestFullScreen =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        function () {
          return false;
        };
      document.cancelFullScreen =
        document.cancelFullScreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen ||
        function () {
          return false;
        };

      this.inFullscreenMode = !isFullscreen;

      isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();

      // this.$forceUpdate();
    },

    clearAll() {
      this.scene.clearAllData();
      this.scene.constructionStepManager.addNewStep();
      this.scene.requestRender();
    },

    goToHome(animate = true) {
      this.scene.animationController.addTransition();

      const cameraPosVect = new Vector3(0, -22, 89.48031770411146);

      cameraPosVect.normalize();

      const minSize = Math.min(
        this.scene.containerRect.width,
        this.scene.containerRect.height
      );

      const dist =
        (this.scene.containerRect.height / this.scene.containerRect.width) * minSize;

      const factor = util.interpolatePts(
        [
          184.2589,
          46.008,
          254.4352,
          49.713,
          303.115,
          57.299,
          361.9617,
          60.453,
          369.1136,
          62.72,
          429.95,
          67.417,
          433.9125,
          68.806,
          458.55,
          73.11,
          596.2522,
          84.596,
          679.2,
          82.676,
          815.0,
          92.146,
        ],
        dist
      );

      cameraPosVect.multiplyScalar(factor * 1.05);

      this.scene.cameraControls.setLookAt(
        cameraPosVect.x,
        cameraPosVect.y,
        cameraPosVect.z,
        0,
        -0.3,
        0,
        animate
      );
    },
  },
};
</script>

<style scoped>
@import "../styles/style.css";

.geo-constrct-3d-container {
  width: stretch;
  height: stretch;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  max-height: 100%;
  height: 100%;
}

#btn-menu {
  height: 35px;
  width: 39px;
  min-height: unset;
}

.toolbar {
  background-color: var(--toolbar-color);
  display: flex;

  z-index: 1;
  align-items: center;
  padding-left: 5px;
  padding: 5px 4px;
  user-select: none;
}

.toolbar button.active {
  border-color: #303030c9;
}

.toolbar button:hover {
  background-color: rgba(0, 0, 0, 0.083);
}

.toolbar button:active img {
  scale: 0.9;
}

.center-panel {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.graphic-view {
  position: relative;
  flex-grow: 1;
}

.right-panel {
  min-width: 275px;
  width: auto;
  max-width: 280px;
  background-color: var(--toolbar-color);
  z-index: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.right-panel .constructor-toolbar-container {
  overflow: auto;
  flex-grow: 1;
  position: relative;
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
    rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
}

.panel-construction-modes {
  display: flex;
  min-height: 38px;
  padding: 0 8px;
}

.btn-panel-left-top {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
}

.btn-panel-bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
}

.btn-panel-undo-redo {
  display: flex;
  flex-direction: row;
}

.btn-panel-undo-redo button,
#btn-home {
  width: 40px;
  height: 40px;
  background-color: transparent;
  border-radius: 0;
}

.btn-panel-undo-redo img {
  width: 18px;
  height: 18px;
  opacity: 0.8;
}

#btn-home img {
  width: 24px;
  height: 24px;
}

.toolbar-draw {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.toolbar-draw > * {
  margin-right: 7px;
}

.toolbar-draw button {
  margin: 0 5px;
}

.instrument-toolbar {
  margin-left: 10px;
  padding-left: 4px;
  border-left: 2px dotted #00000045;
  display: flex;
}

.set-square-30 {
  width: 48px !important;
}
.set-square-30 img {
  height: auto !important;
  width: 38px !important;
}

#tool-menu-container {
  display: flex;
  flex-direction: row;
  width: 100px;
  flex-wrap: wrap;
  justify-content: space-around;
  position: relative;
}

#tool-menu-container button {
  width: 50px;
  height: 40px;
  background-color: transparent;
}

#tool-menu-container button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.screen-size-messages {
  position: fixed;
  background: black;
  width: 100%;
  height: 100%;
  z-index: 9999;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3%;
  text-align: center;
  line-height: 1.7rem;
  font-size: .9rem;
}
</style>

<style>
:root {
  --theme-color: #007606;
}

@font-face {
  font-family: "Pyidaungsu";
  /* src: url("./assets/fonts/pyidaungsu-2.5.3_regular-webfont.ttf"); */
  /* src: url("./assets/fonts/pyidaungsu-2.5.3_regular-webfont.woff2"); */
  src: url("../assets/fonts/Pyidaungsu-2.5.3_Regular.ttf");
  descent-override: 45%;
}

.geo-constrct-3d-container {
  font-family: "Pyidaungsu" !important;
}

div,
h1,
h2,
h3,
h4,
p,
a,
li {
  max-height: 1000000px;
}

.center-panel .canvas-container {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}

.center-panel .canvas-container canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
  background: linear-gradient(to bottom, #2e2e2e, rgb(22 22 22));
}

button.btn-toggle-draw-mode {
  min-height: unset !important;
  font-size: 0.75rem !important;
  width: 50%;
  padding: 3px 10px;
  border-bottom: 2.4px solid #0000000b;
  margin: 0;
  border-radius: 3px !important;
  opacity: 0.75;
}

.btn-toggle-draw-mode.active {
  pointer-events: none;
  border-bottom-color: #00000099;
  border-radius: 0 !important;
  opacity: 1;
}

.btn-toggle-draw-mode img,
.btn-toggle-draw-mode .q-icon {
  width: 16px;
  margin-right: 8px;
}

.light-pos {
  display: block;
  min-width: 900px;
}

.toolbar button {
  background-color: transparent;
}

#btn-tools {
  margin-left: 30px;
}

#btn-tools span.q-btn__content {
  flex-direction: row-reverse;
}

#btn-tools img {
  margin-right: 5px;
  width: 18px;
  height: 18px;
  opacity: 0.8;
}

.btn-tool-menu img {
  width: 22px;
}

input.file-upload-constructions[type="file"] {
  color: #b8b8b8;
}

.file-upload-constructions {
  overflow: hidden;
}

.file-upload-constructions input[type="file"] {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 100%;
  min-height: 100%;
  font-size: 100px;
  text-align: right;
  filter: alpha(opacity=0);
  opacity: 0;
  outline: none;
  background: white;
  cursor: inherit;
  display: block;
}

.example-list {
  display: flex;
  min-width: 280px;
  max-width: 500px;
  align-items: flex-start !important;
  border-bottom: 1px solid #00000022;
  margin: 5px;
  border-radius: 4px;
  overflow: hidden;
}

.example-list:last-child {
  border-bottom: none;
}

.example-list .ex-thumb {
  min-width: 100px !important;
  display: inline-block;
  object-fit: cover;
}

.example-list .ex-desc {
  font-size: 0.8rem;
  line-height: 1.4rem;
  max-height: 90px;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.view-mode .top-panel {
  height: 35px;
  max-height: 35px;
}

.view-mode .left-panel,
.view-mode .graphic-view {
  border-radius: 6px;
  overflow: hidden;
}

.view-mode .left-panel {
  margin: 7px 4px 7px 7px;
}

.view-mode .graphic-view {
  margin: 7px 7px 7px 4px;
}

.view-mode .panel-center {
  background-color: #2d2d2d;
}

.view-mode .left-panel .q-tabs,
.view-mode .status-bar,
.view-mode .right-panel {
  display: none;
}

#btn-toggle-fullscreen {
  display: none;
}

.layout-horizontal .panel-center {
  flex-direction: row !important;
}

.layout-vertical .panel-center {
  flex-direction: column;
}

.layout-horizontal.view-mode .left-panel {
  max-width: 35% !important;
  width: 400px;
}

.layout-vertical .left-panel {
  max-width: unset;
  width: auto;
  margin: 5px 5px 5px 5px;
  height: 45%;
}

.layout-vertical.view-mode .graphic-view {
  margin: 0px 5px 5px 5px;
}

@media screen and (max-width: 900px) {
  .drawer-in-step .cmd-group-row {
    border-left-width: 2px !important;
  }

  #btn-toggle-fullscreen {
    display: inline-flex;
  }

  .right-panel {
    min-width: 200px !important;
    max-width: 200px !important;
  }

  .view-mode .top-panel {
    height: 35px;
    max-height: 35px;
  }

  .layout-vertical .left-panel {
    max-width: unset;
    width: auto;
    margin: 5px 5px 5px 5px;
  }

  .view-mode .left-panel .q-separator--horizontal {
    display: none;
  }

  .view-mode .logo b {
    font-size: 0.75rem;
  }

  .view-mode .logo {
    font-size: 0.6rem;
    margin: 0 5px;
    margin-top: 1px;
  }

  .view-mode .q-toolbar {
    padding: 0 6px;
  }

  .view-mode .q-btn .q-icon {
    font-size: 18px !important;
  }

  .view-mode .expansion-container {
    min-height: unset;
  }

  .view-mode .constr-steps-rows .q-list--dense > .q-item,
  .q-item--dense {
    min-height: 14px;
    height: 25px;
  }

  .view-mode .toolbar button {
    height: 35px;
  }

  .view-mode .expansion.q-expansion-item .q-item {
    min-height: 30px;
  }

  .layout-vertical .view-mode .step-q-expansion {
    margin-top: 2vw;
    margin-right: 4vw;
    margin-left: 4vw;
  }
}

@media screen and (max-width: 400px) {
  .drawer-in-step .cmd-group-row {
    border-left-width: 1.5px !important;
  }
}

button.disabled {
  opacity: 0.2 !important;
}

#btn-enter-presentation-mode {
  background-color: transparent;
  border-radius: 5px;
  border: 1px solid #8b681b;
  color: #dc9f18;
  margin-top: 22px;
  padding: 0 15px;
  font-size: 0.8rem;
}

#btn-enter-presentation-mode:active {
  background-color: #ffffff11;
}
</style>
