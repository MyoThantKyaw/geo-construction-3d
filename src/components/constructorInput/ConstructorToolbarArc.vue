<template>
  <div class="constr-input-bar">

    <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/circle-with-center-and-radius.svg'" />

      <input
        ref="inputArcRadius"
        type="text"
        :class="[
          'constructor-input',
          { enabled: (states.point2.active && states.inputPanelEnabled) || states.drawingMethod === 'compass'},
        ]"
        @input="constructor.arcRadiusInputChanged($event)"
        @keyup="constructor.arcRadiusEnterPressed($event)"
      />
    </div>

    <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/arc-angle.svg'" />

      <input
        ref="inputArcAngle"
        type="text"
        :class="[
          'constructor-input',
          { enabled: states.point3.active && states.inputPanelEnabled},
        ]"
        @input="constructor.arcAngleInputChanged($event)"
        @keyup="constructor.arcAngleEnterPressed($event)"
      />
    </div>
    
  </div>
</template>

<script>
export default {
  props: {
    constructor: {},
  },

  data() {
    return {
      states: {},
    };
  },

  watch: {},

  created() {
    this.states = this.constructor.states;
  },

  mounted() {
    this.constructor.setConstructorToolbar(this);
  },

  computed: {
   
  },
};
</script>

<style scoped></style>
