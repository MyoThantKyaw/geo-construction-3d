<template>
  <div id="ruler-toolbar" class="toolbar">
    <!-- <div class="v-sperator"></div> -->

    <!-- <button @click="ruler.makeHorizontal()">ရေပြင်ညီ</button> -->
    <!-- <div class="v-sperator"></div> -->

  </div>
</template>

<script>
export default {
  props: ["ruler"],
  mounted() {
    this.scene = this.ruler.scene;
  },

  methods : {
   
  }
};
</script>

<style scoped></style>
