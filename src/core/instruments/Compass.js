
import TWEEN from '@tweenjs/tween.js';
import Instrument from "./abstract/Instrument"
import { MeshLambertMaterial, Box3, TextureLoader, EquirectangularReflectionMapping, Group, Plane, PlaneHelper, Vector3, PlaneGeometry, Mesh, Vector2, BoxGeometry, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from "three"
import Label from '../graphics/Label';
import DefLabelBetween2StaticPoints from '../definitions/labels/DefLabelBetween2StaticPoints';
import Scene from '../Scene';
import ConstructorWithInstruments from '../geometryConstructors/ConstructorWithInstruments';

import * as util from "../helper/util"


export default class Compass extends Instrument {

    constructor(options) {

        super();

        Object.assign(this, options);

        this.parentMesh = new Group();
        this.parentMesh.visible = false;

        this.rightSide = [];
        this.name = "compass";
        this.isCompass = true;
        this.loadedParts = 0;

        this.noOfPartsToLoad = 3;

        this.scale = 90;

        this.angle = 0;
        this.origin = new Vector3(0, 0, 0);
        this.radius = 0;
        this.currentZ = 0;
        this.inDrawMode = false;

        this.name = "Compass";
        this.restingPosition = new Vector2(5, 16);

        this.type = 3;

        // this.restingPosition.x *= -1;

        this.radiusLabelDef = new DefLabelBetween2StaticPoints(new Vector2(1, 1), new Vector2());
        this.radiusLabel = new Label(this.radiusLabelDef, {
            vOffset: .15,
            vAlign: Label.V_ALIGN_BOTTOM,
            color: 0xff1900,
            isInteractable : false,
        });
        this.radiusLabel.z = .02;

        this.radiusLine = new Mesh(
            new BoxGeometry(1, .03, 0.01),
            new MeshBasicMaterial({
                color: 0xff1900,
                opacity: 1,
                transparent: true,
            })
        );
        // this.radiusLine.castShadow = true;
        this.radiusIndicatorVisible = this.radiusLine.visible = false;

        this.tmpNewOrigin = new Vector2()

        this.loader.load('v2GeoConst3D/models/compass_head.glb', (gltf) => {

            this.loadedParts++;

            this.headGroup = gltf.scene;

            this.headGroup.traverse(child => {

                if (child.isMesh) {
                    child.castShadow = true;
                }
            })

            if (this.loadedParts === this.noOfPartsToLoad) {
                this.finishLoadedParts();
            }

        }, (xhr) => {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error(error.message);
        });

        this.loader.load('v2GeoConst3D/models/compass_left_hand.glb', (gltf) => {

            this.loadedParts++;

            this.leftHandGroup = gltf.scene;

            this.leftHandGroup.traverse(child => {

                if (child.isMesh) {
                    child.castShadow = true;
                }
            })

            if (this.loadedParts === this.noOfPartsToLoad) {
                this.finishLoadedParts();
            }
        }, (xhr) => {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error(error.message);
        }
        );

        this.loader.load('v2GeoConst3D/models/compass_right_hand.glb', (gltf) => {

            this.loadedParts++;

            this.rightHandGroup = gltf.scene;

            this.rightHandGroup.traverse(child => {

                if (child.isMesh) {
                    child.castShadow = true;
                }
            })


            if (this.loadedParts === this.noOfPartsToLoad) {
                this.finishLoadedParts();
            }

        }, (xhr) => {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error(error.message);
        });



    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene);
        scene.add(this.radiusLabel);
        scene.add(this.radiusLine);

        this.allPoints = scene.points;

        this.setPositionAndAngle({ x: 1, y: 1 }, 0, 1, 3);

        this.scene.on("Control:down", () => {
            if (scene.geoConstructor.constructor === ConstructorWithInstruments && !this.inDrawMode)
                this.enterDrawMode();
        })

        this.scene.on("keyup", () => {

            if (scene.geoConstructor.constructor === ConstructorWithInstruments && this.inDrawMode && this.drawModeStartAngle !== undefined && this.drawModeEndAngle !== undefined) {

                scene.geoConstructor.createArc(this);
                this.exitDrawMode();
                this.scene.requestRender();
            }
            else if (this.inDrawMode) {
                this.exitDrawMode();
                this.scene.requestRender();
            }
        
        })
    }

    finishLoadedParts() {

        // this.leftHandGroup.renderOrder = 3;
        // this.rightHandGroup.renderOrder = 3;
        // this.headGroup.renderOrder = 3;

        this.parentMesh.add(this.leftHandGroup);
        this.parentMesh.add(this.rightHandGroup);
        this.parentMesh.add(this.headGroup);

        this.leftHandGroup.traverse(child => { if (child.isMesh) child.partType = "m"; })
        this.headGroup.traverse(child => { if (child.isMesh) child.partType = "r"; })
        this.rightHandGroup.traverse(child => { if (child.isMesh) child.partType = "ra"; })

        this.parentMesh.traverse(child => {
            if (child.isMesh) {
                // child.parentGeo = this;
                this.selectableMeshes.push(child);
            }
        })

        // utils.setOpacity(this.materialList, 0);

        this.changeMaterials();
        this.makeCompassMetallic();

        // this.headGroup.matrixAutoUpdate = false;
        // this.rightHandGroup.matrixAutoUpdate = false;
        // this.leftHandGroup.matrixAutoUpdate = false;

        this.parentMesh.scale.set(this.scale, this.scale, this.scale);

        this.rightHandBox = new Box3().setFromObject(this.rightHandGroup);
        this.heightOfRightHand = -(this.rightHandBox.min.z * this.scale) - 0.035;

        this.resetSeperation();

        this.onReady();

        this.refPlaneToMove = new Mesh(new PlaneGeometry(1000, 1000), new MeshLambertMaterial({ visible: true, color: 0x933f3, transparent: true, opacity: .4 }));

    }

    onDragStart(pt) {

        this.refPlaneToMove.position.z = this.intersect.point.z;
        this.refPlaneToMove.updateMatrixWorld();

        this.scene.getPointerCoordinateOnPlane(this.scene.pointerDownEvent, this.tempVect2_1, this.refPlaneToMove);

        this.dragMode = this.intersect.object.partType;

        if (this.dragMode === 'm') {

            this.offsetX = this.tempVect2_1.x - this.origin.x;
            this.offsetY = this.tempVect2_1.y - this.origin.y;

            if (this.inDrawMode) {
                this.drawModeStartAngle = this.drawModeEndAngle = undefined;
            }

        }
        else {
            this.offsetAngle = util.getAngleDifference(
                this.angle,
                util.getAngle2Pts(this.origin, this.tempVect2_1)
            )

            this.offsetRadius = util.getDistance(this.origin, this.tempVect2_1) - this.radius;

        }

        if (this.inDrawMode && (this.dragMode === 'm' || this.dragMode === 'ra')) {
            this.drawModeStartAngle = this.drawModeEndAngle = undefined;
        }

    }

    onDrag(e) {

        const intersect = this.scene.raycaster.intersectObject(this.refPlaneToMove);

        if (intersect.length === 0) return;

        this.tmpNewOrigin.set(intersect[0].point.x, intersect[0].point.y);

        if (this.dragMode === 'm') {

            this.tmpNewOrigin.x -= this.offsetX;
            this.tmpNewOrigin.y -= this.offsetY;

            let ptToSnap;

            if (this.scene.ruler.visible) {
                ptToSnap = this.scene.ruler.getPtToSnapOrigin(this.tmpNewOrigin);
            }

            if (ptToSnap) { // snap origin of ruler

                this.tmpNewOrigin.x = ptToSnap.x;
                this.tmpNewOrigin.y = ptToSnap.y;

                this.itemSnappedForOrigin = undefined;

            }
            else {

                this.itemSnappedForOrigin = this.getPtToSnapOrigin(this.tmpNewOrigin);

                if (this.itemSnappedForOrigin) {
                    this.tmpNewOrigin.x = this.itemSnappedForOrigin.position.x;
                    this.tmpNewOrigin.y = this.itemSnappedForOrigin.position.y;
                }
            }

            this.setPositionAndAngle(this.tmpNewOrigin, 0, this.angle, this.radius);

        }
        else if (this.dragMode === 'r') {

            this.setPositionAndAngle(this.origin, 0, util.getAngle2Pts(this.origin, this.tmpNewOrigin) - this.offsetAngle, this.radius);

            if (this.inDrawMode) {

                let angle = this.angle;

                if (Math.abs(angle) >= util.TWO_PI)  angle = angle % util.TWO_PI;
                if (angle < 0)  angle = util.TWO_PI + angle;
                
                if (this.midAngle === undefined) {
                    this.startAngle = this.endAngle = this.midAngle = angle;
                    this.isArcCompleteCircle = false;
                    this.lastAngle = angle;
                    this.curentAngle = angle;

                    this.drawModeStartAngle = this.startAngle;
                    this.drawModeEndAngle = this.endAngle;
    
                }
                else {

                    const angDiffLeft = util.getAngleDifference(this.lastAngle, angle, true);
                    const angDiffRight = util.getAngleDifference(this.lastAngle, angle, false);


                    if(angDiffLeft < angDiffRight){
                    
                        this.curentAngle += angDiffLeft;
                
                    }
                    else if(angDiffRight < Math.PI){

                        this.curentAngle -= angDiffRight;

                    }

                    this.lastAngle = angle;

                    if(this.curentAngle > this.endAngle){
                        this.endAngle = this.curentAngle;
                    }

                    if(this.curentAngle < this.startAngle){
                        this.startAngle = this.curentAngle;
                    }

                    if((this.endAngle - this.startAngle) >= util.TWO_PI){
                        this.isArcCompleteCircle = true;
                        this.drawModeStartAngle = this.startAngle;                        
                        this.drawModeEndAngle = this.drawModeStartAngle - 0.0001;
        
                    }
                    else{
                        this.drawModeStartAngle = this.startAngle;
                        this.drawModeEndAngle = this.endAngle;
                    }
         
                }
             
                if (this.scene.geoConstructor.constructor === ConstructorWithInstruments) {
                    this.scene.geoConstructor.updateArc(this.origin, this.radius, this.drawModeStartAngle, this.drawModeEndAngle, true);
                }
            }
        }
        // else if (this.dragMode === 'r') {
        else { // dragMode === 'ra'

            let angle = util.getAngle2Pts(this.origin, this.tmpNewOrigin) - this.offsetAngle;
            let radius = util.getDistance(this.origin, this.tmpNewOrigin) - this.offsetRadius;

            if (radius <= 0) return;

            this.tmpPt.x = this.origin.x + Math.cos(angle) * radius;
            this.tmpPt.y = this.origin.y + Math.sin(angle) * radius;

            if (this.scene.ruler.visible) {

                if (this.scene.ruler.getPtToSnapOrigin(this.origin) && this.scene.ruler.getPtToSnapOrigin(this.tmpPt)) {

                    angle = this.scene.ruler.angle;
                    radius = this.scene.ruler.dotToRulerVect;
                    this.showRadiusIndicator();
                }
                else {
                    this.hideRadiusIndicator();
                }
            }
            else {
                this.hideRadiusIndicator();
            }

            this.setPositionAndAngle(this.origin, 0, angle, radius);

        }

        this.dispatchEvent("update");

    }

    onDragEnd(pt) {

        this.dragMode = undefined;
        this.midAngle = undefined;

        this.dispatchEvent("update");

        if (this.scene.geoConstructor.constructor === ConstructorWithInstruments && this.inDrawMode && this.drawModeStartAngle !== undefined && this.drawModeEndAngle !== undefined) {

            this.scene.geoConstructor.createArc(this);
            this.exitDrawMode();
            this.scene.requestRender();
        }

    }

    getMeasurementOnRuler(length, options = {}) {

        const ruler = this.scene.ruler;

        const ptOnRuler = ruler.getPtToSnapOrigin(ruler.origin);

        ptOnRuler.x += -ruler.vectorNorm.y * .2;
        ptOnRuler.y += ruler.vectorNorm.x * .2;

        this.setPositionAndAngle(ptOnRuler, ruler.rulerTickness, ruler.angle, this.radius, {
            animate: true,
            // duration: 1200,
            onFinish: () => {

                console.log("on fisnih..");

                this.showRadiusIndicator();

                this.setPositionAndAngle(this.origin, ruler.rulerTickness, this.angle, length, {
                    animate: true,
                    // duration: 1000,
                    onFinish: () => {
                        if (options.onFinish) options.onFinish();
                    },
                    onStop: options.onStop,
                })

            },
            onStop: options.onStop,
        })

    }

    showRadiusIndicator(options = {}) {

        if (this.radiusIndicatorVisible) return;

        options.duration = 200;

        if (options.animate) {
            this.opacityTween = this.animate(this.opacityTween, { opacity: this.radiusLine.material.opacity }, { opacity: 1 }, options.duration, util.easingSmooth, value => {
                this.radiusLine.material.opacity = value.opacity;
            }, undefined, options.onFinish, options.onStop);
        }
        else {
            this.radiusLine.material.opacity = 1;
        }
        this.radiusLine.visible = true;
        this.radiusIndicatorVisible = true;

        this.radiusLabel.show(options);


    }

    hideRadiusIndicator(options = {}) {

        if (!this.radiusIndicatorVisible) return;

        options.duration = 240;

        if (options.animate) {
            this.opacityTween = this.animate(this.opacityTween, { opacity: this.radiusLine.material.opacity }, { opacity: 0 }, options.duration, util.easingSmooth, value => {
                this.radiusLine.material.opacity = value.opacity;
            }, undefined, 
            () => { 
                this.radiusLine.visible = false; 
                this.radiusLine.material.opacity = 0; 
                if (options.onFinish) options.onFinish();
            }, options.onStop);
        }
        else {
            this.radiusLine.visible = false;
            this.radiusLine.material.opacity = 0;
        }

        this.radiusIndicatorVisible = false;
        this.radiusLabel.hide(options);

    }

    updateCursor(e) {

        this.refPlaneToMove.position.z = this.intersect.point.z;
        this.refPlaneToMove.updateMatrixWorld();

        this.scene.getPointerCoordinateOnPlane(e, this.tempVect2_1, this.refPlaneToMove);

        this.dragMode = this.intersect.object.partType;

        if (this.dragMode === 'm')
            this.scene.setCursor("move");
        else if (this.dragMode === 'r')
            this.scene.setCursor("revolve");
        else if (this.dragMode === 'ra')
            this.scene.setCursor("width");

    }

    enterDrawMode() {

        if (this.inDrawMode) return;
        this.drawModeStartAngle = this.drawModeEndAngle = undefined;
        this.inDrawMode = true;

    }

    exitDrawMode() {

        this.inDrawMode = false;
        // this.hide();
    }

    getPtToSnapOrigin(origin, indicate = true) {

        let minDist = .2;
        let snappedPoint = undefined;

        if (this.scene.ruler.visible && this.scene.ruler.isPtOnInstrument(origin)) {
            return;
        }

        const checkPoint = (point) => {
            const dist = util.getDistance(point.position, origin);

            if (dist <= minDist) {
                minDist = dist;
                snappedPoint = point;
            }
        }

        for (let i = 0; i < this.allPoints.length; i++) {
            checkPoint(this.allPoints[i]);
        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {
            checkPoint(this.scene.intersectionPts[i]);
        }

        if (snappedPoint && this.itemSnappedForOrigin !== snappedPoint && indicate) {
            if (this.itemSnappedForOrigin && this.itemSnappedForOrigin.outlineTween) {
                this.itemSnappedForOrigin.outlineTween.stop();
                this.itemSnappedForOrigin.outlineFactor = 0;
            }

            if (snappedPoint.indicate)
                snappedPoint.indicate();
        }

        return snappedPoint;
    }

    show(options = {}) {

        super.show();
        this.parentMesh.visible = this.scene.states.compassVisible = true;

    }

    hide(options = {}) {

        if (!this.visible) return;

        super.hide();

        if (options.toGoToRestingPosition) {

            this.hideRadiusIndicator({ animate: true });

            this.setPositionAndAngle(this.restingPosition, 0, this.angle, Math.min(1, this.radius), {
                animate: true,
                onFinish: () => {

                    if (!this.visible) {
                        this.parentMesh.visible = false;
                        if (options.onFinish) options.onFinish();
                    }
                },
                onStop: () => {
                    // this.show();
                    if (options.onStop) options.onStop();
                }
            })
        }
        else if (options.animate) {
            this.parentMesh.visible = false;
            this.hideRadiusIndicator({ animate: true });
        }
        else {
            this.parentMesh.visible = false;
            this.hideRadiusIndicator();
        }

        this.scene.states.compassVisible = false;
    }

    setPositionAndAngle(center, z, angle, radius, options = {}) {

        if (options.animate) {

            const angleRotationInfo = util.getShortestRotationDirection(this.angle, angle);

            let duration = Math.max(
                Math.sqrt(util.getDistance(center, this.origin)) * 2,
                (Math.sqrt(Math.abs(radius - this.radius)) * 3),
                Math.sqrt(Math.abs(angleRotationInfo.toAngle - angleRotationInfo.fromAngle)) * 5,
                Math.abs(z - this.currentZ) * 3
            );
            duration = Math.sqrt(duration / 20) * 2300;

            let z0 = this.currentZ;
            let z1 = util.getDistance(center, this.origin) / 1.5;
            let z2 = z;

            this.stopMoveTween();
            this.moveTween = new TWEEN.Tween({ cx: this.origin.x, cy: this.origin.y, z: this.currentZ, angle: angleRotationInfo.fromAngle, radius: this.radius, phase: 0 })
                .to({ cx: center.x, cy: center.y, angle: angleRotationInfo.toAngle, z: z, radius: radius, phase: 1 }, options.duration || duration)
                .easing(util.easingSmooth)
                .delay(options.delay || 0)
                .onStart(() => {
                    if (options.onStart) options.onStart();
                })
                .onUpdate(value => {

                    if (options.jump === false) {
                        this.setPositionAndAngle({ x: value.cx, y: value.cy }, value.z, value.angle, value.radius);
                    }
                    else {
                        const zz = (((1 - value.phase) ** 2) * z0) + (2 * (1 - value.phase) * value.phase * z1) + ((value.phase ** 2) * z2)
                        this.setPositionAndAngle({ x: value.cx, y: value.cy }, zz, value.angle, value.radius);

                    }

                    if (options.onUpdate) options.onUpdate(value);



                })
                .onComplete(() => {

                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    if (options.onFinish) options.onFinish();

                })
                .onStop(() => {

                    // this.segmentMesh.visible = false;
                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    if (options.onStop) options.onStop();

                });

            this.aniCtrl.addAnimation(this.moveTween.getId());
            this.moveTween.start();

        }
        else {

            const angleRadius = Math.asin(((radius - 0.02) / 2) / this.heightOfRightHand);

            this.rightHandGroup.rotation.set(0, 0, 0);
            this.leftHandGroup.rotation.set(0, 0, 0);
            this.headGroup.rotation.set(0, 0, 0);

            this.rightHandGroup.rotation.z = angle;
            this.leftHandGroup.rotation.z = angle;
            this.headGroup.rotation.z = angle;

            this.rightHandGroup.rotateY(-angleRadius);
            this.leftHandGroup.rotateY(angleRadius);

            this.parentMesh.position.set(center.x + (((radius - 0.005) / 2) * Math.cos(angle)), center.y + (((radius - 0.005) / 2) * Math.sin(angle)), z + Math.cos(angleRadius) * this.heightOfRightHand)

            this.headGroup.updateMatrix();
            this.rightHandGroup.updateMatrix();
            this.leftHandGroup.updateMatrix();

            this.parentMesh.updateMatrix();

            this.angle = angle;
            this.origin.copy(center);
            this.currentZ = z;

            this.radius = radius;

            this.tmpPt.set(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);

            this.radiusLine.scale.x = radius;
            this.radiusLine.position.set(this.origin.x + Math.cos(angle) * (radius / 2), this.origin.y + Math.sin(angle) * (radius / 2), 0);
            this.radiusLine.rotation.z = angle;

            if (this.scene.ruler.visible && this.scene.ruler.isPtOnInstrument(center) && !this.moveTween.isPlaying()) {

                this.parentMesh.position.z += this.scene.ruler.rulerTickness;
                this.currentZ = this.currentZ + this.scene.ruler.rulerTickness;

            }

            this.radiusLine.position.z = this.currentZ + 0.01;
            this.radiusLabel.z = this.currentZ + .012;
            this.radiusLabelDef.update(this.origin, this.tmpPt);

        }
    }

    pushAside(options = {}) {

        options.animate = true;
        options.jump = false;

        this.setPositionAndAngle({
            x: this.origin.x, y: this.origin.y
        }, 3, this.angle, this.radius, options)

    }

    resetSeperation() {

        const angleRadius = Math.asin((- 0.02 / 2) / this.heightOfRightHand);

        this.rightHandGroup.rotateY(-angleRadius);
        this.leftHandGroup.rotateY(angleRadius);
        this.rightHandGroup.updateMatrix();
        this.leftHandGroup.updateMatrix();

        this.parentMesh.position.z = this.heightOfRightHand;
        this.parentMesh.updateMatrix();

    }

    changeMaterials() {

        this.parentMesh.traverse(child => {

            if (child.isMesh) {

                child.material = new MeshStandardMaterial({
                    color: child.material.color,
                });
                // this.materialList.push(child.material);
            }
        });
    }

    makeCompassMetallic() {

        let textureLoader = new TextureLoader();
        textureLoader.load("v2GeoConst3D/textures/Spark212_1.jpg", (texture) => {

            // texture.rotation = Math.PI;

            texture.mapping = EquirectangularReflectionMapping;

            this.parentMesh.traverse(child => {

                if (child.isMesh) {

                    child.material.envMap = texture;

                    if (child.name === "left_hand" || child.name === "right_hand" || child.name === "right_ring" || child.name === "right_tip" || child.name.substring(0, 4) === "head") {

                        child.material.color.set(0xffffff);
                        child.material.needsUpdate = true;
                        child.material.roughness = .02;
                        child.material.metalness = .8;
                        child.material.envMapIntensity = .9;

                    }
                    else if (child.name === 'polySurface6') {
                        child.material.color.set(0x006caf);
                        child.material.roughness = .2;
                        child.material.needsUpdate = true;
                        child.material.envMapIntensity = .2;

                    }
                    else {
                        child.material.envMapIntensity = .3;

                        child.material.roughness = 1;
                        child.material.needsUpdate = true;

                    }

                }
            });
        });
    }

}