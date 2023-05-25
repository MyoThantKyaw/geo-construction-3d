import Instrument from "./abstract/Instrument";

import { MeshLambertMaterial, Object3D, Vector2, LineSegments, BufferGeometry, EdgesGeometry, LineBasicMaterial, ShapeGeometry, InstancedMesh, PlaneGeometry, Mesh, BoxGeometry, SphereGeometry, MeshPhysicalMaterial, TextureLoader, EquirectangularReflectionMapping, MeshStandardMaterial, LinearToneMapping, CineonToneMapping, ReinhardToneMapping, ACESFilmicToneMapping, EquirectangularRefractionMapping, DoubleSide, FrontSide, BackSide, MeshBasicMaterial } from "three"
import * as util from '../helper/util';
import Scene from "../Scene"
import TWEEN from '@tweenjs/tween.js';

export default class Ruler extends Instrument {

    constructor(options = {}) {

        super();

        Object.assign(this, options);

        this.rulerLength = 20; // 20 cm
        this.rulerWidth = 2.3;
        this.rulerTickness = .07;
        this.rulerZOffset = 0.005;
        this.name = "ruler";

        this.offsetForLine = this.lineWidth / 2;
        this.restingPosition = new Vector2(24, 10);

        this.mode = Ruler.MODE_CENTI;

        this.side = -1;

        this.isRuler = true;

        this.offsetTip = .35;
        this.rulerPhysicalLength = this.rulerLength + (this.offsetTip * 2);

        this.rulerMaterial = new MeshPhysicalMaterial({
            // color: 0xc6c6c6,
            transparent: true,
            color: 0x66a810,
            opacity: .64,
            metalness: .23,
            roughness: .0,
            envMapIntensity: .8,

        });
        this.rulerMaterial.defaultOpacity = this.rulerMaterial.opacity;

        this.parentMesh = new Mesh(new BufferGeometry(), this.rulerMaterial);
        // this.parentMesh.matrixAutoUpdate = false;
        this.parentMesh.castShadow = true;
        this.parentMesh.receiveShadow = true;
        this.parentMesh.visible = false;

        this.selectableMeshes.push(this.parentMesh);

        this.rulerMaterialInner = this.rulerMaterial.clone();
        this.rulerMaterialInner.side = BackSide;
        this.rulerMaterialInner.color.set(0xff0000)
        this.rulerMaterialInner.opacity = .2;
        this.parentMeshInner = new Mesh(new BoxGeometry(10, 10, 10), new MeshPhysicalMaterial({
            transparent: true,
            side: BackSide,

            color: 0x008cff,
            opacity: .3,
            metalness: 1,
            roughness: .1,
            envMapIntensity: 1,
        }));


        this.type = 1; // ruler //

        this.createRulerMesh();


        this.origin = new Vector2(0, 0);
        this.angle = 0;
        this.vectorNorm = new Vector2(1, 0);

    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene);
        this.rulerMaterial.envMap = Scene.resources.envMap;
        this.parentMeshInner.material.envMap = Scene.resources.envMap;
        this.allPoints = scene.points;

        const boundaryPoints = [];

        boundaryPoints.push([this.origin.x - this.offsetTip, this.origin.y - (this.offsetForLine) * this.side]);
        boundaryPoints.push([this.origin.x + this.rulerLength + this.offsetTip, this.origin.y - (this.offsetForLine) * this.side]);

        boundaryPoints.push([this.origin.x + this.rulerLength + this.offsetTip, this.origin.y - (this.rulerWidth + this.offsetForLine) * this.side]);
        boundaryPoints.push([this.origin.x - this.offsetTip, this.origin.y - (this.rulerWidth + this.offsetForLine) * this.side]);

        this.boundaryPointsPx = [];

        boundaryPoints.forEach(pt => {

            this.boundaryPointsPx.push({ x: pt[0], y: pt[1] })

        });

        this.collisionPolygon = scene.collisionSystem.createPolygon(0, 0, boundaryPoints, 0);
        this.collisionPolygon.item = this;
   

