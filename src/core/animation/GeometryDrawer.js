import DefPointOnParallelSegment from "../definitions/points/DefPointOnParallelSegment";
import Geometry from "../geometries/abstract/Geometry";
import Compass from "../instruments/Compass";
import Pencil from "../instruments/Pencil";
import Protractor from "../instruments/Protractor";
import Ruler from "../instruments/Ruler";
import SetSquare45 from "../instruments/SetSquare45";
import Scene from "../Scene";


export default class GeometryDrawer {

    /**
     * 
     * @param {String} name 
     * @param {Geometry} geoToDraw 
     * @param {Scene} scene 
     */
    constructor(name, geoToDraw, scene) {

        this.name = name;
        this.geoToDraw = geoToDraw;
        this.scene = scene;

        this.geosToShow = [];

        this.description = geoToDraw.name + " ကို ဆွဲသည်။";

        /**
         * @type {Pencil}
         */
        this.pencil = scene.pencil;
        /**
         * @type {Ruler}
         */
        this.ruler = scene.ruler;
        /**
         * @type {Compass}
         */
        this.compass = scene.compass;

        /**
        * @type {Protractor}
        */
        this.protractor = scene.protractor;

        /**
        * @type {SetSquare45}
        */
        this.setSquare45 = scene.setSquare45;

    }

    addGeoToShow(geo) {

        this.geosToShow.push(geo);

    }

    /**
     * 
     * @param {*} withInstrument 
     */
    animate(options = {}) {

        // this.scene.goToCommandHistory(this.getIndex() - 1, {
        //     mode: "changeStatesOfDefinitions",
        // });

    
        if (this.needPencil()) {

            if (!this.pencil.visible) {

                if (!this.pencil.parentMesh.visible) {
                    this.pencil.moveTo(this.pencil.restingPosition);
                }
                this.pencil.show();
            }
            else
                this.pencil.lift();

        }
        else {
            if (this.pencil.visible)
                this.pencil.hide({ toGoToRestingPosition: true });
        }

        if (this.needRuler()) {

            if (!this.ruler.visible) {

                if (!this.ruler.parentMesh.visible)
                    this.ruler.setOriginAndAngle({
                        x: -10, y: 15
                    }, 0);
                this.ruler.show();
            }
            else {
                this.ruler.pushAside();
            }
        }
        else {
            if (this.ruler.visible)
                this.ruler.hide({ toGoToRestingPosition: true });
        }

        if (this.needCompass()) {

            if (!this.compass.visible) {
                if (!this.compass.parentMesh.visible)
                    this.compass.setPositionAndAngle(this.compass.restingPosition, 0, 0, 0);
                this.compass.show();
            }
            else
                this.compass.pushAside();
        }
        else {
            this.compass.hide({ toGoToRestingPosition: true });

        }

        if (this.needProtractor()) {
            if (!this.protractor.visible) {
                if (!this.protractor.parentMesh.visible)
                    this.protractor.setOriginAndAngle(this.protractor.restingPosition, 0);
                this.protractor.show();
            }
            else
                this.protractor.pushAside();
        }
        else {
            this.protractor.hide({ toGoToRestingPosition: true });

        }

        if (this.needSetSquare45()) {
            if (!this.setSquare45.visible) {
                if (!this.setSquare45.parentMesh.visible)
                    this.setSquare45.setOriginAndAngle(this.setSquare45.restingPosition, 0);
                this.setSquare45.show();
            }
            else
                this.setSquare45.pushAside();
        }
        else {
            this.setSquare45.hide({ toGoToRestingPosition: true });

        }

        if (this.protractor.helperVisible) {
            this.protractor.hideHelper({
                animate: true
            })
        }

        this.scene.constructionAnimator.animateCommandGroup(this, {

            nextGroup: options.nextGroup,
            nextStep: options.nextStep,
            onFinish: () => {

                if (options.onFinish) options.onFinish();

            },
            onStop: () => {

                if (options.onStop) options.onStop();

            }
        });
    }

    needRuler() {
        
        if(!this.geoToDraw.inScene || this.geoToDraw.hiddenInitially) return false;
        return this.geoToDraw.isSegment || ((this.geoToDraw.isArc || this.geoToDraw.isCircle) && this.geoToDraw.definition.withSpecificRadius) ;

    }

    needPencil() {

        if(!this.geoToDraw.inScene || this.geoToDraw.hiddenInitially) return false;
        return this.geoToDraw.isPoint || this.geoToDraw.isSegment || this.geoToDraw.isAngle;

    }

    needCompass() {

        if(!this.geoToDraw.inScene || this.geoToDraw.hiddenInitially) return false;
        return this.geoToDraw.isArc || this.geoToDraw.isCircle;

    }

    needProtractor() {
        if(!this.geoToDraw.inScene || this.geoToDraw.hiddenInitially) return false;
        return this.geoToDraw.isAngle;
    }

    needSetSquare45(){

        if(!this.geoToDraw.inScene || this.geoToDraw.hiddenInitially) return false;
        if(this.geoToDraw.isSegment){
            return this.scene.getItemByName(this.geoToDraw.definition.point2Name).definition.constructor === DefPointOnParallelSegment;
        }   
        else{
            return false;
        }
    }
    
    isValid(){
        let isValid = false;
        for(let geoToShow of this.geosToShow){
            isValid = isValid || (geoToShow && geoToShow.visible);
        }
        return this.geoToDraw.visible || isValid;
    }

}
