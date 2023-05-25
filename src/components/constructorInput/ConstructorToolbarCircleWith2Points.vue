<template>
  <div class="constr-input-bar">
    
     <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/circle-with-center-and-radius.svg'" />

      <input
        ref="inputRadius"
        type="text"
        :class="[
          'constructor-input',
          { enabled: states.inputPanelEnabled},
        ]"
        @input="constructor.radiusInputChanged($event)"
        @keyup="constructor.radiusEnterPressHandler($event)"
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

  created() {
    this.states = this.constructor.states;
  },

  mounted(){
    this.constructor.setConstructorToolbar(this);
  },
};
</script>

<style scoped>

</style>
