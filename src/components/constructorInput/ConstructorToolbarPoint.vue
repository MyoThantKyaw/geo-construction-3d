<template>
  <div class="constr-input-bar">
    
     <div class="constr-input-group">
      <img :src="'v2GeoConst3D/images/circle-center.svg'" />
      <div>x : </div>
      <input
        ref="inputOriginX"
        type="text"
        :class="[
          'constructor-input',
          { enabled: states.inputPanelEnabled},
        ]"
        
        @input="constructor.locationInputChanged($event, 'x')"
        @keyup="constructor.locationInputEnterPressed($event, 'x')"
      />
      <div> y : </div>
      <input
        ref="inputOriginY"
        type="text"
        :class="[
          'constructor-input',
          { enabled: states.inputPanelEnabled},
        ]"
        @input="constructor.locationInputChanged($event, 'y')"
        @keyup="constructor.locationInputEnterPressed($event, 'y')"
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
