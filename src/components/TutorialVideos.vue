<template>
  <q-dialog ref="dialog" persistent>
    <div class="dialog-frame">
      <div class="dialog-title-bar">
        <div class="dialog-title">Tutorials</div>
        <div style="flex-grow: 1"></div>
        <button @click="onCancelClick">
          <q-icon name="close" color="white" />
        </button>
      </div>
      <div class="dialog-content">
        <div class="video-view">
          <video controls ref="video" :src="currentVideoSrc" />
          <div class="current-video-desc">{{ currentVideoDesc }}</div>
        </div>

        <div class="video-list">
          <q-item
            v-for="video in videos"
            :key="video"
            :class="['video-list-item', { playing: video.src === currentVideoSrc }]"
            clickable
            @click="openVideo(video)"
          >
            <img
              class="video-thumb"
              :src="video.thumb"
            />
            <p class="video-desc">
              {{ video.desc }}
            </p>
          </q-item>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: "UserInfo",
  data() {
    return {
      videos: [
        {
          desc: "Using Ruler and Protractor",
          src: "v2GeoConst3D/tutorials/videos/using-ruler-and-protractor.mp4",
          thumb: "v2GeoConst3D/tutorials/thumbs/using-ruler-and-protractor.png",
        },
        {
          desc: "Using Set square",
          src: "v2GeoConst3D/tutorials/videos/using-set-square.mp4",
          thumb: "v2GeoConst3D/tutorials/thumbs/using-set-square.png",
        },
        {
          desc: "Using Compass",
           src: "v2GeoConst3D/tutorials/videos/using-compass.mp4",
          thumb: "v2GeoConst3D/tutorials/thumbs/using-compass.png",
          
        },

        
        {
          desc: "Importing and Exporting constrction steps",
          src: "v2GeoConst3D/tutorials/videos/import-export.mp4",
          thumb: "v2GeoConst3D/tutorials/thumbs/import-export.png",
          
        },
        
        {
          desc: "Labeling and Coloring",
          src: "v2GeoConst3D/tutorials/videos/labeling-coloring.mp4",
          thumb: "v2GeoConst3D/tutorials/thumbs/labeling-coloring.png",
        },
      ],
      currentVideoSrc: "",
      currentVideoDesc: "",
    };
  },

  created: function () {},

  mounted() {},

  methods: {
    openVideo(video) {
      // this.$refs.video.src = video.src;
      this.currentVideoSrc = video.src;
      this.currentVideoDesc = video.desc;
    },

    show() {
      this.$refs.dialog.show();
      this.$nextTick(() => {
        this.openVideo(this.videos[0]);
      });
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
  width: 1100px;
  max-width: unset;
  height: 600px;
  background: white;
  border-radius: 5px;
  overflow: hidden;
}

.dialog-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.dialog-content .video-view {
  flex-grow: 1;
  position: relative;

  display: flex;
  flex-direction: column;
}

.dialog-content .video-view video {
  background: black;
  border-radius: 4px;
  flex-grow: 1;
  margin: 5px;
  max-width: 100%;
  max-height: calc(100% - 35px);
}

.video-view .current-video-desc {
  font-size: 0.84rem;
  padding: 0px 5px 5px 5px;
}

.dialog-content .video-list {
  min-width: 25%;
  max-width: 25%;
  border-left: 1px solid #00000022;
  overflow: hidden auto;
  max-height: 100%;
}

@media screen and (max-width: 600px) {
  .dialog-content {
    flex-direction: column;
  }

  .dialog-content .video-list {
    max-width: unset;
    width: 100%;
  }
}

.dialog-content .video-list .video-list-item {
  margin: 8px;
  border-radius: 5px;
  height: 80px;
  box-sizing: border-box;
  display: flex;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  /* box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px; */
  border: 1px solid #0000001f;
}

.video-list-item.playing {
  border: 1px solid #3a3a3a !important;
  pointer-events: none;
}

.video-list-item .video-thumb {
  display: inline-block;
  object-fit: cover;
  width: 100px;
}

.video-list-item .video-desc {
  padding: 5px 8px;

  font-size: 0.8rem;
  overflow: hidden;
  line-height: 1.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
  color: #000000aa;
}
</style>
