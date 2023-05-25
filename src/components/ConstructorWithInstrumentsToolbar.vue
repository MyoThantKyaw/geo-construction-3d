<template>
  <div class="tb-constructor-with-instrument">
    <div class="btn-group-title">ကိရိယာများ</div>
    <div class="constructors-instruments-btn-wrapper btn-instruments-container">
      <button
        :class="[
          'btn-geo-constructor',
          {
            active:
              sceneStates.rulerVisible &&
              sceneStates.mode === 'constructorWithInstruments',
          },
        ]"
        @pointerdown="showInstrument('ruler')"
      >
        <img :src="'v2GeoConst3D/images/ruler.svg'" />
        <span class="btn-tool-remove" @click="removeInstrument('ruler')"
          ><img :src="'v2GeoConst3D/images/cross-small.svg'"
        /></span>
      </button>

      <button
        :class="['btn-geo-constructor', { active: sceneStates.protractorVisible }]"
        @pointerdown="showInstrument('protractor')"
      >
        <img :src="'v2GeoConst3D/images/protractor-1.svg'" />
        <span class="btn-tool-remove" @click="removeInstrument('protractor')"
          ><img :src="'v2GeoConst3D/images/cross-small.svg'"
        /></span>
      </button>

      <button
        :class="['btn-geo-constructor', { active: sceneStates.compassVisible }]"
        @pointerdown="showInstrument('compass')"
      >
        <img :src="'v2GeoConst3D/images/compass.svg'" />
        <span class="btn-tool-remove" @click="removeInstrument('compass')"
          ><img :src="'v2GeoConst3D/images/cross-small.svg'"
        /></span>
      </button>

      <button
        :class="['btn-geo-constructor', { active: sceneStates.setSquare45Visible }]"
        @pointerdown="showInstrument('setSquare45')"
      >
        <img :src="'v2GeoConst3D/images/setSquare45.svg'" />
        <span class="btn-tool-remove" @click="removeInstrument('setSquare45')"
          ><img :src="'v2GeoConst3D/images/cross-small.svg'"
        /></span>
      </button>
    </div>

    <div class="btn-group-title">လုပ်ဆောင်ချက်များ</div>
    <div class="constructors-instruments-btn-wrapper">
      <button
        :class="[
          'btn-geo-constructor',
          'v-ripple',
          'relative-position',
          'container',
          'flex',
        ]"
        @pointerdown="measureCompass()"
      >
        <img :src="'v2GeoConst3D/images/measure-compass-on-ruler.svg'" />
        <div class="desc">ကွန်ပါ တိုင်း</div>
      </button>

      <button
        :class="['btn-geo-constructor', { active: sceneStates.apple }]"
        @pointerdown="removeInstruments()"
      >
        <img :src="'v2GeoConst3D/images/broom.svg'" />
        <div class="desc">ကိရိယာများ<br />ဖယ်ရှား</div>
      </button>
    </div>

  </div>
</template>

