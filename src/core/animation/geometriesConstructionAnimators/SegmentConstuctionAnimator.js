import { BoxGeometry, Mesh, MeshBasicMaterial, Vector2 } from "three";
import Segment from "../../geometries/Segment";
import Ruler from "../../instruments/Ruler";
import Scene from "../../Scene";
import TWEEN from '@tweenjs/tween.js';
import Pencil from "../../instruments/Pencil";
import DefPointOnInvisibleCircle from "../../definitions/points/DefPointOnInvisibleCircle";
import DefPointWithAngleAndLenFromALine from "../../definitions/points/DefPointWithAngleAndLenFromALine";
import DefPointOnParallelSegment from "../../definitions/points/DefPointOnParallelSegment";
import SetSquare45 from "../../instruments/SetSquare45";

import * as util from "../../helper/util"

export default class SegmentConstuctionAnimator {


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
         * @type {SetSquare45}
         */
        this.setSquare45 = scene.setSquare45;

        this.material = new MeshBasicMaterial({
            // color: Geometry.DEFAULT_COLOR,
            color: 0xff0000
        });

        this.segmentMesh = new Mesh(
            new BoxGeometry(1, Segment.DEFAULT_LINE_WIDTH, 0.012),
            this.material
        );

        this.segmentMesh.visible = false;
        this.scene.add(this.segmentMesh);

        // this.testPoint1 = new Mesh(new SphereGeometry(.2, 10, 10), new MeshBasicMaterial({ color :0xf9039f}))
        // this.testPoint2 = new Mesh(new SphereGeometry(.2, 10, 10), new MeshBasicMaterial({ color :0x29f39f}))

