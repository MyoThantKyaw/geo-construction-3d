import Instrument from "./abstract/Instrument";
import TWEEN from '@tweenjs/tween.js';

import { EquirectangularReflectionMapping, Group, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, TextureLoader, Vector2, Vector3 } from "three";
import Point from "../geometries/Point";

import * as util from "../helper/util"

export default class Pencil extends Instrument {

    constructor(options = {}) {
        super();

        this.type = 3;

        Object.assign(this, options);

        this.parentMesh = new Group();
        this.parentMesh.visible = false;
        this.name = "pencil";
        this.position = this.parentMesh.position;
        this.rotation = this.parentMesh.rotation;

        this.restingPosition = new Vector3(20, 10, 0);
        this.restingVector = { x: .1, y: -2 };

        this.zAngle = 0;
        this.opacity = 0;

        this.instrumentType = "Pencil";

        this.materials = [];
        this.childs = [];

        this.loader.load('v2GeoConst3D/models/pencil.glb', (gltf) => {


            gltf.scene.traverse(child => {

                if (child.isMesh) {

                    child.material = new MeshStandardMaterial({
                        color: child.material.color,

                    });

                    child.matrixAutoUpdate = false;
                    child.castShadow = true; //default is false
                    child.receiveShadow = true; //default
                    this.childs.push(child);

                    // this.materialList.push(child.material);
                }
            });

            gltf.scene.scale.set(85, 85, 85);

            this.parentMesh.add(gltf.scene)

            let textureLoader = new TextureLoader();
            textureLoader.load("v2GeoConst3D/textures/Spark212_1.jpg", (texture) => {

                texture.rotation = Math.PI;
                texture.mapping = EquirectangularReflectionMapping;

                this.parentMesh.traverse(child => {

                    if (child.isMesh) {
                        child.material.envMap = texture;

                        if (child.name === "polySurface6") {

                            child.material.color.set(0xcccccc)
                            child.material.needsUpdate = true;
                            child.material.roughness = .1;
                            child.material.metalness = .9;
                        }
                        else if (child.name === "polySurface2") {

                            child.material.roughness = .2;
                            child.material.envMapIntensity = .3;
                            child.material.color.set(0xfa7b00)
                        }
                        else {

                            child.material.roughness = 1;
                            child.material.envMapIntensity = .2;

                        }

                        // child.material.transparent = true;
                        this.materials.push(child.material);
                    }
                });
            });

            this.onReady();

        }, (xhr) => {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => { console.log(error.message); }
        );

    }

    moveTo(newPosition, options = {}) {

        if (options.animate) {

            const fromAngle = options.rotationAngleInfo ? options.rotationAngleInfo.fromAngle : this.rotation.z;
            const toAngle = options.rotationAngleInfo ? options.rotationAngleInfo.toAngle : this.rotation.z;

            const originalX = this.position.x;
            const originalY = this.position.y;
            const originalZ = this.position.z;

            const dist = Math.sqrt(
                ((newPosition.x - originalX) ** 2) +
                ((newPosition.y - originalY) ** 2)
            );

            const z0 = originalZ;
            const z1 = Math.max(1, dist / 4);
            const z2 = newPosition.z || 0;

            const movementVector = new Vector2(
                newPosition.x - this.position.x,
                newPosition.y - this.position.y
            );

            this.stopMoveTween();

            let duration = Math.min(Math.max(
                (Math.sqrt(dist / 30) * 2100),
                Math.abs(toAngle - fromAngle) * 450,
            ), 1500);

            if(duration < 600) duration = 600;

            this.moveTween = new TWEEN.Tween({ phase: 0, angle: fromAngle })
                .to({ phase: 1, angle: toAngle }, duration)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(value => {

                    this.rotation.z = value.angle;
                    this.position.set(
                        originalX + (movementVector.x * value.phase),
                        originalY + (movementVector.y * value.phase),
                        (((1 - value.phase) ** 2) * z0) + (2 * (1 - value.phase) * value.phase * z1) + ((value.phase ** 2) * z2)
                    )

                })
                .onComplete(() => {
                    this.aniCtrl.removeAnimation(this.moveTween.getId());


                    if (options.onFinish) options.onFinish();

                })
                .onStop(() => {
                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    if (options.onStop) options.onStop();
                });

            this.aniCtrl.addAnimation(this.moveTween.getId());
            this.moveTween.start();



        }
        else {

            this.position.copy(newPosition);
        }

    }

    setZRotation(angle, options = {}) {

        if (this.zAngle === angle) return;

        this.stopMoveTween()

        if (options.animate) {

            const angleRotationInfo = util.getShortestRotationDirection(
                this.rotation.z, angle,
            )

            this.moveTween = new TWEEN.Tween({ angle: angleRotationInfo.fromAngle })
                .to({ angle: angleRotationInfo.toAngle }, 140)
                .easing(util.easingSmooth)
                .onUpdate(value => {
                    this.rotation.z = value.angle;
                })
                .onComplete(() => {
                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    if (options.onFinish) options.onFinish();

                })
                .onStop(() => {
                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    if (options.onStop) options.onStop();
                });

            this.aniCtrl.addAnimation(this.moveTween.getId());
            this.moveTween.start();
        }
        else {
            this.rotation.z = angle;
        }

        this.zAngle = angle;

    }

    lift(options = {}) {

        const zToLift = options.zToLift || 1.4;

        this.stopMoveTween();

        this.moveTween = new TWEEN.Tween({ x: this.position.x, y: this.position.y, z: this.position.z })
            .to({ x: this.position.x + 1, y: this.position.y + 1, z: zToLift }, 700)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(value => {


                this.moveTo({
                    x: value.x, y: value.y, z: value.z
                })

            })
            .onComplete(() => {

                this.aniCtrl.removeAnimation(this.moveTween.getId());
                if (options.onFinish) options.onFinish();
            })
            .onStop(() => {
                this.aniCtrl.removeAnimation(this.moveTween.getId());
                if (options.onStop) options.onStop();
            });

        this.aniCtrl.addAnimation(this.moveTween.getId());
        this.moveTween.start();
    }

    show(options = {}) {

        if (this.visible) return;

        super.show();

        if (options.animate) {

            this.parentMesh.visible = true;

            // this.animate(this.opacityTween, { opacity: this.opacity }, { opacity: 1 }, 100, util.easingSmooth,
            //     (value) => {

            //         for (let mat of this.materials) { mat.opacity = value.opacity; }

            //     }, undefined, () => {
            //         for (let child of this.childs) { child.castShadow = true; }
            //         if (options.onFinish) options.onFinish()
            //     }, () => {
            //         if (options.onStop) options.onStop()
            //     })
        }
        else {
            this.parentMesh.visible = true;
        }

    }

    hide(options = {}) {

        if (!this.visible) return;

        super.hide();

        if (options.toGoToRestingPosition) {

            this.moveTo(this.restingPosition, {
                animate: true,
                onFinish: () => {

                    if (!this.visible) {
                        this.parentMesh.visible = false;
                        for (let mat of this.materials) { mat.opacity = 0; }
                        if (options.onFinish) options.onFinish();
                    }

                },
                onStop: () => {

                    this.show();
                    if (options.onStop) options.onStop();
                }
            })
        }
        else if (options.animate) {

            // this.animate(this.opacityTween, { opacity: this.opacity }, { opacity: 0 }, 300, util.easingSmooth,
            //     (value) => {

            //         for (let mat of this.materials) { mat.opacity = value.opacity; }

            //     }, undefined, () => {
            //         this.parentMesh.visible = false;
            //         if (options.onFinish) options.onFinish()
            //     }, () => {
            //         if (options.onStop) options.onStop()
            //     })
        }
        else {

            this.parentMesh.visible = false;
            this.stopOpacityTween();
        }

    }
    

    animaeDrawPoint(options = {}) {

        this.stopMoveTween();

        const currentPosX = this.position.x;
        const currentPosY = this.position.y;

        const pointR = options.r || Point.DEFAULT_RADIUS;

        this.moveTween = new TWEEN.Tween({ angle: 0, phase: 0 })
            .to({ angle: -3.5 * util.TWO_PI, phase: 1 }, 900)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(value => {

                const radius = (1 - (value.phase - 1) ** 2) * pointR * .65;

                this.moveTo({
                    x: currentPosX + (Math.cos(value.angle) * (radius * value.phase)),
                    y: currentPosY + (Math.sin(value.angle) * (radius * value.phase)),
                    z: 0
                });

                if (options.onUpdate) options.onUpdate(value);

            })
            .onComplete(() => {
                this.aniCtrl.removeAnimation(this.moveTween.getId());
                if (options.onFinish) options.onFinish();
            })
            .onStop(() => {
                this.aniCtrl.removeAnimation(this.moveTween.getId());

                if (options.onStop) options.onStop();
            });

        this.aniCtrl.addAnimation(this.moveTween.getId());
        this.moveTween.start();

    }

    isUsableWithCurrentConstr() {
        return false;
    }

}