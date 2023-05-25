import Instrument from "./abstract/Instrument";

import { MeshLambertMaterial, Object3D, Vector2, LineSegments, EdgesGeometry, LineBasicMaterial, ShapeGeometry, InstancedMesh, PlaneGeometry, Mesh, BoxGeometry, SphereGeometry, MeshPhysicalMaterial, TextureLoader, EquirectangularReflectionMapping, MeshStandardMaterial, LinearToneMapping, CineonToneMapping, ReinhardToneMapping, ACESFilmicToneMapping, EquirectangularRefractionMapping, DoubleSide, FrontSide, BackSide, MeshBasicMaterial, Group } from "three"
import * as util from '../helper/util';
import Scene from "../Scene"
import TWEEN from '@tweenjs/tween.js';
import Geometry from "../geometries/abstract/Geometry";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"
import Collisions, { Polygon } from "collisions";

export default class SetSquare45 extends Instrument {

    constructor(options = {}) {

        super();

        Object.assign(this, options);

        this.offsetForLine = this.lineWidth / 2;
        this.parentMesh = new Group();
        this.parentMesh.visible = false;
        this.name = "setSquare45";
        this.thickness = .092;
        this.zOffset = 0.014;
        this.offsetFromStart = .5;
        this.baseOffsetHeight = .6;

        this.isSetSquare45 = true;
        this.side = 1;

        this.origin = new Vector2(0, 0);
        this.angle = 0;
        this.tip2 = new Vector2();
        this.vectorNorm = new Vector2(1, 0);


        this.restingPosition = new Vector2(14, -20);


        this.material = new MeshPhysicalMaterial({
            transparent: true,
            color: 0xeeeeff,
            opacity: .5,
            metalness: .94,
            roughness: .01,
            envMapIntensity: 1,
        });

        this.drawTickAndLabels();

        const stlLoader = new STLLoader();
        stlLoader.load('v2GeoConst3D/models/set_square_45.STL', geometry => {

            geometry.rotateZ(45 * util.DEG_TO_RAD).translate(115 / 2, -57.5 - (this.offsetForLine * 10), 0);

            let setSquareMesh = new Mesh(geometry, this.material)
            setSquareMesh.castShadow = true;
            setSquareMesh.receiveShadow = true;
            setSquareMesh.scale.set(.1, .1, .1);

            this.parentMesh.add(setSquareMesh);
            // this.parentMesh.add(setSquareMeshBack);

            this.selectableMeshes.push(setSquareMesh);

            this.onReady();

        }, undefined, error => {
            console.error(error);
        });

    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene);

        this.material.envMap = Scene.resources.envMap;
        const boundaryPoints = [[0, -this.offsetForLine], [11.5, -this.offsetForLine], [11.5 / 2, -5.786]];

        this.boundaryPointsPx = [];

        boundaryPoints.forEach(pt => {

            // const point = new Mesh(new SphereGeometry(.02, 10, 10), new MeshBasicMaterial({ color: 0xff00ff }));
            // point.position.set( pt[0], pt[1], 0);
            // scene.add(point);

            this.boundaryPointsPx.push({ x: pt[0], y: pt[1] })

        });

        this.collisionPolygon = scene.collisionSystem.createPolygon(0, 0, boundaryPoints, 0);
        this.collisionPolygon.item = this;


        // this.show();