        this.onReady();
    }

    setSide(side) {

        if (side === this.side) return;

        this.side = side;
        this.createRulerMesh();

    }

    onDragStart(e) {

        if (this.isDrawingGeoWithInstrument) return;

        if (((this.vectorNorm.x * (e.x - this.origin.x)) + (this.vectorNorm.y * (e.y - this.origin.y))) <= 5) {
            this.panOffsetFromOriginX = e.x - this.origin.x;
            this.panOffsetFromOriginY = e.y - this.origin.y;
            this.dragMode = 'm';
        }
        else {

            if (this.pointSnappedForPt1) {

                this.panOffsetAngle = util.getAngleDifference(this.angle, util.getAngle2Pts(this.pointSnappedForPt1.position, e));

            }
            else {
                this.panOffsetAngle = util.getAngleDifference(this.angle, util.getAngle2Pts(this.origin, e));
            }

            this.dragMode = 'r';
        }
    }

    onDrag(e) {

        if (this.isDrawingGeoWithInstrument) return;

        let newOrigin, newAngle;

        if (this.dragMode === 'm') {

            e.x -= this.panOffsetFromOriginX;
            e.y -= this.panOffsetFromOriginY;

            this.moveAndSnapOrigin(e);

            newOrigin = e;
            newAngle = this.angle;

        }
        else {

            if (this.pointSnappedForPt1) {

                let angle = util.getAngle2Pts(this.pointSnappedForPt1.position, e) - this.panOffsetAngle

                const distOriginToPivot = util.getDistance(this.pointSnappedForPt1.position, this.origin);

                const vectX = this.pointSnappedForPt1.position.x - Math.cos(angle) * distOriginToPivot;
                const vectY = this.pointSnappedForPt1.position.y - Math.sin(angle) * distOriginToPivot;

                this.pointSnappedForPt2 = this.findPointToSnapPt2({ x: vectX, y: vectY }, angle);

                if (this.pointSnappedForPt2) {

                    const direction = (this.vectorNorm.x * (this.pointSnappedForPt2.position.x - this.pointSnappedForPt1.position.x)) +
                        (this.vectorNorm.y * (this.pointSnappedForPt2.position.y - this.pointSnappedForPt1.position.y));

                    angle = util.getAngle2Pts(this.pointSnappedForPt1.position, this.pointSnappedForPt2.position)

                    if (direction < 0) {
                        angle += Math.PI;
                    }

                    newOrigin = { x: this.pointSnappedForPt1.position.x - Math.cos(angle) * distOriginToPivot, y: this.pointSnappedForPt1.position.y - Math.sin(angle) * distOriginToPivot };

                }
                else {
                    newOrigin = { x: vectX, y: vectY };
                }

                newAngle = angle;

            }
            else {

                newAngle = util.getAngle2Pts(this.origin, e) - this.panOffsetAngle
                // this.pointSnappedForPt1 = this.getPointToSnapPt1(this.origin, newAngle);
                this.pointSnappedForPt2 = this.findPointToSnapPt2(this.origin, newAngle);

                
                newOrigin = this.origin;

            }
        }

        this.collisionPolygon.x = newOrigin.x;
        this.collisionPolygon.y = newOrigin.y;
        this.collisionPolygon.angle = newAngle;

        this.scene.collisionSystem.update();
        const result = this.scene.collisionResult;

        let collided = false;

        for (const otherObject of this.collisionPotentials) {

            // if(!otherObject.item.visible) continue;

            if (this.collisionPolygon.collides(otherObject, this.scene.collisionResult)) {

                if (result.b.item.movementLocked) {

                    if (this.dragMode === "m") {
                        newOrigin.x -= result.overlap * result.overlap_x;
                        newOrigin.y -= result.overlap * result.overlap_y;
                    }
                    else {
                        newOrigin.x = this.origin.x;
                        newOrigin.y = this.origin.y;
                        newAngle = this.angle;
                    }

                    collided = true;

                }
                else {

                    result.b.item.moveBy(
                        result.overlap * result.overlap_x,
                        result.overlap * result.overlap_y
                    )
                }
            }
        }

        // todo : check distance between ruler and setsquare-45
        if (this.scene.setSquare45.visible) {

            const setSquareOrigin = this.scene.setSquare45.origin;

            const distRulerAndSetSq45 = util.getDistFromPtToLine(this.origin, setSquareOrigin, {
                x : setSquareOrigin.x + this.scene.setSquare45.vectorNorm.x, y : setSquareOrigin.y + this.scene.setSquare45.vectorNorm.y
            })

            if (distRulerAndSetSq45 <= 10 && !collided && !this.pointSnappedForPt1 && !this.pointSnappedForPt2) {

                const snapToAngles = (angle, anglesToSnap) => {

                    for (let angleToSnap of anglesToSnap) {

                        const tolerance = 0.05;

                        if (util.getAngleDifference(angle, angleToSnap) < tolerance || util.getAngleDifference(angle, angleToSnap, false) < tolerance) {
                            return angleToSnap;
                        }
                        else if (util.getAngleDifference(angle, angleToSnap + Math.PI) < tolerance || util.getAngleDifference(angle, angleToSnap + Math.PI, false) < tolerance) {
                            return (angleToSnap + Math.PI) % util.TWO_PI;
                        }

                    }

                    return angle;

                }

                newAngle = snapToAngles(newAngle, [
                    this.scene.setSquare45.angle, this.scene.setSquare45.angle + util.PI_BY_4, this.scene.setSquare45.angle - util.PI_BY_4
                ])
            }
        }

        this.setOriginAndAngle(newOrigin, newAngle);
    }

    updateCursor(e) {
        this.scene.setCursor(((this.vectorNorm.x * (e.x - this.origin.x)) + (this.vectorNorm.y * (e.y - this.origin.y))) <= 5 ? "move" : "rotate");
    }

    show(options = {}) {

        if (this.visible) return;

        super.show(options);

        this.stopMoveTween();
        this.stopOpacityTween();

        if (options.animate) {
            this.parentMesh.visible = true;
        }
        else {

            this.parentMesh.visible = true;
        }

        this.scene.states.rulerVisible = true;

    }

    hide(options = {}) {

        if (!this.visible) return;

        super.hide(options);

        if (options.toGoToRestingPosition) {

            this.measureAnimate({ x: 24, y: 10 }, { x: 24, y: 9 }, {
                duration: options.duration || 1500,
                onFinish: () => {

                    if (!this.visible) {

                        this.parentMesh.visible = this.helperMesh.visible = false;
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

            this.parentMesh.visible = this.helperMesh.visible = false;

        }
        else {
            this.parentMesh.visible = this.helperMesh.visible = false;
        }

        this.scene.states.rulerVisible = false;
        this.pointSnappedForPt1 = this.pointSnappedForPt2 = undefined;

    }

    moveBy(dx, dy) {
        this.setOriginAndAngle({
            x: this.origin.x + dx,
            y: this.origin.y + dy,
        }, this.angle);
    }

    /**
     * 
     * @param {Vector2} origin 
     * @param {Number} angle 
     */
    setOriginAndAngle(origin, angle, options = {}) {

        if (options.animate) {

        }
        else {

            this.parentMesh.position.set(origin.x, origin.y, .005)
            this.parentMesh.rotation.z = angle;

            this.origin.copy(origin);
            this.angle = angle;
            this.vectorNorm.set(Math.cos(angle), Math.sin(angle));

            this.collisionPolygon.x = origin.x;
            this.collisionPolygon.y = origin.y;
            this.collisionPolygon.angle = angle;

        }
    }

    createRulerMesh() {

        this.parentMesh.children = [];

        this.rulerGeometry = new BoxGeometry(this.rulerPhysicalLength, this.rulerWidth, this.rulerTickness).translate(this.rulerLength / 2, this.side * ((this.mode * this.rulerWidth / 2)), this.rulerZOffset + (this.rulerTickness / 2));
        this.rulerGeometry.translate(0, this.side * (-this.offsetForLine), 0)
        this.parentMesh.geometry = this.rulerGeometry;

        this.rulerGeometryInner = this.rulerGeometry.clone();
        this.parentMeshInner.geometry = this.rulerGeometryInner;

        this.parentMesh.add(new LineSegments(new EdgesGeometry(this.rulerGeometry), new LineBasicMaterial({ color: 0x559102, transparent: true, opacity: .6 })));

        this.drawTickAndLabels();
        this.createHelper();

        this.parentMesh.traverse(child => {
            if (child.isObject3D) {
                if (!child.isSelectable) {
                    child.userData.notMovable = true;
                }
            }
        })
    }

    createHelper() {

        this.helperMesh = new Mesh(new PlaneGeometry(.04, .85).translate(0, -0.425 + (.85 / 2) + (-this.side * (this.offsetForLine + (.85 / 2))), this.rulerTickness + 0.008), new MeshLambertMaterial({
            color: 0xf21212,
        }));
        this.helperMesh.visible = false;
        this.parentMesh.add(this.helperMesh);

    }

    drawTickAndLabels() {

        this.labelMaterail = new MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
        });

        const cmTickLength = .8;
        const halfCmTickLength = .6;
        this.miliTickLength = .4;

        const tickWidth = .023;

        const dummy = new Object3D();

        let tickCMGeo = new PlaneGeometry(tickWidth, cmTickLength).translate(0, this.side * ((-cmTickLength / 2) - this.offsetForLine), this.rulerZOffset + 0.001 + this.rulerTickness)
        this.tickMaterial = new MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
        });

        this.tickCMInstancedMesh = new InstancedMesh(tickCMGeo, this.tickMaterial, this.rulerLength + 1);
        this.tickCMInstancedMesh.matrixAutoUpdate = false;
        this.parentMesh.add(this.tickCMInstancedMesh);

        for (let i = 0; i < this.tickCMInstancedMesh.count; i++) {

            dummy.position.set(i, 0, 0);
            dummy.updateMatrix();
            this.tickCMInstancedMesh.setMatrixAt(i, dummy.matrix);

            // draw centi ticks
            let geoTickLabel = new ShapeGeometry(Scene.resources.font.generateShapes(i + "", .25), 1.1);
            geoTickLabel.computeBoundingBox();

            const labelHalfHeight = (geoTickLabel.boundingBox.max.y - geoTickLabel.boundingBox.min.y) / 2;

            let tickLabel = new Mesh(geoTickLabel, this.labelMaterail);
            tickLabel.matrixAutoUpdate = false;

            geoTickLabel.translate(-0.005 + -(tickWidth / 2) + i - ((geoTickLabel.boundingBox.max.x - geoTickLabel.boundingBox.min.x) / 2),
                this.side * (- cmTickLength - 0.2 - labelHalfHeight - this.offsetForLine) - labelHalfHeight,
                this.rulerZOffset + 0.001 + this.rulerTickness);
            this.parentMesh.add(tickLabel);
        }

        // half CM ticks
        let tickHalfCMGeo = new PlaneGeometry(tickWidth, halfCmTickLength).translate(0,
            this.side * ((-halfCmTickLength / 2) - this.offsetForLine),
            this.rulerZOffset + 0.001 + this.rulerTickness);

        let tickHalfCMInstancedMesh = new InstancedMesh(tickHalfCMGeo, this.tickMaterial, this.rulerLength);
        tickHalfCMInstancedMesh.matrixAutoUpdate = false;
        this.parentMesh.add(tickHalfCMInstancedMesh);

        for (let i = 1; i <= tickHalfCMInstancedMesh.count; i++) {
            dummy.position.set(i - 0.5, 0, 0)
            dummy.updateMatrix();
            tickHalfCMInstancedMesh.setMatrixAt(i - 1, dummy.matrix);
        }

        // mm ticks

        let tickMilliInstancedMesh = new InstancedMesh(new PlaneGeometry(tickWidth, this.miliTickLength).translate(0, this.side * ((-this.miliTickLength / 2) - this.offsetForLine), this.rulerZOffset + 0.001 + this.rulerTickness), this.tickMaterial, 8 * 20);
        tickMilliInstancedMesh.matrixAutoUpdate = false;
        this.parentMesh.add(tickMilliInstancedMesh);

        let index = 0;
        for (let i = 1; i < 200; i++) {

            if (i % 10 === 0 || i % 5 === 0) continue;

            dummy.position.set(i / 10, 0, 0);
            dummy.updateMatrix();
            tickMilliInstancedMesh.setMatrixAt((index++), dummy.matrix);

        }
    }

    moveAndSnapOrigin(tmpOrigin, indicate) {

        this.pointSnappedForPt1 = this.getPointToSnapPt1(tmpOrigin, indicate);

        if (this.pointSnappedForPt1) {

            if (util.getDistance(this.pointSnappedForPt1.position, tmpOrigin) < 0.3) {
                tmpOrigin.x = this.pointSnappedForPt1.position.x;
                tmpOrigin.y = this.pointSnappedForPt1.position.y;
            }
            else {
                tmpOrigin.x += -this.vectorNorm.y * this.pointSnappedForPt1.distToRuler;
                tmpOrigin.y += this.vectorNorm.x * this.pointSnappedForPt1.distToRuler;
            }
        }
    }

    getPointToSnapPt1(origin, indicate = true) {

        let minDist = .18;
        let snappedPoint = undefined;

        const checkPoint = (point) => {

            const isInRulerLen = this.isPtInRulerLength(point.position, origin, this.angle);
            const distToRuler = (this.tempVect2_2.x * -this.vectorNorm.y) + (this.tempVect2_2.y * this.vectorNorm.x);
            const distFromOrigin = util.getDistance(origin, point.position);

            if (isInRulerLen && Math.abs(distToRuler) <= 0.18) {

                if (snappedPoint) {
                    if (snappedPoint.distFromOrigin < distFromOrigin) return;
                }
                else if (Math.abs(distToRuler) > minDist) {
                    return;
                }

                minDist = Math.abs(distToRuler);
                snappedPoint = point;
                snappedPoint.distToRuler = distToRuler;
                snappedPoint.distFromOrigin = distFromOrigin
            }
        }

        for (let i = 0; i < this.allPoints.length; i++) {
            checkPoint(this.allPoints[i])
        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {
            checkPoint(this.scene.intersectionPts[i]);
        }

        return snappedPoint;
    }

    findPointToSnapPt2(origin, angle, indicate = true) {

        let minDist = .03;
        let snappedPoint = undefined;

        const checkPoint = (point) => {

            if (!point.visible || !point.isValid || point === this.pointSnappedForPt1 || util.getDistance(origin, point.position) <= 0.1 || ( this.pointSnappedForPt1 && util.getDistance(this.pointSnappedForPt1.position, point.position) <= 0.1)) {

                return;
            }

            const vectOriginToPoint = {
                x: point.position.x - origin.x,
                y: point.position.y - origin.y
            }

            
            const dist = Math.sqrt((vectOriginToPoint.x ** 2) + (vectOriginToPoint.y ** 2));
    
            // if (len / (Math.sqrt(dist) * 1.4) < 0.013 || dist < 0.1) {
            if (dist < 0.05) {
                return;
            }

            // ruler vector
            this.tmpPt.x = Math.cos(angle) * this.rulerLength;
            this.tmpPt.y = Math.sin(angle) * this.rulerLength;

            const distOnLine = ((vectOriginToPoint.x * this.tmpPt.x) + (vectOriginToPoint.y * this.tmpPt.y)) /
                this.rulerLength;


            if (distOnLine >= 0 && distOnLine <= this.rulerLength) {
  
                this.tmpPt.add(origin);

                const minAngle = util.getMinimumAngleDiff(
                    angle, util.getAngle(vectOriginToPoint.x, vectOriginToPoint.y)
                )
    
                if (minAngle < minDist) {

                    minDist = minAngle;
                    snappedPoint = point;

                }
            }
        }

        for (let i = 0; i < this.allPoints.length; i++) {

            checkPoint(this.allPoints[i]);

        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {

            checkPoint(this.scene.intersectionPts[i]);

        }


        // console.error(this.pointSnappedForPt1);
        // console.warn(snappedPoint);

        return snappedPoint;
    }



    /**
     * 
     * @param {Vector2} startPoint 
     * @param {Vector2} endPoint 
     * @param {*} options 
     */
    measureAnimate(startPoint, endPoint, options = {}) {

        let lineAngle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

        if (lineAngle > 0) {

            // startPoint = endPoint;
            // lineAngle += Math.PI;
        }

        const rotationAngleInfo = util.getShortestRotationDirection(this.angle, lineAngle);

        this.stopMoveTween();

        const duration = options.duration ||
            (Math.max(
                Math.min(Math.max(Math.sqrt(util.getDistance(this.origin, startPoint)) * 340, 1200), 2300),
                Math.sqrt(Math.abs(rotationAngleInfo.toAngle - rotationAngleInfo.fromAngle)) * 1000,
            ));

        this.moveTween = new TWEEN.Tween({ angle: rotationAngleInfo.fromAngle, x: this.origin.x, y: this.origin.y })
            .to({ angle: rotationAngleInfo.toAngle, x: startPoint.x, y: startPoint.y }, Math.min(duration, 2000))
            .easing(util.easingSmooth)
            .onUpdate(value => {
                this.setOriginAndAngle({ x: value.x, y: value.y }, value.angle);
            }).onComplete(() => {

                this.aniCtrl.removeAnimation(this.moveTween.getId());

                if (options.onFinish) options.onFinish();

            }).onStop(() => {
                this.aniCtrl.removeAnimation(this.moveTween.getId());
                if (options.onStop) options.onStop();
            });

        this.aniCtrl.addAnimation(this.moveTween.getId());
        this.moveTween.start();

    }

    pushAside(options = {}) {

        let startPt, endPt;
        const gap = 1;

        if (this.side === -1) {
            startPt = new Vector2(this.origin.x - this.vectorNorm.y * gap, this.origin.y + this.vectorNorm.x * gap);
        }
        else {
            startPt = new Vector2(this.origin.x + this.vectorNorm.y * gap, this.origin.y - this.vectorNorm.x * gap);
        }

        endPt = new Vector2(startPt.x + this.vectorNorm.x, startPt.y + this.vectorNorm.y);

        options.duration = 900;

        this.measureAnimate(
            startPt,
            endPt,
            options,
        );

    }

    updateHelper(pt, options = {}) {

        const toRound = options.toRound || true;

        if (pt.hoveredItem && !this.isDrawingGeoWithInstrument) {
            return false;
        }
        else {

            this.tempVect2_2.x = pt.x - this.origin.x;
            this.tempVect2_2.y = pt.y - this.origin.y;

            const dotToNormal = (this.tempVect2_2.x * -this.vectorNorm.y) + (this.tempVect2_2.y * this.vectorNorm.x) + (this.offsetForLine * 1.5 * this.side);

            this.dotToRulerVect = (this.tempVect2_2.x * this.vectorNorm.x) + (this.tempVect2_2.y * this.vectorNorm.y);

            if ((this.dotToRulerVect < -this.offsetTip || this.dotToRulerVect > this.rulerLength) && (!this.isDrawingGeoWithInstrument)) {

                return undefined;
            }


            if (this.isDrawingGeoWithInstrument || (Math.sign(dotToNormal) === this.side && Math.abs(dotToNormal) <= 1)) {

                if (this.dotToRulerVect < 0) this.dotToRulerVect = 0;
                if (this.dotToRulerVect > this.rulerLength) this.dotToRulerVect = this.rulerLength;

                if (toRound)
                    this.dotToRulerVect = util.round(this.dotToRulerVect, 0.05);

                this.helperPt.x = (this.origin.x + (-this.vectorNorm.y) * this.side * 0) + this.vectorNorm.x * this.dotToRulerVect;
                this.helperPt.y = (this.origin.y + (this.vectorNorm.x) * this.side * 0) + this.vectorNorm.y * this.dotToRulerVect;

                this.snapPointOnRuler(this.dotToRulerVect);

                return this.helperPt;

            }
            else {
                return undefined;
            }

        }
    }

    getPtToSnapOrigin(pt) {

        this.tempVect2_2.x = pt.x - this.origin.x;
        this.tempVect2_2.y = pt.y - this.origin.y;

        const dotToNormal = (this.tempVect2_2.x * -this.vectorNorm.y) + (this.tempVect2_2.y * this.vectorNorm.x);

        this.dotToRulerVect = (this.tempVect2_2.x * this.vectorNorm.x) + (this.tempVect2_2.y * this.vectorNorm.y);

        if (this.dotToRulerVect < -this.offsetTip || this.dotToRulerVect > this.rulerLength) {
            return undefined;
        }

        const distFromPtToEdge = Math.abs(dotToNormal);

        if (Math.sign(dotToNormal) !== this.side && distFromPtToEdge <= this.miliTickLength) {

            if (this.dotToRulerVect < 0) this.dotToRulerVect = 0;
            if (this.dotToRulerVect > this.rulerLength) this.dotToRulerVect = this.rulerLength;

            this.dotToRulerVect = util.round(this.dotToRulerVect, 0.1);

            this.helperMesh.position.x = this.dotToRulerVect;

            this.tmpPt.x = (this.origin.x + (this.vectorNorm.y) * this.side * distFromPtToEdge) + this.vectorNorm.x * this.dotToRulerVect;
            this.tmpPt.y = (this.origin.y + (-this.vectorNorm.x) * this.side * distFromPtToEdge) + this.vectorNorm.y * this.dotToRulerVect;

            return this.tmpPt;

        }
        else {
            // this.testPoint.visible = false;
            return undefined;
        }


    }

    isPtOnInstrument(pt) {

        this.tempVect2_2.x = pt.x - this.origin.x;
        this.tempVect2_2.y = pt.y - this.origin.y;

        const dotToNormal = (this.tempVect2_2.x * -this.vectorNorm.y) + (this.tempVect2_2.y * this.vectorNorm.x);
        this.dotToRulerVect = (this.tempVect2_2.x * this.vectorNorm.x) + (this.tempVect2_2.y * this.vectorNorm.y);

        return this.dotToRulerVect > -this.offsetTip && this.dotToRulerVect < this.rulerLength && Math.sign(dotToNormal) !== this.side && Math.abs(dotToNormal) <= this.rulerWidth;

    }

    isPtInRulerLength(pt, origin, angle) {

        this.tempVect2_2.x = pt.x - origin.x;
        this.tempVect2_2.y = pt.y - origin.y;

        const vectX = Math.cos(angle);
        const vectY = Math.sin(angle);

        this.dotToRulerVect = (this.tempVect2_2.x * vectX) + (this.tempVect2_2.y * vectY);

        return this.dotToRulerVect >= -this.offsetTip && this.dotToRulerVect <= this.rulerLength;

    }

    makeHorizontal() {

        this.setOriginAndAngle(this.origin, 0);

        if (this.pointSnappedForPt1) {
            this.pointSnappedForPt2 = this.findPointToSnapPt2(this.origin, this.angle);
        }

        this.scene.requestRender();
    }

    snapPointOnRuler(pointerDistFromOrigin,) {

        let minDist = .3;
        let snappedPoint = undefined;

        const checkPoint = (point) => {

            const distFromRuler = Math.abs(
                ((point.position.x - this.origin.x) * (this.vectorNorm.y)) +
                ((point.position.y - this.origin.y) * (-this.vectorNorm.x))
            )

            if (distFromRuler < 0.005) {

                const distBetweenPointerAndPoint = Math.abs(util.getDistance(point.position, this.origin) - pointerDistFromOrigin)

                if (distBetweenPointerAndPoint < minDist) {
                    minDist = distBetweenPointerAndPoint;
                    snappedPoint = point;
                }

            }
        }

        for (let i = 0; i < this.allPoints.length; i++) {

            if(!this.allPoints[i].visible) continue;

            checkPoint(this.allPoints[i]);
        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {
            checkPoint(this.scene.intersectionPts[i]);
        }

        for(let seg of this.scene.segments){
            
            const intersectPt = util.intersectTwoSegments(
                this.origin, {
                    x:  this.origin.x + this.vectorNorm.x * this.rulerLength,
                    y:  this.origin.y + this.vectorNorm.y * this.rulerLength,
                },
                seg.pt1, seg.pt2
            )
            
            let existingPoint = this.scene.points.find(point => {

                return intersectPt && util.getDistance(point.position, intersectPt) < 0.02;
                
            })
        
            if(intersectPt && !existingPoint){
                checkPoint({
                    position : intersectPt,
                    name : 'ptOnSegment',
                    segmentName : seg.name,
                })
            }
        }

        if (snappedPoint) {

            this.helperPt.x = snappedPoint.position.x;
            this.helperPt.y = snappedPoint.position.y;
            this.helperPt.snappedPoint = snappedPoint;

            this.helperMesh.position.x = util.getDistance(this.helperPt, this.origin)
        }
        else {
            this.helperMesh.position.x = this.dotToRulerVect;
            this.helperPt.snappedPoint = undefined;

        }
    }
}

Ruler.MODE_CENTI = -1;
Ruler.MODE_INCH = 1;