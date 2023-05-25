<template>

  <div>

    <div v-show="states.inputPanelEnabled && states.drawingGeometry === 'segment'">
      <div class="constr-input-group">
        <img :src="'v2GeoConst3D/images/mesurement_length.svg'" />
        <input
          ref="inputSegmentLength"
          type="number"
          :class="['constructor-input', {
            'enabled' : states.inputPanelEnabled
          }]"
          @input="constructor.segmentLengthInputChanged($event)"
          @keyup="constructor.segmentLengthEnterPressHandler($event)"
        />
      </div>

    </div>

    <div v-show="states.inputPanelEnabled && states.activeInstrument && states.activeInstrument.isProtractor">
      <div class="constr-input-group">
        <img :src="'v2GeoConst3D/images/angle.svg'" />
        <input
          ref="inputAngle"
          type="number"
          :class="['constructor-input',{
            'enabled' : states.inputPanelEnabled
          }]"
          @input="constructor.angleInputChanged($event)"
          @keyup="constructor.angleInputEnterPressHandler($event)"
        />
      </div>

    </div>

  </div>

</template>

<script>
export default {
  props: ["states", "scene", "constructor"],

  mounted() {

    this.constructor.setConstructorToolbar(this);

  },
};
</script>

<style scoped></style>
