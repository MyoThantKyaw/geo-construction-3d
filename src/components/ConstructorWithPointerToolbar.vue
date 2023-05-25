<template>
  <div class="tb-constructor-with-instrument">
    <div class="constructors-instruments-btn-wrapper">
      <button
        :class="['btn-geo-constructor', { active: sceneStates.mode === 'select' }]"
        @pointerdown="setMode('select')"
      >
        <img :src="'v2GeoConst3D/images/select.svg'" />
        <div class="desc">Select</div>
      </button>
      <button
        :class="[
          'btn-geo-constructor',
          { active: sceneStates.mode === 'pointConstructor' },
        ]"
        @pointerdown="setMode('pointConstructor')"
      >
        <img :src="'v2GeoConst3D/images/point.svg'" />
        <div class="desc">အမှတ်</div>
      </button>
      <button
        :class="[
          'btn-geo-constructor',
          { active: sceneStates.mode === 'segmentConstructor' },
        ]"
        @pointerdown="setMode('segmentConstructor')"
      >
        <img :src="'v2GeoConst3D/images/segment.svg'" />
        <div class="desc">မျဉ်းပိုင်း</div>
      </button>
       
      <button
        :class="[
          'btn-geo-constructor',
          { active: sceneStates.mode === 'arcConstructor' },
        ]"
        @pointerdown="setMode('arcConstructor')"
      >
        <img :src="'v2GeoConst3D/images/arc.svg'" />
        <div class="desc">အဝန်းပိုင်း</div>
      </button>

      <button
        :class="[
          'btn-geo-constructor',
          { active: sceneStates.mode === 'angleConstructor' },
        ]"
        @pointerdown="setMode('angleConstructor')"
      >
        <img :src="'v2GeoConst3D/images/angle.svg'" />
        <div class="desc">ထောင့်</div>
      </button>

      <button
        :class="[
          'btn-geo-constructor',
          { active: sceneStates.mode === 'circleWithCenterAndPointOnCircumConstructor' },
        ]"
        @pointerdown="setMode('circleWithCenterAndPointOnCircumConstructor')"
      >
        <img :src="'v2GeoConst3D/images/circleWithCenter.svg'" />
      <div class="desc">စက်ဝိုင်း</div>
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
  },

  methods: {
    setMode(mode) {
      this.scene.setMode(mode);
    },
  },
};
</script>

<style scoped>
.tb-constructor-with-instrument {
  display: flex;
}
</style>