<script>
export default {
  props: ["scene"],

  data() {
    return {
      sceneStates: {},
    };
  },

  mounted() {

    this.sceneStates = this.scene.states;

    this.ruler = this.scene.ruler;
    this.compass = this.scene.compass;
    this.protractor = this.scene.protractor;
    this.setSquare45 = this.scene.setSquare45;

  },

  methods: {
    setMode(mode) {
      this.scene.setMode(mode);
    },

    showInstrument(instrumentName) {
      const instrumentToShow = this.scene[instrumentName];

      if (this.sceneStates.mode !== "constructorWithInstruments") {
        this.scene.setMode("constructorWithInstruments");
      }

      if (instrumentToShow.visible) {
        //
      } else {
        if (instrumentToShow.isRuler) {
          instrumentToShow.setOriginAndAngle({ x: 3, y: -15 }, 0);
        }
        if (instrumentToShow.isProtractor) {
          instrumentToShow.setOriginAndAngle({ x: -6, y: 16 }, 0);
        }
        if (instrumentToShow.isCompass) {
          instrumentToShow.setPositionAndAngle(
            { x: 14, y: 2 },
            0,
            0,
            Math.min(4, this.scene.compass.radius)
          );
        }
        if (instrumentToShow.isSetSquare45) {
          instrumentToShow.setOriginAndAngle({ x: 13, y: -7 }, 0);
        }

        instrumentToShow.show({
          animate: true,
        });
      }

      if (instrumentToShow.isRuler)
        instrumentToShow.measureAnimate(
          { x: -3, y: -0.9 },
          { x: 3, y: -0.9 },
          { duration: 1000 }
        );
      if (instrumentToShow.isProtractor) {
        instrumentToShow.setOriginAndAngle({ x: 0, y: 3 }, this.scene.protractor.angle, {
          animate: true,
          duration: 1000,
        });
      }
      if (instrumentToShow.isCompass) {
        instrumentToShow.setPositionAndAngle(
          { x: -2, y: 2 },
          0,
          this.scene.compass.angle,
          Math.min(4, this.scene.compass.radius),
          { animate: true, duration: 1000 }
        );
      }
      if (instrumentToShow.isSetSquare45) {
        instrumentToShow.setOriginAndAngle({ x: -5, y: -2 }, 0, {
          animate: true,
          duration: 1000,
        });
      }

      this.scene.requestRender();
    },

    removeInstrument(instrumentName) {
      this.scene[instrumentName].hide({
        toGoToRestingPosition: true,
      });
    },

    measureCompass() {
      const compass = this.scene.compass;
      const ruler = this.scene.ruler;

      if (!compass.visible) {
        compass.setPositionAndAngle({ x: 18, y: 2 }, 0, 0, Math.min(4, 0));
        compass.show();
      }
      if (!ruler.visible) {
        ruler.setOriginAndAngle({ x: 3, y: -15 }, 0);
        ruler.show();
      }

      const startPt = { x: -4, y: 7 };

      ruler.measureAnimate(
        startPt,
        { x: 0, y: 7 },
        {
          onFinish: () => {
            compass.getMeasurementOnRuler(3);
          },
        }
      );
    },

    removeInstruments() {

      if (this.ruler.visible)
        this.ruler.measureAnimate(
          { x: -6, y: -17 },
          { x: 6, y: -17 },
          { duration: 1000 }
        );

      if (this.protractor.visible) {
        this.protractor.setOriginAndAngle({ x: 0, y: 15 }, this.protractor.angle, {
          animate: true,
          duration: 1000,
        });
      }

      if (this.compass.visible) {
        this.compass.setPositionAndAngle(
          { x: 19, y:  this.compass.origin.y},
          0,
          this.compass.angle,
          Math.min(4, this.compass.radius),
          { animate: true, duration: 1000 }
        );
      }

      if (this.setSquare45.visible) {
        this.setSquare45.setOriginAndAngle({ x: 17, y: -15 }, 0, {
          animate: true,
          duration: 1000,
        });
      }

    },
  },
};
</script>

<style scoped>
.tb-constructor-with-instrument {
  /* display: flex; */
  justify-content: center;
}

.constructors-instruments-btn-wrapper.btn-instruments-container img{
  width: 28px;
  height: 28px;
}

.actions-wrapper {
  background: cadetblue;
}



.btn-tool-remove {
  position: absolute;
  right: 0px;
  top: 0;
  z-index: 2;
  height: 24px;
  /* width: 24px; */
  padding-left: 2px;
  padding-right: 1px;
  padding-bottom: 4px;
  display: none;
  opacity: 0.7;
  /* background: chartreuse; */
}

.btn-tool-remove  img{
  margin-top: -2px;
  margin-right: -3px;
}

.btn-geo-constructor.active:hover .btn-tool-remove {
  display: inline-block;
}

.btn-tool-remove:hover {
  opacity: 1 !important;
}

.btn-tool-remove:hover img {
  transform: scale(1.1) rotate(6deg);
}

.btn-tool-remove:active img {
  transform: scale(0.9) rotate(6deg);
}

.btn-tool-remove img {
  width: 22px;
  height: 22px;
}
</style>
