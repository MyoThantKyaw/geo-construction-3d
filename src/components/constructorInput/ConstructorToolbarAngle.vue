<template>
  <div class="constr-input-bar">

    <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/arc-angle.svg'" />
      <input
        ref="inputAngle"
        type="text"
        :class="[
          'constructor-input',
          { enabled: states.point2.active && states.inputPanelEnabled },
        ]"
        @input="constructor.angleInputChanged($event)"
        @keyup="constructor.enterPressHandler($event)"
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