        this.customPivot = {}
    }

    onDragStart(e) {

        if (this.isDrawingGeoWithInstrument) return;

        if (util.getDistFromPtToLine(e, this.origin, { x: this.origin.x + this.vectorNorm.x, y: this.origin.y + this.vectorNorm.y }) < 1.4) {
            this.dragMode = 'm';
            this.panOffsetFromOriginX = e.x - this.origin.x;
            this.panOffsetFromOriginY = e.y - this.origin.y;
        }
        else {

            this.dragMode = 'r';

            this.pivot = this.origin.clone();

            this.panOffsetAngle = util.getAngleDifference(util.getAngle2Pts(this.pivot, e), this.angle);
            this.snapshot = this.getSnapshot();

        }
    }

    getSnapshot() {

        return {
            origin: this.origin.clone(),
            angle: this.angle,
        }

    }

    onDrag(e) {

        if (this.isDrawingGeoWithInstrument) return;

        // this.snappedLine = undefined;

        const rotateAtPivot = (pivot, snapshot, offsetAngle, pointerPos) => {

            // move pivot to origin

            const angToRotate = util.getAngle2Pts(pivot, pointerPos) - snapshot.angle + offsetAngle;

            const pts = [
                { x: snapshot.origin.x, y: snapshot.origin.y },
                { x: snapshot.origin.x + Math.cos(snapshot.angle), y: snapshot.origin.y + Math.sin(snapshot.angle) }
            ];

            for (let pt of pts) {

                pt.x -= pivot.x;
                pt.y -= pivot.y;

                util.rotateVector_(pt, angToRotate);

                pt.x += pivot.x;
                pt.y += pivot.y;

            }

            return {
                pts: pts,
                origin: pts[0],
                angle: util.getAngle2Pts(pts[0], pts[1]),
            }


        }

        let newOrigin, newAngle;

        if (this.dragMode === 'm') {

            e.x -= this.panOffsetFromOriginX;
            e.y -= this.panOffsetFromOriginY;


            newOrigin = e;
            newAngle = this.angle;

        }
        else {

            let res;

            res = rotateAtPivot(this.pivot, this.snapshot, this.panOffsetAngle, e);

            newAngle = res.angle;
            newOrigin = res.origin;


        }

        this.collisionPolygon.x = newOrigin.x;
        this.collisionPolygon.y = newOrigin.y;
        this.collisionPolygon.angle = newAngle;

        let collided = false;

        this.scene.collisionSystem.update();
        const result = this.scene.collisionResult;
        // const result = Polygon.createResult();

        for (const otherObject of this.collisionPotentials) {

            if (!otherObject.item.visible) continue;

            if (this.collisionPolygon.collides(otherObject, result)) {

                if (result.b.item.movementLocked || (result.b.item.isRuler && this.snappedLine !== undefined)) {

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


        if (collided) {

            // snap points

            const pt2 = {
                x: newOrigin.x + Math.cos(newAngle) * 11.5,
                y: newOrigin.y + Math.sin(newAngle) * 11.5,
            };

            for (let point of this.scene.points) {

                const distFromPtToSegment = util.getDistFromPtToSegment(point.position, newOrigin, pt2);

                if (distFromPtToSegment < 0.08) {

                    const pt = util.intersect2Lines4Pts(
                        this.origin,
                        {
                            x: this.origin.x + this.scene.ruler.vectorNorm.x,
                            y: this.origin.y + this.scene.ruler.vectorNorm.y
                        },
                        point.position,
                        {
                            x: point.position.x + Math.cos(newAngle),
                            y: point.position.y + Math.sin(newAngle),
                        }
                    );

                    newOrigin.x = pt.x;
                    newOrigin.y = pt.y;

                }
            }

        }
        else {

            // snap angle

            for (let segment of this.scene.segments) {

                const res = this.isSegmentOverAnother(
                    newOrigin, { x: newOrigin.x + Math.cos(newAngle) * 11.5, y: newOrigin.y + Math.sin(newAngle) * 11.5 },
                    segment.definition.point1.position, segment.definition.point2.position,
                )

                // console.log("res ", res);

                if (res !== undefined) {
                    newAngle = res;
                    this.snappedLine = segment;
                    this.snappedLine.angle = newAngle;
                    this.movementLocked = true;
                    break;
                }
                else if (this.snappedLine && this.snappedLine.angle !== newAngle) {
                    this.snappedLine = undefined;
                    this.movementLocked = false;
                }
                else{
                    this.movementLocked = false;
                }
            }

        }

        this.setOriginAndAngle(newOrigin, newAngle);

    }

    isSegmentOverAnother(pt1, pt2, pt3, pt4) {

        const angle1 = util.getAngle2Pts(pt1, pt2);
        const angle2 = util.getAngle2Pts(pt3, pt4);
        const minDiff1 = Math.min(util.getAngleDifference(angle1, angle2, true), util.getAngleDifference(angle1, angle2, false)) % util.TWO_PI;

        const angle3 = util.getAngle2Pts(pt4, pt3);
        const minDiff2 = Math.min(util.getAngleDifference(angle1, angle3, true), util.getAngleDifference(angle1, angle3, false)) % util.TWO_PI;

        let angleDiff, angeToSnap;

        if (minDiff1 < 0.07 || minDiff2 < 0.07) {

            if (minDiff1 < minDiff2) {
                angleDiff = minDiff1;
                angeToSnap = angle2;
            }
            else {
                angleDiff = minDiff2;
                angeToSnap = angle3;
            }
        }

        if ((
            util.getDistFromPtToSegment(pt1, pt3, pt4) < 0.4
            || util.getDistFromPtToSegment(pt2, pt3, pt4) < 0.4
            || util.getDistFromPtToSegment(pt3, pt1, pt2) < 0.4
            || util.getDistFromPtToSegment(pt4, pt1, pt2) < 0.4) &&
            (Math.abs(angleDiff) < 0.08 || Math.abs(Math.abs(angleDiff) - Math.PI) < 0.08)) {

            return angeToSnap;

        }
        else{

            return undefined;

        }

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

            this.stopMoveTween();

            const toAngle = angle;
            const rotationInfo = util.getShortestRotationDirection(this.angle, toAngle);

            const duration = options.duration || 
            (Math.max(
                Math.min(Math.max(Math.sqrt(util.getDistance(this.origin, origin)) * 340, 1200), 2300),
                Math.sqrt(Math.abs(rotationInfo.toAngle - rotationInfo.fromAngle)) * 1000,
            ));

            this.moveTween = new TWEEN.Tween({
                x: this.origin.x,
                y: this.origin.y,
                angle: rotationInfo.fromAngle,
            }).
                to({ x: origin.x, y: origin.y, angle: rotationInfo.toAngle }, options.duration || duration)
                .easing(options.easing || util.easingSmooth)
                .onUpdate(value => {

                    this.setOriginAndAngle(
                        { x: value.x, y: value.y },
                        value.angle
                    )
                })
                .onComplete(() => {

                    this.aniCtrl.removeAnimation(this.moveTween.getId());
                    // indicateAngle();
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

            this.parentMesh.position.set(origin.x, origin.y, .005)
            this.parentMesh.rotation.z = angle;

            this.origin.copy(origin);
            this.angle = angle;
            this.vectorNorm.set(Math.cos(angle), Math.sin(angle));
            this.tip2.set(
                this.origin.x + Math.cos(this.angle) * 11.5,
                this.origin.y + Math.sin(this.angle) * 11.5,
            )

            this.collisionPolygon.x = origin.x;
            this.collisionPolygon.y = origin.y;
            this.collisionPolygon.angle = angle;

        }

    }

    drawTickAndLabels() {

        this.labelMaterail = new MeshBasicMaterial({
            color: 0x222222,
            transparent: true,
        });

        this.tickMaterial = new MeshBasicMaterial({
            color: 0x121212,
            transparent: true,
        });

        this.cmTickLength = .45;
        this.halfCmTickLength = .38;
        this.miliTickLength = .25;
        this.tickWidth = .023;

        const dummy = new Object3D();

        let tickCMGeo = new PlaneGeometry(this.tickWidth, this.cmTickLength).translate(this.offsetFromStart, (this.cmTickLength / 2), this.thickness);


        let tickCMInstancedMesh = new InstancedMesh(tickCMGeo, this.tickMaterial, 7);
        tickCMInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickCMInstancedMesh.matrixAutoUpdate = false;
        tickCMInstancedMesh.updateMatrix();
        this.parentMesh.add(tickCMInstancedMesh);

        for (let i = 0; i < tickCMInstancedMesh.count; i++) {
            dummy.position.set(i, 0, 0);
            dummy.updateMatrix();
            tickCMInstancedMesh.setMatrixAt(i, dummy.matrix);

            if (i === 0) continue;
            // draw centi ticks
            let geoTickLabel = new ShapeGeometry(Scene.resources.font.generateShapes(i + "", .23), 1.1);
            geoTickLabel.computeBoundingBox();

            let tickLabel = new Mesh(geoTickLabel, this.labelMaterail);
            tickLabel.matrixAutoUpdate = false;
            tickLabel.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
            tickLabel.updateMatrix();

            geoTickLabel.translate(this.offsetFromStart - 0.005 + -(this.tickWidth / 2) + i - ((geoTickLabel.boundingBox.max.x - geoTickLabel.boundingBox.min.x) / 2),
                this.cmTickLength + 0.1,
                this.thickness);
            this.parentMesh.add(tickLabel);
        }

        // // // half CM ticks
        let tickHalfCMGeo = new PlaneGeometry(this.tickWidth, this.halfCmTickLength).translate(this.offsetFromStart, (this.halfCmTickLength / 2), this.thickness)

        let tickHalfCMInstancedMesh = new InstancedMesh(tickHalfCMGeo, this.tickMaterial, 7);
        tickHalfCMInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickHalfCMInstancedMesh.matrixAutoUpdate = false;
        tickHalfCMInstancedMesh.updateMatrix();
        this.parentMesh.add(tickHalfCMInstancedMesh);

        for (let i = 1; i <= tickHalfCMInstancedMesh.count; i++) {
            dummy.position.set(i - 0.5, 0, 0);
            dummy.updateMatrix();
            tickHalfCMInstancedMesh.setMatrixAt(i - 1, dummy.matrix);
        }

        // // mm ticks
        let tickMilliGeo = new PlaneGeometry(this.tickWidth, this.miliTickLength).translate(0, (this.miliTickLength / 2), this.thickness);

        let tickMilliInstancedMesh = new InstancedMesh(tickMilliGeo, this.tickMaterial, 56);
        tickMilliInstancedMesh.matrixAutoUpdate = false;
        tickMilliInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickMilliInstancedMesh.updateMatrix();
        this.parentMesh.add(tickMilliInstancedMesh);

        let index = 0;
        for (let i = 1; i < 70; i++) {
            if (i % 10 === 0 || i % 5 === 0) continue;

            dummy.position.set(this.offsetFromStart + i / 10, 0, 0);
            dummy.updateMatrix();
            tickMilliInstancedMesh.setMatrixAt((index++), dummy.matrix);
        }

        this.drawVerticalTicks();

        this.lineMaterial = new MeshBasicMaterial({
            color: 0x121212,
            transparent: true,
        });

    }

    drawVerticalTicks() {

        const dummy = new Object3D();

        let tickCMGeo = new PlaneGeometry(this.tickWidth, this.cmTickLength).rotateZ(Math.PI / 2).translate((this.cmTickLength / 2), this.offsetFromStart, this.thickness);

        let tickCMInstancedMesh = new InstancedMesh(tickCMGeo, this.tickMaterial, 7);
        tickCMInstancedMesh.matrixAutoUpdate = false;
        tickCMInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickCMInstancedMesh.updateMatrix();
        this.parentMesh.add(tickCMInstancedMesh);

        for (let i = 0; i < tickCMInstancedMesh.count; i++) {
            dummy.position.set(0, i, 0);
            dummy.updateMatrix();
            tickCMInstancedMesh.setMatrixAt(i, dummy.matrix);

            // draw centi ticks
            let geoTickLabel = new ShapeGeometry(Scene.resources.font.generateShapes(i + "", .23), 1.1);
            geoTickLabel.computeBoundingBox();

            let tickLabel = new Mesh(geoTickLabel, this.labelMaterail);
            tickLabel.matrixAutoUpdate = false;
            tickLabel.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
            tickLabel.updateMatrix();


            geoTickLabel.rotateZ(Math.PI / 2);

            let offsetForZero = i === 0 ? 0.1 : 0;

            geoTickLabel.translate(
                this.cmTickLength + 0.3,
                this.offsetFromStart + 0.013 + i - ((geoTickLabel.boundingBox.max.x - geoTickLabel.boundingBox.min.x) / 2) + offsetForZero,
                this.thickness);
            this.parentMesh.add(tickLabel);
        }

        // // half CM ticks
        let tickHalfCMGeo = new PlaneGeometry(this.tickWidth, this.halfCmTickLength).rotateZ(Math.PI / 2).translate((this.halfCmTickLength / 2), this.offsetFromStart, this.thickness);

        let tickHalfCMInstancedMesh = new InstancedMesh(tickHalfCMGeo, this.tickMaterial, 7);
        tickHalfCMInstancedMesh.matrixAutoUpdate = false;
        tickHalfCMInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickHalfCMInstancedMesh.updateMatrix();

        this.parentMesh.add(tickHalfCMInstancedMesh);

        for (let i = 1; i <= tickHalfCMInstancedMesh.count; i++) {
            dummy.position.set(0, i - 0.5, 0);
            dummy.updateMatrix();
            tickHalfCMInstancedMesh.setMatrixAt(i - 1, dummy.matrix);
        }

        // mm ticks
        let tickMilliGeo = new PlaneGeometry(this.tickWidth, this.miliTickLength).rotateZ(Math.PI / 2).translate((this.miliTickLength / 2), this.offsetFromStart, this.thickness);

        let tickMilliInstancedMesh = new InstancedMesh(tickMilliGeo, this.tickMaterial, 70);
        tickMilliInstancedMesh.matrixAutoUpdate = false;
        tickMilliInstancedMesh.translateX(11.5 / 2).translateY(-5.75 - this.offsetLineWidth).rotateZ(45 * util.DEG_TO_RAD);
        tickMilliInstancedMesh.updateMatrix();
        this.parentMesh.add(tickMilliInstancedMesh);

        let index = 0;
        for (let i = 1; i < 70; i++) {
            if (i % 10 === 0 || i % 5 === 0) continue;

            dummy.position.set(0, i / 10, 0);
            dummy.updateMatrix();
            tickMilliInstancedMesh.setMatrixAt((index++), dummy.matrix);
        }
    }

    show(options = {}) {

        if (this.visible) return;


        super.show();
        this.parentMesh.visible = this.scene.states.setSquare45Visible = true;

    }

    getNearestPointBetweenTwoInstruments(boundaryPts1, boundaryPts2) {

        let minDist = Infinity;
        let minDistPoint = undefined;

        const pts1Length = boundaryPts1.length / 2;
        const pts2Length = boundaryPts2.length / 2;

        for (let j = 0; j < boundaryPts1.length; j += 2) {

            let vertex = { x: boundaryPts1[j], y: boundaryPts1[j + 1] };

            for (let i = 0; i < pts2Length; i++) {

                let pt1 = boundaryPts2[(i * 2)];
                let pt2 = boundaryPts2[(((i + 1) % pts2Length) * 2)];

                pt1 = { x: boundaryPts2[(i * 2)], y: boundaryPts2[(i * 2) + 1] };
                pt2 = { x: boundaryPts2[(((i + 1) % pts2Length) * 2)], y: boundaryPts2[(((i + 1) % pts2Length) * 2) + 1] };

                const res = util.getDistFromPtToSegment(vertex, pt1, pt2);

                if (res < minDist) {

                    minDist = res;
                    minDistPoint = vertex;

                }
                else if (res === minDist && res <= 0.01) {
                    // return 'parallel';
                }

            }
        }

        for (let j = 0; j < boundaryPts2.length; j += 2) {

            let vertex = { x: boundaryPts2[j], y: boundaryPts2[j + 1] };

            for (let i = 0; i < pts2Length; i++) {

                let pt1 = boundaryPts1[(i * 2)];
                let pt2 = boundaryPts1[(((i + 1) % pts1Length) * 2)];

                pt1 = { x: boundaryPts1[(i * 2)], y: boundaryPts1[(i * 2) + 1] };
                pt2 = { x: boundaryPts1[(((i + 1) % pts1Length) * 2)], y: boundaryPts1[(((i + 1) % pts1Length) * 2) + 1] };

                const res = util.getDistFromPtToSegment(vertex, pt1, pt2);

                if (res < minDist) {

                    minDist = res;
                    minDistPoint = vertex;

                    minDistPoint.otherInstrumentVertex = { x: vertex.x, y: vertex.y }

                }
                else if (res === minDist && res <= 0.01) {
                    // return 'parallel';
                }

            }
        }

        return minDistPoint;

    }


    hide(options = {}) {

        if (!this.visible) return;

        super.hide(options);

        options.easing = util.easingSmooth;

        if (options.toGoToRestingPosition) {


            this.setOriginAndAngle(this.restingPosition, this.angle, {
                animate: true,
                easing: options.easing,
                duration: 1200,
                onFinish: () => {

                    if (!this.visible) {

                        this.parentMesh.visible = false;
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

            this.parentMesh.visible = false;

        }
        else {
            this.parentMesh.visible = false;
        }

        this.scene.states.setSquare45Visible = false;
        this.snappedLine = undefined;

    }

    pushAside() {

    }

    updateHelper(pt) {

        const dist = util.getDistFromPtToSegment(pt, this.origin, this.tip2);

        if (dist) {

            if (dist < 0.4 || this.isDrawingGeoWithInstrument) {

                const ptOnSegment = util.projectPointOnLine(pt, this.origin, this.tip2);

                this.helperPt.x = ptOnSegment.x;
                this.helperPt.y = ptOnSegment.y;

                // snap helper point..
                this.snapPoint(this.helperPt);

                return this.helperPt;
            }
        }
        else {
            return undefined;
        }
    }

    snapPoint(helperPt) {

        let minDist = .3;
        let snappedPoint = undefined;

        const checkPoint = (point) => {

            const distFromRuler = util.getDistFromPtToSegment(point.position, this.origin, this.tip2);

            if (distFromRuler < 0.005) {

                const distBetweenPointerToPoint = util.getDistance(helperPt, point.position);

                if (distBetweenPointerToPoint < minDist) {
                    minDist = distBetweenPointerToPoint;
                    snappedPoint = point;
                    this.helperPt.x = point.position.x;
                    this.helperPt.y = point.position.y;
                }
            }
        }

        for (let i = 0; i < this.scene.points.length; i++) {
            checkPoint(this.scene.points[i]);
        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {
            checkPoint(this.scene.intersectionPts[i]);
        }

        this.helperPt.snappedPoint = snappedPoint;

    }

    moveAndSnapOrigin() {

    }

}