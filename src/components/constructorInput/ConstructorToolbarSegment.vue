<template>
  <div class="constr-input-bar">
    <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/mesurement_length.svg'" />

      <input
        ref="inputLength"
        type="text"
        :class="['seg-len-input', 'constructor-input', {
          enabled : states.inputPanelEnabled
        }]"
        @input="constructor.lengthInputChanged($event)"
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

  mounted(){

    this.constructor.setConstructorToolbar(this);
    
  },

  computed: {
    
  },
};
</script>

<style scoped></style>
