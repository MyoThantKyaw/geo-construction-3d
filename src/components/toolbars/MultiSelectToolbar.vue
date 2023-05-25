<template>
  <div class="toolbar">
    <div v-show="areAllPoints">
      
    </div>
  </div>
</template>

<script>
export default {
  props: ["sceneStates"],

  mounted() {
    
  },

  computed: {
    areAllPoints() {
      for (let item of this.sceneStates.selectedItems) {
        if (!item.isPoint) return false;
      }
      return true;
    },
  },
};
</script>

<style scoped></style>
