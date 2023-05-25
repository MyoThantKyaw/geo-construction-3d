<template>
  <q-dialog ref="dialog" persistent>
    <div class="dialog-frame">
      <div class="dialog-title-bar">
        <div class="dialog-title"></div>
        <div style="flex-grow: 1"></div>
        <button @click="onCancelClick">
          <q-icon name="close" color="white" />
        </button>
      </div>
      <div class="dialog-content">
        <div class="info-content">
          <div class="logo"><b>V2</b> GEOMETRY</div>
          <div class="version-no">1.0</div>
          <div class="desc-section">
            <p style="text-indent: 40px;">This is a free software that can draw and animate geometry constructions.</p>
          </div>

          <div class="credit-section">

            <b>Credits :</b>
            <p style="text-indent: 40px;">This software uses the following external libraries.</p>

            <ul>
              <li>
                <div>ThreeJS</div>
                <a href="https://github.com/mrdoob/three.js" target="_blank">https://github.com/mrdoob/three.js</a>
              </li>
              <li>
                <div>Quasar</div>
                <a href="https://quasar.dev" target="_blank">https://quasar.dev</a>
              </li>

              <li>
                <div>Tween.js</div>
                <a href="https://github.com/tweenjs/tween.js/" target="_blank">https://github.com/tweenjs/tween.js</a>
              </li>

              <li>
                <div>Camera Controls</div>
                <a href="https://github.com/yomotsu/camera-controls" target="_blank">https://github.com/yomotsu/camera-controls</a>
              </li>

              <li>
                <div>Collisions</div>
                <a href="https://github.com/Sinova/Collisions" target="_blank">https://github.com/Sinova/Collisions</a>
              </li>

              <li>
                <div>Flatten-js</div>
                <a href="https://github.com/alexbol99/flatten-js" target="_blank">https://github.com/alexbol99/flatten-js</a>
              </li>

              <li>
                <div>Robust Point In Polygon</div>
                <a href="https://github.com/mikolalysenko/robust-point-in-polygon" target="_blank">https://github.com/mikolalysenko/robust-point-in-polygon</a>
              </li>

              <li>
                <div>Scroll Into View</div>
                <a href="https://github.com/KoryNunn/scroll-into-view" target="_blank">https://github.com/KoryNunn/scroll-into-view</a>
              </li>

          

            </ul>

          </div>

        </div>
      </div>
    </div>

  </q-dialog>
</template>

<script>
export default {
  data() {
    return {};
  },

  created: function () {},

  mounted() {
  
  },

  methods: {
    show() {
      this.$refs.dialog.show();
    },
    hide() {
      this.$refs.dialog.hide();
    },
    onDialogHide() {
      this.$emit("hide");
    },
    onOKClick() {
      //code that you want to emit or functionality you want
    },
    onCancelClick() {
      this.hide();
    },
  },
};
</script>

<style scoped>
.dialog-frame {
  display: flex;
  flex-direction: column;
  width: 700px;
  max-width: unset;
  height: 500px;
  background: white;
  border-radius: 5px;
  overflow: hidden;
}


.dialog-content {
  display: flex;
  flex-grow: 1;
  overflow: auto;
  font-size: .86rem;
}



.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.info-content > div{
  width: 100%;
  padding: 0px 4% ;
}

.info-content .logo {
  transform: scale(2);
  transform-origin: center;
  margin:  24px 10px 28px 10px;
  width: auto;
}

.info-content .version-no{
  margin: -20px 10px 12px 10px;
  width: auto;
  text-indent: 150px;
  font-style: italic;
  font-size: .7rem;
}

.desc-section{
  
}

.credit-section{
  display: flex;
  flex-direction: column;
}

.credit-section ul{
  align-self: center;
  margin-top: 0px;
}

.credit-section li{
  padding: 4px 0 8px 0;
}

.credit-section a{
  text-decoration: none;
  color: #014296b8;
  font-size: .75rem;
}

</style>
