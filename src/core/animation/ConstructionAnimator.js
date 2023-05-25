import Command from "../commands/abstract/Command";
import CommandGroup from "../commands/CommandGroup";
import Arc from "../geometries/Arc";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import Scene from "../Scene";
import AngleConstuctionAnimator from "./geometriesConstructionAnimators/AngleConstuctionAnimator";
import ArcConstuctionAnimator from "./geometriesConstructionAnimators/ArcConstuctionAnimator";
import CircleConstuctionAnimator from "./geometriesConstructionAnimators/CircleConstuctionAnimator";
import PointConstuctionAnimator from "./geometriesConstructionAnimators/PointConstuctionAnimator";
import SegmentConstuctionAnimator from "./geometriesConstructionAnimators/SegmentConstuctionAnimator";
import GeometryDrawer from "./GeometryDrawer";

export default class ConstructionAnimator {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        this.scene = scene;

        this.pointConstructionAnimator = new PointConstuctionAnimator(scene);
        this.segmentConstuctionAnimator = new SegmentConstuctionAnimator(scene);
        this.arcConstuctionAnimator = new ArcConstuctionAnimator(scene);
        this.circleConstuctionAnimator = new CircleConstuctionAnimator(scene);
        this.angleConstuctionAnimator = new AngleConstuctionAnimator(scene);

