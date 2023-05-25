import { Mesh, MeshBasicMaterial,  TorusGeometry, Vector2 } from "three";
import Ruler from "../../instruments/Ruler";
import Scene from "../../Scene";
import Pencil from "../../instruments/Pencil";
import Compass from "../../instruments/Compass";
import Arc from "../../geometries/Arc";

import * as util from "../../helper/util"

export default class ArcConstuctionAnimator {


    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {
        this.scene = scene;

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


        this.arcMesh = new Mesh(new TorusGeometry(4, .1, 16, 100), new MeshBasicMaterial({ color: 0xff0000}));
        scene.add(this.arcMesh);
        this.arcMesh.visible = false;
        this.scene.add(this.arcMesh);


    }

    /**
     * 
     * @param {Arc} geoToDraw 
     * @param {*} commandGroup 
     * @param {*} options 
     */
    draw(geoToDraw, commandGroup, options = {}) {

        const def = geoToDraw.definition;
        // const commandGroup = command.commands;

        this.geoToDraw = geoToDraw;

        this.def = def;

        const compass = this.compass;

        this.startAngle = def.itemArcRotationAngle + def.itemArcAngle;
        this.endAngle = def.itemArcRotationAngle;

        if (this.startAngle < this.endAngle) this.startAngle += util.PI_BY_2;

        const origianlOnStop = options.onStop;
        options.onStop = () => {
            this.arcMesh.visible = false;
            origianlOnStop();
        }
    
        const animateDraw = () => {

            compass.moveTween = compass.animate(compass.moveTween, {
                angle: this.startAngle,
            }, { angle: this.endAngle }, 

            Math.sqrt(Math.sqrt(this.startAngle - this.endAngle) * 5 / 20) * 2300
            
            , util.easingSmooth, value => {
                // value
                compass.setPositionAndAngle(compass.origin, 0, value.angle, compass.radius);
                this.updateArc(compass.origin, compass.radius, this.startAngle, value.angle, false)
                this.arcMesh.visible = true;
                
            }, undefined, () => {
                this.arcMesh.visible = false;
                options.onFinish();
            }, options.onStop)
        }

        if (def.withSpecificRadius) {

            if(compass.radiusIndicatorVisible && compass.radius === def.itemRadius){
                compass.setPositionAndAngle(this.geoToDraw.centerPt, 0, this.startAngle, def.itemRadius, {
                    animate: true,
                    delay: 300,
                    onStart: () => {
                    },
                    onFinish: () => {
                        animateDraw();
                    },
                    onStop: options.onStop
                })
            }
            else{
                this.measureCompassOnRuler(def.itemRadius, {
                    onFinish: () => {
                        animateDraw();
                    },
                    onStop: options.onStop,
                })
            }
        }
        else {

            compass.hideRadiusIndicator({ animate: true });
            compass.setPositionAndAngle(this.geoToDraw.centerPt, 0, this.startAngle, def.itemRadius, {
                animate: true,
                delay: 400,
                onStart: () => {
                },
                onFinish: () => {
                    animateDraw();
                },
                onStop: options.onStop
            })
        }
    }

    updateArc(center, radius, startAngle, endAngle, isCounterClockWise) {

        this.angleDiff = util.getAngleDifference(startAngle, endAngle, isCounterClockWise);

        this.arcMesh.geometry = new TorusGeometry(radius, .03, 2, parseInt(this.angleDiff * 33) + 1, this.angleDiff)
        this.arcMesh.position.set(center.x, center.y, 0.01);
        this.arcMesh.rotation.z = isCounterClockWise ? startAngle : endAngle;

        this.angleDiffDegree = this.angleDiff * util.RAD_TO_DEG;

    }

    stop() {

    }

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    updateSegment(pt1, pt2) {

        this.segmentMesh.scale.x = util.getDistance(pt1, pt2);
        this.segmentMesh.rotation.z = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
        this.segmentMesh.position.set(pt1.x + Math.cos(this.segmentMesh.rotation.z) * (this.segmentMesh.scale.x / 2), pt1.y + Math.sin(this.segmentMesh.rotation.z) * (this.segmentMesh.scale.x / 2), 0);

    }

    getPt(pointName, commandGroup) {

        const point1 = this.scene.getItemByName(pointName);

        if (!point1) {

            for (let i = 0; i < commandGroup.commands.length - 1; i++) {
                if (commandGroup.commands[i].name === pointName) {

                    return commandGroup.commands[i].def.position.clone();

                }
            }
        }
        else {
            return point1.position.clone();
        }
    }

    measureCompassOnRuler(length, options = {}) {

        const compass = this.compass;

        const rulerOriginToMasure = {
            x: -5, y: 5
        };
        

        const moveAndMeasureCompass = () => {

            // move compass onto ruler
            compass.setPositionAndAngle({
                x: rulerOriginToMasure.x + (this.ruler.side * this.ruler.vectorNorm.y * .35), y: rulerOriginToMasure.y + (this.ruler.side * -this.ruler.vectorNorm.x * .35)
            }, this.ruler.rulerTickness, 0, compass.radius, {
                duration: 1300,
                animate: true,
                onFinish: () => {

                    // seperate compass arms
                    compass.setPositionAndAngle(compass.origin, compass.currentZ, compass.angle, length, {
                        animate: true,
                        jump: false,
                        delay: 100,
                        onStart: () => {
                            compass.showRadiusIndicator({ animate: true });
                        },
                        onFinish: () => {
                            // move compass to origin ...
                            compass.setPositionAndAngle(this.geoToDraw.centerPt, 0, this.startAngle, length, {
                                animate: true,
                                delay: 500,
                                onStart: () => {
                                    this.ruler.measureAnimate({
                                        x: rulerOriginToMasure.x, y: rulerOriginToMasure.y + 5
                                    }, {
                                        x: rulerOriginToMasure.x + 1, y: rulerOriginToMasure.y + 5
                                    });
                                },
                                onFinish: () => {
                                    options.onFinish();
                                },
                                onStop: options.onStop
                            })
                        },
                        onStop: options.onStop
                    })
                },
                onStop: options.onStop
            })
        }

        this.ruler.measureAnimate(rulerOriginToMasure, { x: rulerOriginToMasure.x + 1, y: rulerOriginToMasure.y },
            {
                onFinish: () => {
                    moveAndMeasureCompass();
                },
                onStop: options.onStop
            }
        )


    }

}