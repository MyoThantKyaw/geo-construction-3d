import TWEEN from '@tweenjs/tween.js';


export default class AnimationController {

    constructor(stage, cameraControls, clock) {

        this.idCounter = 0;
        this.stage = stage;
        this.cameraControls = cameraControls;
        this.cameraControlsClock = clock;

        this.runnningIds = [];

        this.paused = false;

        this.aniFun = t => this.animate(t);
        this.cameraCtrlAnimationCount = 0;

        // this.stage.renderer.domElement.addEventListener("wheel", evt => {
        //     if (!this.stage.toRender) {
        //         this.cameraControls.update(this.cameraControlsClock.getDelta());
        //         this.requestRender();
        //     }
        // });

        this.awake = false;

        this.cameraControls.addEventListener("control", evt => {

            if (!this.awake) {
                this.cameraControls.update(this.cameraControlsClock.getDelta());
            }

        });

        this.cameraControls.addEventListener("controlstart", evt => {

            this.cameraControls.update(this.cameraControlsClock.getDelta());

        });

        this.cameraControls.addEventListener("wake", evt => {
            
            if (!this.awake) {

                this.awake = true;
                this.addAnimation();
            }

        });

        this.cameraControls.addEventListener("sleep", evt => {

            // console.log('sleep ***************')

            if (this.cameraCtrlAnimationCount > 0) {

                this.cameraCtrlAnimationCount = 1;

                this.removeAnimation();

                this.awake = false;
            }

        });

        this.time = 0;

        this.lastReactedTime = this.time;

        this.runningAnimationLoop = false;

        // setInterval(() => {
        //     console.log("this.aniId ", this.aniId);
        // }, 10000);

    }

    addTransition() {


        this.cameraControls.update(this.cameraControlsClock.getDelta());

        if (!this.awake) {
            this.awake = true;
            this.addAnimation();
        }
    }

    animate(t) {

        this.aniId = requestAnimationFrame(this.aniFun);
     
        if (this.stage.toRender && (!this.paused || this.cameraCtrlAnimationCount !== 0)) {

            TWEEN.update(t);

            this.cameraControls.update(this.cameraControlsClock.getDelta());
    
            this.stage.render();

            this.lastTimeRendered = true;

        }
        else {

            if (this.lastTimeRendered && !this.paused) {

                this.lastReactedTime = t;
                this.lastTimeRendered = false;
            }
            else if (t - this.lastReactedTime > 1000 && !this.paused) {

                cancelAnimationFrame(this.aniId);
                this.runningAnimationLoop = false;

            }
        }

    }

    addAnimation(id) {

        // console.warn("addAnimation ", id);

        if (!this.runningAnimationLoop) {
            this.runningAnimationLoop = true;
            this.animate(0);
        }

        if (id == undefined) {
            this.cameraCtrlAnimationCount++;
        }
        else {
            this.runnningIds.push(id);
        }

        this.stage.toRender = true;
    }

    removeAnimation(id) {

        if (id == undefined) {
            this.cameraCtrlAnimationCount--;
        }
        else {
            for (let i = 0; i < this.runnningIds.length; i++) {
                if (this.runnningIds[i] === id) {
                    this.runnningIds.splice(i, 1);
                    break;
                }
            }
        }

        if (this.runnningIds.length === 0 && this.cameraCtrlAnimationCount === 0) {

            this.stage.render();
            this.stage.toRender = false;

        }
    }

    isAnimationPlaying(aniId){

        for (let i = 0; i < this.runnningIds.length; i++) {
            if (this.runnningIds[i] === aniId) {
                return true;
                
            }
        }

        return false;
    }

    requestRender() {
        if (this.stage.toRender) {
            return;
        }

        this.stage.render();
    }
}
