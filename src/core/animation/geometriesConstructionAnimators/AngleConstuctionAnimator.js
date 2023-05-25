import Point from "../../geometries/Point";
import Pencil from "../../instruments/Pencil";
import Scene from "../../Scene";
import TWEEN from '@tweenjs/tween.js';
import { CylinderGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial } from "three";
import Geometry from "../../geometries/abstract/Geometry";
import Definition from "../../definitions/abstract/Definition";
import Protractor from "../../instruments/Protractor";
import * as util from "../../helper/util"

export default class AngleConstuctionAnimator {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        /**
         * @type {Protractor}
         */
        this.protractor = scene.protractor;

        /**
         * @type {Pencil}
         */
        this.pencil = scene.pencil;

        const geometry = new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .012, 20).rotateX(util.PI_BY_2);
        this.material = new MeshBasicMaterial({
            color: Geometry.HIGHLIGHT_COLOR,

        });
        this.pointMesh = new Mesh(geometry, this.material);
        this.pointMesh.visible = false;

        this.scene.add(this.pointMesh);
    }

    stopAndFinish() {

        this.scene.pencil
    }


    /**
     * 
     * @param {Definition} def 
     * @param {Object} pointParms 
     * @param {Object} options 
     */
    draw(geoToDraw, options = {}) {

        const origianlOnStop = options.onStop;

        options.onStop = () => {
            this.pointMesh.visible = false;
            origianlOnStop();
        }

        const pt1 = geoToDraw.definition.pt1;
        const pt2 = geoToDraw.definition.pt2;
        const pt3 = geoToDraw.definition.pt3;

        let lineAngle = util.getAngle2Pts(pt2, pt3);

        if (geoToDraw.definition.inReverseOrder) {
            lineAngle += Math.PI;
        }

        const side = geoToDraw.definition.inReverseOrder ? "l" : "r";

        this.pointMesh.visible = true;
        this.pointMesh.scale.set(0, 0, 1);
        this.pointMesh.position.x = pt1.x;
        this.pointMesh.position.y = pt1.y;

        const drawPoint = () => {

            this.pencil.animaeDrawPoint({
                onUpdate : (value) => {
                    this.pointMesh.scale.set(value.phase, value.phase, 1);
                },
                onFinish : () => {
                    
                    this.wait(100, {
                        
                        onFinish : () => {
                            this.pointMesh.visible = false;
                            options.onFinish(); 
                        },
                        onStop : options.onStop,
                    })

                },
                onStop : () => {
                    this.pointMesh.visible = false;
                    options.onStop();
                } 
            })

        };
     

        const rotationAngleInfo = util.getShortestRotationDirection(this.pencil.rotation.z, util.getAngle2Pts(pt2, pt1));

        this.measureProtractor(pt2, side, lineAngle, geoToDraw.angle, {
            onFinish: () => {

                this.pencil.moveTo(pt1, {
                    animate: true,
                    rotationAngleInfo,
                    onFinish: () => {
                        drawPoint()
                    },
                    onStop: options.onStop
                });

            },
            onStop: options.onStop,
        })

    }

    measureProtractor(origin, side, baseLineAngle, angle, options = {}) {

        console.log('measureProtractor');

        const indicateAngle = () => {

            this.protractor.snappedSide = side;

            this.protractor.moveTween = new TWEEN.Tween({ angle: 0 }).to({ angle: angle, }, Math.sqrt(angle) * 1200).easing(util.easingSmooth)
                .onUpdate(value => {

                    const ang = side === 'r' ? (this.protractor.angle + value.angle) : (this.protractor.angle - Math.PI - value.angle)

                    const ptX = origin.x + Math.cos(ang) * (this.protractor.radius + 0.2)
                    const ptY = origin.y + Math.sin(ang) * (this.protractor.radius + 0.2)

                    this.protractor.updateHelper({ x: ptX, y: ptY }, { ignoreSnap: true });
                    this.protractor.showHelper();
                    
                })
                .onComplete(() => {

                    this.protractor.aniCtrl.removeAnimation(this.protractor.moveTween.getId());
                    options.onFinish();

                })
                .onStop(() => {

                    this.protractor.aniCtrl.removeAnimation(this.protractor.moveTween.getId());
                    options.onStop();

                });

            this.protractor.aniCtrl.addAnimation(this.protractor.moveTween.getId());
            this.protractor.moveTween.start();

        }

        console.log(origin, baseLineAngle);

        this.protractor.setOriginAndAngle(
            origin, baseLineAngle, {
                animate : true,
                onFinish : () => {
                    indicateAngle()
                },
                onStop : options.onStop,

            }
        )

    }

    wait(duration = 200, options = {}) {

        this.scene.waitTween.stop();

        this.scene.waitTween = new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, duration)
            .onComplete(() => {
                this.scene.animationController.removeAnimation(this.scene.waitTween.getId());
                options.onFinish();

            })
            .onStop(() => {
                this.scene.animationController.removeAnimation(this.scene.waitTween.getId());
                if (options.onStop) options.onStop();
            })

        this.scene.animationController.addAnimation(this.scene.waitTween.getId());
        this.scene.waitTween.start();

    }
}