        this.pencil = scene.pencil;
        this.ruler = scene.ruler;
        this.compass = scene.compass;
        this.protractor = scene.protractor;
        this.setSquare45 = scene.setSquare45;

    }

    /**
     * 
     * @param {GeometryDrawer} commandGroup
     * @param {Array<Command>} allCommands
     */
    animateCommandGroup(commandGroup, options = {}) {


        const geoToDraw = commandGroup.geoToDraw;

        const toHidePencilOnFinish = !((options.nextGroup && options.nextGroup.needPencil()) ||
        ( options.nextStep && options.nextStep.needPencilOnFirstCommandGroup())
        );
        const toHideRulerOnFinish = !((options.nextGroup && options.nextGroup.needRuler()) ||
        ( options.nextStep && options.nextStep.needRulerOnFirstCommandGroup())
        );
        const toHideCompassOnFinish = !((options.nextGroup && options.nextGroup.needCompass())
        || ( options.nextStep && options.nextStep.needCompassOnFirstCommandGroup())
        );
        const toHideProtractorOnFinish = !((options.nextGroup && options.nextGroup.needProtractor())
        || ( options.nextStep && options.nextStep.needProtractorOnFirstCommandGroup())
        );
        const toHideSetSquareOnFinish = !((options.nextGroup && options.nextGroup.needSetSquare45())
        || ( options.nextStep && options.nextStep.needSetSquare45OnFirstCommandGroup())
        );

        const itemInScene = this.scene.getItemByName(geoToDraw.name);

        if(!itemInScene || (itemInScene && itemInScene.hiddenInitially)){

            if (toHidePencilOnFinish) {
                this.pencil.hide({ toGoToRestingPosition: true });
                // console.error("hide pencil .....................")
            }
            else {
                
                // console.warn("lift pencil ..........................")
                this.pencil.lift();
            }

            if (toHideRulerOnFinish) {
                this.ruler.hide({ toGoToRestingPosition: true });
                // console.error("hide ruler");
            }
            else {
                // console.error("lift ruler");
                this.ruler.pushAside();
            }
            
            if(toHideSetSquareOnFinish){
                this.setSquare45.hide({ toGoToRestingPosition: true });
            }
            else{
                this.setSquare45.pushAside();
            }

            if (options.onFinish) options.onFinish();

        }
        else if (geoToDraw.isSegment) {

            this.segmentConstuctionAnimator.draw(
                geoToDraw, commandGroup, {
                // toHidePencil: !toHidePencilOnFinish,
                onFinish: () => {

                    if (toHidePencilOnFinish) {
                        this.pencil.hide({ toGoToRestingPosition: true });
                        // console.error("hide pencil .....................")
                    }
                    else {
                        
                        // console.warn("lift pencil ..........................")
                        this.pencil.lift();
                    }

                    if (toHideRulerOnFinish) {
                        this.ruler.hide({ toGoToRestingPosition: true });
                        // console.error("hide ruler");
                    }
                    else {
                        // console.error("lift ruler");
                        this.ruler.pushAside();
                    }
                    
                    if(toHideSetSquareOnFinish){
                        this.setSquare45.hide({ toGoToRestingPosition: true });
                    }
                    else{
                        this.setSquare45.pushAside();
                    }

                    if (options.onFinish) options.onFinish();
                },
                onStop: () => {

                    if (options.onStop) options.onStop();
                }
            })
        }
        else if (geoToDraw.isPoint) {
            
            this.pointConstructionAnimator.draw(geoToDraw, {
                // toHidePencil: true,
                onFinish: () => {
                    if (toHidePencilOnFinish) {
                        // console.error("hide pencil");
                        this.pencil.hide({ toGoToRestingPosition: true });
                    }
                    else {
                        
                        // console.warn("lift pencil");
                        this.pencil.lift();
                    }

                    if (toHideRulerOnFinish) {
                        
                        this.ruler.hide({ toGoToRestingPosition: true });
                        // console.error("hide ruler");
                    }
                    else {
                        
                        // console.warn("lift pencil");
                    }

                    if (options.onFinish) options.onFinish();
                },
                onStop: () => {
                    if (options.onStop) options.onStop();
                }
            });
        }
        else if (geoToDraw.isArc) {

            this.arcConstuctionAnimator.draw(
                geoToDraw, commandGroup, {
                // toHidePencil: !toHidePencilOnFinish,
                onFinish: () => {

                    if (toHideRulerOnFinish) {
                        
                        this.ruler.hide({ toGoToRestingPosition: true });
                    }
                    else{
                        // console.log(".............  lift ruler")
                        this.ruler.pushAside();
                    }

                    if (toHideCompassOnFinish) {
                        this.compass.hide({ toGoToRestingPosition: true });   
                    }
                    else{
                        // console.log(".............  lift compass")
                        this.compass.pushAside()
                    }

                    if (options.onFinish) options.onFinish();
                },
                onStop: () => {

                    if (options.onStop) options.onStop();
                }
            })
        }
        else if (geoToDraw.isCircle) {

            this.circleConstuctionAnimator.draw(
                geoToDraw, commandGroup, {
                // toHidePencil: !toHidePencilOnFinish,
                onFinish: () => {

                    if (toHideRulerOnFinish) {
                        this.ruler.hide({ toGoToRestingPosition: true });
                    }
                    else{
                        // console.log(".............  lift ruler")
                        this.ruler.pushAside();
                    }

                    if (toHideCompassOnFinish) {
                        this.compass.hide({ toGoToRestingPosition: true });   
                    }
                    else{
                        // console.log(".............  lift compass")
                        this.compass.pushAside()
                    }

                    if (options.onFinish) options.onFinish();
                },
                onStop: () => {

                    if (options.onStop) options.onStop();
                }
            })
        }
        else if(geoToDraw.isAngle){

            this.angleConstuctionAnimator.draw(
                geoToDraw, {
                // toHidePencil: !toHidePencilOnFinish,
                onFinish: () => {

                    // console.log("angle finished................");

                    if(toHidePencilOnFinish){
                        this.pencil.hide({ toGoToRestingPosition: true });
                    }
                    else {
                        
                        this.pencil.lift();
                    }

                    if(toHideProtractorOnFinish){
                        this.protractor.hide({ toGoToRestingPosition: true });
                    }

                    if (options.onFinish) options.onFinish();
                },
                onStop: () => {

                    if (options.onStop) options.onStop();
                }
            })
        }
        else{

            if (options.onFinish) options.onFinish();

            this.scene.requestRender();
        }
  
    }

    stop() {

    }
}