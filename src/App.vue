<template>
  <div style="display: contents">
    <!-- <router-view @ready="componentReady"/> -->

    <V2GeoConstruction3D @ready="appReady" />
    <Transition name="fade">
      <div class="splash-screen" v-if="splashScreenVisible">
        <q-spinner-hourglass color="grey-9" size="2.1em" />
        <div class="logo"><b>V2</b> GEOMETRY</div>
      </div>
    </Transition >
  </div>
</template>

<script>
import V2GeoConstruction3D from "./components/V2GeoConstruction3D.vue";

export default {
  data() {
    return {
      splashScreenVisible: true,
    };
  },

  components: {
    V2GeoConstruction3D,
  },

  methods: {
    appReady() {
      this.splashScreenVisible = false;
    },
  },
};
</script>

<style>
@font-face {
  font-family: "Pyidaungsu";
  src: url("./assets/fonts/Pyidaungsu-2.5.3_Regular.ttf");
  descent-override: 45%;
}

html {
  font-family: "Pyidaungsu" !important;
  font-size: 17.92px;
}

html,
body {
  width: 100%;
  height: 100%;
}

body {
  font-family: inherit !important;
}

#app {
  width: 100%;
  height: 100%;
}

button {
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  display: flex;
  outline: none;
}

button > img {
  width: 25px;
  height: 25px;
}

.splash-screen {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  background: rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  user-select: none;
  padding-bottom: 40px;
}

.splash-screen .logo {
  transform: scale(1.4);
  margin-top: 17px;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #99999903;
}

::-webkit-scrollbar-thumb {
  background: #00000013;
  border-radius: 2px;
  /* transition: background .1s ease; */
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(85, 85, 85, 0.25);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