        // scene.add(this.testPoint1);
        // scene.add(this.testPoint2);

    }

    /**
     * 
     * @param {Segment} geoToDraw 
     * @param {*} commandGroup 
     * @param {*} options 
     */
    draw(geoToDraw, commandGroup, options = {}) {

        
        const origianlOnStop = options.onStop;

        options.onStop = () => {
            this.segmentMesh.visible = false;
            origianlOnStop();
        }


        this.segmentMesh.scale.setX(0);
        this.segmentMesh.visible = true;

        if (this.scene.getItemByName(geoToDraw.definition.point2Name).definition.constructor === DefPointOnParallelSegment) {

            this.drawWithSetSquare(geoToDraw, commandGroup, options);
        }
        else {
            this.drawWithRuler(geoToDraw, commandGroup, options);
        }


    }

    drawWithRuler(geoToDraw, commandGroup, options = {}) {

        const def = geoToDraw.definition;

        let pt1 = geoToDraw.pt1;
        let pt2 = geoToDraw.pt2;

        const animateDraw = () => {

            const druation = Math.max(Math.min(Math.sqrt(util.getDistance(pt1, pt2) / 20) * 2200, 1600), 800);

            this.pencil.moveTween = new TWEEN.Tween({ x: pt1.x, y: pt1.y, phase: 0 })
                .to({ x: pt2.x, y: pt2.y, phase: 1 }, druation)
                .delay(60)
                .easing(util.easingSmooth)
                .onUpdate(value => {
                    this.pencil.moveTo({
                        x: ((1 - value.phase) * pt1.x) + (value.phase * pt2.x),
                        y: ((1 - value.phase) * pt1.y) + (value.phase * pt2.y),
                        z: 0
                    })
                    this.updateSegment(
                        pt1,
                        this.pencil.position,
                    );
                })
                .onComplete(() => {

                    this.segmentMesh.visible = false;
                    this.pencil.aniCtrl.removeAnimation(this.pencil.moveTween.getId());

                    options.onFinish();

                })
                .onStop(() => {

                    this.segmentMesh.visible = false;
                    this.pencil.aniCtrl.removeAnimation(this.pencil.moveTween.getId());

                    options.onStop();

                });

            this.pencil.aniCtrl.addAnimation(this.pencil.moveTween.getId());
            this.pencil.moveTween.start();

        }


        const point1Name = geoToDraw.definition.point1Name;
        const point2Name = geoToDraw.definition.point2Name;

        const isFixedLength = this.isFixedLength(point1Name, point2Name);

        pt1.z = 0;
        pt2.z = 0;

        const lineAngle = util.getAngle2Pts(pt1, pt2);

        const point1 = this.scene.getItemByName(def.point1Name);
        const point2 = this.scene.getItemByName(def.point1Name);

        if ((point1 && point2) || (!point1 && !point2)) {

            if ((lineAngle > Math.PI)) {
                const tmpPt = pt2;
                pt2 = pt1;
                pt1 = tmpPt;
            }
        }

        const pencilAngle = util.getPencilInclinationAngle({ x: pt2.x - pt1.x, y: pt2.y - pt1.y }, this.ruler.side);

        const rotationAngleInfo = util.getShortestRotationDirection(this.pencil.rotation.z, pencilAngle);

        let rulerOrigin;

        if (isFixedLength) {
            rulerOrigin = pt1;
        }
        else {
            const vect = new Vector2(pt2.x - pt1.x, pt2.y - pt1.y).setLength(1.4);
            rulerOrigin = new Vector2(pt1.x - vect.x, pt1.y - vect.y);
        }

        this.ruler.measureAnimate(rulerOrigin, pt2, {

            onFinish: () => {

                this.pencil.moveTo(pt1, {
                    animate: true,
                    rotationAngleInfo,
                    onFinish: () => {
                        animateDraw();
                    },
                    onStop: options.onStop,
                });

            },
            onStop: () => {
                if (options.onStop) options.onStop();
            }
        })

    }

    drawWithSetSquare(geoToDraw, commandGroup, options = {}) {

        const def = geoToDraw.definition;

        const point2Def = this.scene.getItemByName(geoToDraw.definition.point2Name).definition

        const parallelSegmentPoint1 = this.scene.getItemByName(point2Def.segmentPoint1Name);
        const parallelSegmentPoint2 = this.scene.getItemByName(point2Def.segmentPoint2Name);

        let pt1 = geoToDraw.pt1;
        let pt2 = geoToDraw.pt2;

        let refSegmentPt1, refSegmentPt2;

      
        refSegmentPt2 = parallelSegmentPoint2.position;
        refSegmentPt1 = parallelSegmentPoint1.position;

        const side = util.getSideOfSegment(pt1, refSegmentPt1, refSegmentPt2);


        if(side === -1){
            let pt = pt1;
            pt1 = pt2;
            pt2 = pt;

            pt = refSegmentPt1;
            refSegmentPt1 = refSegmentPt2;
            refSegmentPt2 = pt;
        }
     
        const animateDraw = () => {

            const druation = Math.max(Math.min(Math.sqrt(util.getDistance(pt1, pt2) / 20) * 2200, 1600), 800);

            this.pencil.moveTween = new TWEEN.Tween({ x: pt1.x, y: pt1.y, phase: 0 })
                .to({ x: pt2.x, y: pt2.y, phase: 1 }, druation)
                .delay(60)
                .easing(util.easingSmooth)
                .onUpdate(value => {
                    this.pencil.moveTo({
                        x: ((1 - value.phase) * pt1.x) + (value.phase * pt2.x),
                        y: ((1 - value.phase) * pt1.y) + (value.phase * pt2.y),
                        z: 0
                    })
                    this.updateSegment(
                        pt1,
                        this.pencil.position,
                    );
                })
                .onComplete(() => {

                    this.segmentMesh.visible = false;
                    this.pencil.aniCtrl.removeAnimation(this.pencil.moveTween.getId());

                    options.onFinish();

                })
                .onStop(() => {

                    this.segmentMesh.visible = false;
                    this.pencil.aniCtrl.removeAnimation(this.pencil.moveTween.getId());

                    options.onStop();

                });

            this.pencil.aniCtrl.addAnimation(this.pencil.moveTween.getId());
            this.pencil.moveTween.start();

        }

        const moveSetSquare = () => {

            const pencilAngle = util.getPencilInclinationAngle({ x: pt2.x - pt1.x, y: pt2.y - pt1.y }, 1);

            const rotationAngleInfo = util.getShortestRotationDirection(this.pencil.rotation.z, pencilAngle);

            this.setSquare45.setOriginAndAngle(this.interesctRulerAndLineToDraw, this.setSquare45.angle, {
                animate: true,
                onFinish: () => {

                    this.ruler.measureAnimate(
                        { x: this.ruler.origin.x + this.ruler.vectorNorm.y * 20, y: this.ruler.origin.y - this.ruler.vectorNorm.x * 20 },
                        { x: Math.cos(this.ruler.angle) + this.ruler.origin.x + this.ruler.vectorNorm.y * 20, y: Math.sin(this.ruler.angle) + this.ruler.origin.y - this.ruler.vectorNorm.x * 20 }, {
                        onStop: options.onStop,
                    })

                    this.pencil.moveTo(pt1, {
                        animate: true,
                        rotationAngleInfo,
                        onFinish: () => {
                            animateDraw();
                        },
                        onStop: options.onStop,
                    });

                },
                onStop: options.onStop,
            })
        }

        const moveRuler = () => {

            this.setSquareSideVector = new Vector2(
                Math.cos(this.setSquare45.angle - util.PI_BY_4),
                Math.sin(this.setSquare45.angle - util.PI_BY_4),
            )

         
            let rulerPt1 = this.interesctRulerAndLineToDraw;
            let rulerPt2 = this.intersectRulerAndRefLine;

    
            let start = rulerPt1;
            let end = rulerPt2;

            if(this.ruler.side === -1){

                const vect = {x : rulerPt2.x - rulerPt1.x, y : rulerPt2.y - rulerPt1.y};
                
                const normalVect = new Vector2(vect.y, -vect.x).setLength(this.ruler.rulerWidth + this.ruler.offsetForLine * 2);

                start = {
                    x : rulerPt1.x + (normalVect.x), y : rulerPt1.y + (normalVect.y )
                }
                end = {
                    x : rulerPt2.x + (normalVect.x ), y : rulerPt2.y + (normalVect.y )
                }
            }
            
            // this.testPoint1.position.x = start.x;
            // this.testPoint1.position.y = start.y;

            // this.testPoint2.position.x = end.x;
            // this.testPoint2.position.y = end.y;

            const vect = new Vector2(end.x - start.x, end.y - start.y);
            vect.setLength(3);

            start.x -= vect.x;
            start.y -= vect.y;

            end.x += vect.x;
            end.y += vect.y;
            
            this.ruler.measureAnimate(
                start,
                end,
                {

                    onFinish: () => {

                        moveSetSquare();

                    },
                    onStop: options.onStop,
                })

            // interesctRulerAndLineToDraw,
        }

        // move set square..

        const lineVector = new Vector2(pt2.x - pt1.x, pt2.y - pt1.y).normalize();
        const sideVector = util.rotateVector(lineVector, -util.PI_BY_4).normalize();

        this.intersectRulerAndRefLine = new Vector2(
            refSegmentPt1.x - lineVector.x, 
            refSegmentPt1.y - lineVector.y, 
            )

        const pt = util.intersect2Lines4Pts(
            pt1, pt2, this.intersectRulerAndRefLine, {
                x : this.intersectRulerAndRefLine.x + sideVector.x, 
                y : this.intersectRulerAndRefLine.y + sideVector.y, 
            }
        );

        this.interesctRulerAndLineToDraw = new Vector2(pt.x, pt.y);
        
        if (util.intersectTwoSegments(
            
            this.intersectRulerAndRefLine, 
            this.intersectRulerAndRefLine.clone().add(sideVector.clone().multiplyScalar(-9999)), 
            pt1, pt2)) {

            this.interesctRulerAndLineToDraw = new Vector2(pt1.x - lineVector.x, pt1.y - lineVector.y);
            this.intersectRulerAndRefLine = util.intersect2Lines4Pts(
                refSegmentPt1, refSegmentPt2, this.interesctRulerAndLineToDraw, {
                    x : this.interesctRulerAndLineToDraw.x + sideVector.x, 
                    y : this.interesctRulerAndLineToDraw.y + sideVector.y, 
                }
            )
        }

        if (this.ruler.visible) {

        }
        else {

        }

        this.setSquare45.setOriginAndAngle(
            this.intersectRulerAndRefLine,
            util.getAngle2Pts(refSegmentPt1, refSegmentPt2), {
            animate: true,
            onFinish: () => {
                moveRuler();
            },
            onStop: options.onStop,
        })

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

    isFixedLength(point1Name, point2Name) {

        // const point1 = this.scene.getItemByName(point1Name);
        const point2 = this.scene.getItemByName(point2Name);

        if (point2.definition.constructor === DefPointOnInvisibleCircle ||
            point2.definition.constructor === DefPointWithAngleAndLenFromALine
        ) {
            return true;
        }

        return false

    }
}