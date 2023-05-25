<template>
  <div ref="splashScreen" class="splash-screen splash-screen-leave">
    <div ref="desc" class="desc">{{ desc }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: true,
      desc: "",
    };
  },

  mounted() {

  },

  methods: {
    show(desc) {
      if (this.visible) this.hide();

      this.desc = desc;

      this.$refs.splashScreen.style.display = "flex";
      this.$refs.splashScreen.classList.add("splash-screen-enter");
      this.$refs.splashScreen.classList.remove("splash-screen-leave");

      this.$refs.desc.classList.remove("desc-leave");
      this.$refs.desc.classList.add("desc-enter");

      this.visible = true;

      setTimeout(() => {

        if(this.desc === desc){
            this.hide();
        }
        
      }, 850);
    },

    hide() {
      if (!this.visible) return;

      this.$refs.splashScreen.classList.remove("splash-screen-enter");
      this.$refs.splashScreen.classList.add("splash-screen-leave");

      this.$refs.desc.classList.remove("desc-enter");
      this.$refs.desc.classList.add("desc-leave");

      this.visible = false;
    },
  },
};
</script>

<style scoped>
.splash-screen {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(32, 32, 32, 0.796);
  font-size: 1.4rem;
  font-weight: bold;

  pointer-events: none;
  display: none;
}

.desc{
  margin-bottom: 13px;
}

.splash-screen * {
  text-shadow: 1.5px -1.5px 0 #ffffffd6, -1.5px 1.5px 0 #ffffffd6, 1.5px -1.5px 0 #ffffffd6,
    1.5px 1.5px 0 #ffffffd6, 0 -1.5px 0 #ffffffd6, 0 1.5px 0 #ffffffd6, 1.5px 0 0 #ffffffd6,
    -1.5px 0 0 #ffffffd6;
}
</style>

<style>
.desc-enter {
  -webkit-animation: desc-enter 0.5s ease-in-out both;
  animation: desc-enter 0.5s ease-in-out both;
}

@-webkit-keyframes desc-enter {
  0% {
    -webkit-transform: scale(0.3);
    transform: scale(0.3);
    opacity: 0;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes desc-enter {
  0% {
    -webkit-transform: scale(0.3);
    transform: scale(0.3);
    opacity: 0;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
}

.desc-leave {
  -webkit-animation: desc-leave 1s ease-in-out both;
  animation: desc-leave 1s ease-in-out both;
}

@-webkit-keyframes desc-leave {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }

  100% {
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}
@keyframes desc-leave {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }

  100% {
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}

.splash-screen-enter {
  -webkit-animation: splash-screen-enter 0.25s ease-in-out both;
  animation: splash-screen-enter 0.25s ease-in-out both;
}

@-webkit-keyframes splash-screen-enter {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
@keyframes splash-screen-enter {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.splash-screen-leave {
  -webkit-animation: splash-screen-leave .8s ease-in-out both;
  animation: splash-screen-leave .8s ease-in-out both;
}

@-webkit-keyframes splash-screen-leave {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
@keyframes splash-screen-leave {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
