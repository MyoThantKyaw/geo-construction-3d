<template>

    <div class="tb-constructor-with-instrument">
      <div class="btn-group-title">Symbols and Graphics</div>
      <div class="constructors-instruments-btn-wrapper btn-instruments-container">
     <button
        :class="['btn-geo-constructor', { active: sceneStates.mode === 'select' }]"
        @pointerdown="setMode('select')"
      >
        <img :src="'v2GeoConst3D/images/text.svg'" />
        <div class="desc">Label</div>
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
      </div>
    </div>

</template>

<script>
export default {
  props: ["scene"],

  data() {
    return {
        sceneStates : {},
    };
  },

  mounted() {

    this.sceneStates = this.scene.states;
  },
};
</script>

<style scoped></style>
