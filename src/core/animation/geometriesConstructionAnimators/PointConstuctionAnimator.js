import Point from "../../geometries/Point";
import Pencil from "../../instruments/Pencil";
import Scene from "../../Scene";
import TWEEN from '@tweenjs/tween.js';
import { CylinderGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial } from "three";
import Geometry from "../../geometries/abstract/Geometry";
import Definition from "../../definitions/abstract/Definition";
import * as util from "../../helper/util"

export default class PointConstuctionAnimator {

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

        const geometry = new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .012, 20).rotateX(util.PI_BY_2);
        this.material = new MeshBasicMaterial({
            // color: Geometry.DEFAULT_COLOR,
            color : 0xff0000,
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
    draw(geoToDraw , options = {}) {

        
        const origianlOnStop = options.onStop;

        options.onStop = () => {
            this.pointMesh.visible = false;
            origianlOnStop();
        }


        const position = geoToDraw.position.clone();

        const angle = options.angle || Math.PI / 4;
        // this.material.color.set(options.color || Geometry.DEFAULT_COLOR);

        this.pointMesh.visible = true;
        this.pointMesh.scale.set(0, 0, 1);
        this.pointMesh.position.x = position.x;
        this.pointMesh.position.y = position.y;

        const animateDraw = () => {

            this.pencil.animaeDrawPoint({
                r : geoToDraw.r,
                onUpdate : (value) => {
                    this.pointMesh.scale.set(value.phase, value.phase, 1);
                },
                onFinish : () => {
                    this.pointMesh.visible = false;
                    options.onFinish();
                },
                onStop : () => {
                    this.pointMesh.visible = false;
                    options.onStop();
                } 
            })
        };

        const rotationAngleInfo = util.getShortestRotationDirection(this.pencil.rotation.z, angle);

        this.pencil.moveTo(position, {
            animate: true,
            rotationAngleInfo,
            onFinish: () => {
                animateDraw();
            },
            onStop : () => {
                if (options.onStop) options.onStop();
            }
        });
    }
}