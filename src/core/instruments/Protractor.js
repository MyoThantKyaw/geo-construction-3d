import Instrument from "./abstract/Instrument";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"

import { MeshLambertMaterial, Group, MathUtils, Mesh, InstancedMesh, PlaneGeometry, BoxGeometry, MeshBasicMaterial, Object3D, ShapeGeometry, TorusGeometry, MeshStandardMaterial, TextureLoader, EquirectangularReflectionMapping, MeshPhysicalMaterial, Blending, BackSide, DoubleSide, Vector2, EdgesGeometry, LineSegments, LineBasicMaterial, CircleGeometry, SphereGeometry } from "three";
import Scene from "../Scene";
import Label from "../graphics/Label";
import DefLabelStaticPt from "../definitions/labels/DefLabelStaticPt";
import Geometry from "../geometries/abstract/Geometry";
import TWEEN from '@tweenjs/tween.js';
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import DefPointOnIntersection from "../definitions/points/DefPointOnIntersection";

import * as util from "../helper/util";

export default class Protractor extends Instrument {

    constructor(options = {}) {

        super();

        Object.assign(this, options);

        this.protractorTickness = .06;
        this.tickZPos = this.protractorTickness + 0.002;
        this.radius = 5;

        this.labelRadius = this.radius + .3;
        this.name = "protractor";
        this.minorTickLen = .29;
        this.midTickLen = .44;
        this.majorTickLen = .58;
        this.isProtractor = true;
        this.zOffset = 0.003;

        this.origin = new Vector2();
        this.angle = 0;

        this.pointerPtForHelper = new Vector2();

        this.baseOffsetHeight = .6;
        this.parentMesh = new Group();
        this.parentMesh.visible = false;

        this.indicatorSideFlipped = false;
        this.roundingStep = .5;

        this.restingPosition = new Vector2(16, -3);
        this.pointerPt = new Vector2();

        this.type = 4;

        this.material = new MeshPhysicalMaterial({
            transparent: true,
            color: 0xeeeeff,
            opacity: .5,
            metalness: .94,
            roughness: .01,
            envMapIntensity: 1,

        });

        this.createIndicator();

        // this.material.defaultOpacity = this.material.opacity;

        const stlLoader = new STLLoader();
        stlLoader.load('v2GeoConst3D/models/protractorSTL.stl', geometry => {

            geometry.rotateZ(Math.PI / 2).scale(0.1, 0.1, 0.06);

            let protractorMesh = new Mesh(geometry, this.material)
            protractorMesh.castShadow = true;
            protractorMesh.receiveShadow = true;

            let mat = this.material.clone();
            mat.opacity = 1;
            mat.side = BackSide;

            let protractorMeshBack = new Mesh(geometry, mat)
            protractorMeshBack.castShadow = true;

            this.parentMesh.add(protractorMesh);
            // this.parentMesh.add(protractorMeshBack);

            this.selectableMeshes.push(protractorMesh);
            // this.parentMesh.renderOrder = 1;

            this.parentMesh.add(new LineSegments(new EdgesGeometry(geometry), new LineBasicMaterial({ color: 0x000000, transparent: true, opacity: .2 })));

            this.onReady();

        }, undefined, error => {
            console.error(error);
        });

        this.drawTickAndLabelsMesh();

        this.parentMesh.position.z = 0.005;

    }

    createIndicator() {

        this.indicatorArcOpacity = .2;
        this.indicatorArcMaterial = new MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0
        })

        this.helperMesh = new Mesh(new CircleGeometry(
            5, 10, 0, 4
        ), this.indicatorArcMaterial);
        this.helperMesh.visible = false;
        this.helperMesh.position.z = this.protractorTickness + 0.01;
        this.parentMesh.add(this.helperMesh);

        this.angleLabelMaterial = new MeshBasicMaterial({
            color: 0xff003f,
            transparent: true,
            opacity: 0,
        })

        this.helperVisible = false;

        // angle label

        this.labelDegIndicator = new Label(new DefLabelStaticPt(new Vector2(1, 2)), {
            depthTest: false,
            color: Geometry.HIGHLIGHT_COLOR,
            isInteractable: false,
        });

    }


    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene);

        this.allPoints = scene.points;
        this.allSegments = scene.segments;

        this.material.envMap = Scene.resources.envMap;
        // this.scene.add(this.labelDegIndicator);

        this.parentMesh.add(this.labelDegIndicator.parentMesh);
        this.labelDegIndicator.setContext(scene);

        const protractorBoundaryPoints = [];

        for (let i = -0.063; i <= (Math.PI) + 0.063; i += 0.02) {
            protractorBoundaryPoints.push([Math.cos(i) * this.radius, Math.sin(i) * this.radius]);

        }

        protractorBoundaryPoints.push([Math.cos(Math.PI + 0.063) * this.radius, Math.sin(Math.PI + 0.063) * this.radius]);

        this.collisionPolygon = scene.collisionSystem.createPolygon(0, 0, protractorBoundaryPoints, 0);
        this.collisionPolygon.item = this;

        this.scene.on('f:down', () => {

            console.log(this.otherPointToSnapAngle);

            if (!this.helperVisible || this.otherPointToSnapAngle === undefined) return;

            this.indicatorSideFlipped = !this.indicatorSideFlipped;

            if(this.indicatorSideFlipped){
                this.itemSnappedForAngleBackup = this.itemSnappedForAngle;
                this.itemSnappedForAngle = this.otherPointToSnapAngle;  
            }
            else{
                this.itemSnappedForAngle = this.itemSnappedForAngleBackup;
            }

            this.snappedSide = this.snappedSide === 'l' ? 'r' : 'l';
            
            this.updateHelper(this.pointerPtForHelper);
            this.scene.requestRender();

        })

    }

    onDragStart(pt) {

        if (util.getDistance(pt, this.origin) < this.midCircleRaidus) {

            this.panOffsetFromCenterX = pt.x - this.origin.x;
            this.panOffsetFromCenterY = pt.y - this.origin.y;

            this.dragMode = "m";

        }
        else {
            this.panOffsetAngle = util.getAngleDifference(this.angle, util.getAngle2Pts(this.origin, pt), true);
            this.dragMode = "r";
        }


        // this.isPanning = true;
    }

    onDrag(pt) {

        this.pointerPt.set(pt.x, pt.y);

        let newAngle = this.angle;

        let newOrigin = undefined;
        const result = this.scene.collisionResult;

        if (this.dragMode === "m") {

            newOrigin = {
                x: pt.x - this.panOffsetFromCenterX,
                y: pt.y - this.panOffsetFromCenterY
            };

            if (this.itemSnappedForOrigin = this.getPointToSnapOrigin(newOrigin)) {

                newOrigin.x = this.collisionPolygon.x = this.itemSnappedForOrigin.position.x;
                newOrigin.y = this.collisionPolygon.y = this.itemSnappedForOrigin.position.y;
                newAngle = this.snapAngle(this.angle);

                this.indicatorSideFlipped = false;

            }
            else {
                newAngle = this.angle;
            }

            // console.warn('newAngle ', newAngle);
        }
        else {

            newOrigin = this.origin;

            newAngle = util.getAngle2Pts(this.origin, pt) - this.panOffsetAngle;
            if (this.itemSnappedForOrigin) {
                
                newAngle = this.snapAngle(newAngle);
            }
        }

        this.collisionPolygon.x = newOrigin.x;
        this.collisionPolygon.y = newOrigin.y;
        this.collisionPolygon.angle = newAngle;

        this.scene.collisionSystem.update();

        for (const otherObject of this.collisionPotentials) {
            if (!otherObject.item.visible) continue;

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

                }
                else {

                    result.b.item.moveBy(
                        result.overlap * result.overlap_x,
                        result.overlap * result.overlap_y
                    )
                }
            }
        }
        
        this.setOriginAndAngle(newOrigin, newAngle);

    }

    onDragEnd() {

        this.dragMode = undefined;
    }

    updateHelper(pt, options = {}) {

        this.pointerPtForHelper.set(pt.x, pt.y);

        const distFromOrigin = util.getDistance(this.origin, pt);
        const pointerAngle = util.getAngle2Pts(this.origin, pt);

        if (distFromOrigin <= this.radius || distFromOrigin > this.radius + 2 || util.getAngleDifference(this.angle - .07, pointerAngle, true,) > (Math.PI + .14)) {

            if (this.labelDegIndicator.visible) this.labelDegIndicator.hide();
            return;
        }

        if (this.itemSnappedForAngle || options.ignoreSnap) {

            let pointerAngle = util.getAngle2Pts(this.origin, pt);

            this.helperAngle = this.snappedSide === 'l' ?
                util.getAngleDifference((this.angle + Math.PI) % util.TWO_PI, pointerAngle, false)
                : util.getAngleDifference(this.angle, pointerAngle, true)
            if (this.helperAngle > util.THREE_PI_BY_2) this.helperAngle = 0;
            else if (this.helperAngle > Math.PI) this.helperAngle = Math.PI;

            this.helperAngleDeg = util.round(this.helperAngle * util.RAD_TO_DEG, this.roundingStep);

            this.helperAngle = this.helperAngleDeg * util.DEG_TO_RAD;

            if (!this.labelDegIndicator.visible)
                this.labelDegIndicator.show();

            this.snapPointOnProtractor();

            pointerAngle = this.snappedSide === 'l' ? - Math.PI - this.helperAngle : this.helperAngle;

            this.updateIndicator();

            this.labelDegIndicator.setText(this.helperAngleDeg.toFixed(1) + "°");

            const labelAngle = pointerAngle - (util.PI_BY_2);

            this.labelDegIndicator.definition.update(
                Math.cos(pointerAngle) * this.labelRadius, Math.sin(pointerAngle) * this.labelRadius, labelAngle);

            const helperPtAngle = this.snappedSide === 'l' ? this.angle - Math.PI - this.helperAngle : this.helperAngle + this.angle;

            this.helperPt.x = this.origin.x + Math.cos(helperPtAngle) * (this.radius + .023);
            this.helperPt.y = this.origin.y + Math.sin(helperPtAngle) * (this.radius + .023);

            return this.helperPt;

        }
        else {
            if (this.labelDegIndicator.visible) this.labelDegIndicator.hide();
        }

    }

    getPointToSnapOrigin(pt) {

        let minDist = .2;
        let snappedPoint = undefined;

        for (let i = 0; i < this.allSegments.length; i++) {

            const seg = this.allSegments[i];

            if (!seg.visible || !seg.isValid) continue;

            const dist1 = seg.definition.point1.isInPath(pt).distance;
            const dist2 = seg.definition.point2.isInPath(pt).distance;

            if (dist1 < minDist) {
                minDist = dist1;
                snappedPoint = seg.definition.point1;
            }
            if (dist2 < minDist) {
                minDist = dist2;
                snappedPoint = seg.definition.point2;
            }

            for (let j = 0; j < seg.dependents.length; j++) {

                if (seg.dependents.isPoint) {

                    const dist = seg.dependents.isInPath(pt).distance;
                    if (dist < minDist) {
                        minDist = dist;
                        snappedPoint = seg.definition.point1;
                    }
                }
            }
        }

        for (let i = 0; i < this.allPoints.length; i++) {

            const point = this.allPoints[i];

            if (!point.visible || !point.isValid) continue;

            if (point.definition.constructor === DefPointOnSegment || point.definition.constructor === DefPointOnIntersection) {

                const dist = point.isInPath(pt).distance;

                if (dist < minDist) {
                    minDist = dist;
                    snappedPoint = point;
                }
            }

        }

        for (let i = 0; i < this.scene.intersectionPts.length; i++) {

            const intersectPt = this.scene.intersectionPts[i];

            let segment, arc;

            if (intersectPt.item1.isSegment) segment = intersectPt.item1;
            else if (intersectPt.item2.isSegment) segment = intersectPt.item2;

            if (intersectPt.item1.isArc) arc = intersectPt.item1;
            else if (intersectPt.item2.isArc) arc = intersectPt.item2;

            if (
                segment && arc && (segment.definition.point1Name === arc.definition.centerPointName || segment.definition.point2Name === arc.definition.centerPointName)
            ) {
                const dist = intersectPt.isInPath(pt).distance;

                if (dist < minDist) {
                    minDist = dist;
                    snappedPoint = intersectPt;
                }
            }
            else if (intersectPt.item1.isSegment && intersectPt.item2.isSegment) {
                const dist = intersectPt.isInPath(pt).distance;

                if (dist < minDist) {
                    minDist = dist;
                    snappedPoint = intersectPt;
                }
            }

        }

        if (!snappedPoint) {
            this.itemSnappedForAngle = undefined;
        }

        return snappedPoint;
    }

    updateIndicator() {

        this.helperMesh.geometry = new CircleGeometry(
            this.radius - 0.01, 30,
            this.snappedSide === 'l' ? Math.PI - this.helperAngle : 0,
            this.helperAngle);

    }

    snapAngle(angle) {

        let minAngDiff = 999;
        let angleInfoToSnap = undefined;
        let otherPointToSnapAngle = undefined;
        let pointToSnapAngle = undefined;
        let candidatePointToSnapAngle = undefined;

        if (this.itemSnappedForOrigin.isIntersectionPt) {

            const pointsToSnapForAngle = [];

            const item1 = this.itemSnappedForOrigin.item1;
            const item2 = this.itemSnappedForOrigin.item2;

            if (item1.isSegment) pointsToSnapForAngle.push(item1.definition.point1, item1.definition.point2)
            if (item2.isSegment) pointsToSnapForAngle.push(item2.definition.point1, item2.definition.point2)

            for (let point of pointsToSnapForAngle) {

                const angleInfo = this.getAngleToSnap(angle,
                    util.getAngle2Pts(this.itemSnappedForOrigin.position, point.position));

                if (angleInfo) {

                    minAngDiff = angleInfo.angleDiff;
                    angleInfoToSnap = angleInfo;

                    angleInfoToSnap.side = angleInfoToSnap.side === 'l' ? 'r' : 'l';
                    
                    if (pointToSnapAngle) {
                        if(!otherPointToSnapAngle)
                            otherPointToSnapAngle = point;
                    }
                    else {
                        pointToSnapAngle = point;
                    }
                }
            }

            if(angleInfoToSnap) {

                pointToSnapAngle.indicate();
                otherPointToSnapAngle.indicate();
                // console.log(angleInfoToSnap.side);
            }

        }
        else {

            const dependents = this.itemSnappedForOrigin.dependents;

            for (let i = 0; i < dependents.length; i++) {

                if (dependents[i].isSegment && dependents[i].isValid && dependents[i].visible) {

                    const point1 = dependents[i].definition.point1;
                    const point2 = dependents[i].definition.point2;

                    if (point1 === this.itemSnappedForOrigin || point2 === this.itemSnappedForOrigin) {

                        if (point1 === this.itemSnappedForOrigin)
                            candidatePointToSnapAngle = point2;
                        else
                            candidatePointToSnapAngle = point1;

                        const angleInfo = this.getAngleToSnap(angle,
                            util.getAngle2Pts(this.itemSnappedForOrigin.position, candidatePointToSnapAngle.position));

                        if (angleInfo && angleInfo.angleDiff < minAngDiff) {

                            minAngDiff = angleInfo.angleDiff;
                            angleInfoToSnap = angleInfo;
                            pointToSnapAngle = candidatePointToSnapAngle;

                        }
                    }
                }
            }

            const dependees = this.itemSnappedForOrigin.dependees;

            for (let i = 0; i < dependees.length; i++) {

                if (dependees[i].visible && dependees[i].isValid && dependees[i].isSegment) {

                    if (this.itemSnappedForOrigin === dependees[i].definition.point1) {
                        candidatePointToSnapAngle = dependees[i].definition.point2;
                        otherPointToSnapAngle = dependees[i].definition.point1;
                    }
                    else {
                        candidatePointToSnapAngle = dependees[i].definition.point1;
                        otherPointToSnapAngle = dependees[i].definition.point2;
                    }

                    const angleInfo = this.getAngleToSnap(angle,
                        util.getAngle2Pts(this.itemSnappedForOrigin.position, candidatePointToSnapAngle.position))

                    if (angleInfo && angleInfo.angleDiff < minAngDiff) {
                        minAngDiff = angleInfo.angleDiff;
                        angleInfoToSnap = angleInfo;
                        pointToSnapAngle = candidatePointToSnapAngle;

                    }
                }
            }
        }

        if (angleInfoToSnap) {

            this.itemSnappedForAngle = pointToSnapAngle;
            this.snappedSide = angleInfoToSnap.side;
            this.otherPointToSnapAngle = otherPointToSnapAngle;

            return angleInfoToSnap.angleToSnap;

        }
        else {
            this.itemSnappedForAngle = this.otherPointToSnapAngle = undefined;
            
            return angle;
        }

    }

    getAngleToSnap(protractorAngle, lineAngle) {

        protractorAngle = protractorAngle % util.TWO_PI;
        lineAngle = lineAngle % util.TWO_PI;

        if (protractorAngle < 0) protractorAngle += util.TWO_PI
        if (lineAngle < 0) lineAngle += util.TWO_PI

        const diff1 = Math.min(util.getAngleDifference(protractorAngle, lineAngle, false), util.getAngleDifference(protractorAngle, lineAngle, true)) % util.TWO_PI;
        const diff2 = Math.min(util.getAngleDifference(((protractorAngle + Math.PI) % util.TWO_PI), lineAngle, false), util.getAngleDifference(((protractorAngle + Math.PI) % util.TWO_PI), lineAngle, true)) % util.TWO_PI;

        if (diff1 < 0.075) {

            return {
                angleDiff: diff1,
                angleToSnap: lineAngle,
                side: 'r'
            }
        }
        else if (diff2 < 0.075) {

            return {
                angleDiff: diff2,
                angleToSnap: lineAngle - Math.PI,
                side: 'l'
            }
        }
        else {
            return undefined;
        }
    }

    snapPointOnProtractor() {

    }

    moveBy(dx, dy) {

        this.setOriginAndAngle({ x: this.origin.x + dx, y: this.origin.y + dy }, this.angle);

    }

    setOriginAndAngle(origin, angle, options = {}) {

        if (options.animate) {

            this.stopMoveTween();

            const toAngle = angle;
            const rotationInfo = util.getShortestRotationDirection(this.angle, toAngle);

            const duration = (Math.max(
                Math.max(2, Math.sqrt(util.getDistance(this.origin, origin,))) * .6,
                Math.sqrt(Math.abs(rotationInfo.toAngle - rotationInfo.fromAngle)) * 2.1,
            ) * 580);

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

            this.origin.copy(origin);

            this.angle = angle;

            this.parentMesh.position.set(origin.x, origin.y, this.parentMesh.position.z);
            this.parentMesh.rotation.z = this.angle;

            this.collisionPolygon.x = this.origin.x;
            this.collisionPolygon.y = this.origin.y;
            this.collisionPolygon.angle = this.angle;

        }

        // this.updateDegLabelPositions();

    }

    drawTickAndLabelsMesh() {

        let tickWidth = .023;

        this.tickMaterial = new MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
        });

        this.labelMaterail = new MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
        });

        let lineTickness = .01;

        let outerTickGeometry = new PlaneGeometry(
            this.majorTickLen,
            tickWidth,
        ).translate(-this.majorTickLen / 2, 0, this.tickZPos);

        let tickMajorMInstancedMesh = new InstancedMesh(outerTickGeometry, this.tickMaterial, 19);
        this.parentMesh.add(tickMajorMInstancedMesh);

        let dummy = new Object3D();

        for (let i = 0; i <= 18; i++) {

            dummy.rotation.z = MathUtils.degToRad(i * 10);
            dummy.position.x = Math.cos(MathUtils.degToRad(i * 10)) * (this.radius - 0.01);
            dummy.position.y = Math.sin(MathUtils.degToRad(i * 10)) * (this.radius - 0.01);
            dummy.updateMatrix();

            tickMajorMInstancedMesh.setMatrixAt(i, dummy.matrix);

            if (i === 9) continue;

            let outerDeg = 180 - (i * 10);

            let geoTickLabel = new ShapeGeometry(Scene.resources.font.generateShapes(outerDeg + "", .215), 1.1);
            geoTickLabel.computeBoundingBox();

            let tickLabel = new Mesh(geoTickLabel, this.labelMaterail);
            geoTickLabel.translate(-((geoTickLabel.boundingBox.max.x - geoTickLabel.boundingBox.min.x) / 2) - .02,
                this.radius - this.majorTickLen - 0.36,
                this.protractorTickness + this.zOffset).rotateZ(MathUtils.degToRad((i * 10) - 90));
            this.parentMesh.add(tickLabel);

            let geoTickLabelInner = new ShapeGeometry(Scene.resources.font.generateShapes((i * 10) + "", .205), 1);
            geoTickLabelInner.computeBoundingBox();

            geoTickLabelInner.translate(-((geoTickLabelInner.boundingBox.max.x - geoTickLabelInner.boundingBox.min.x) / 2) - .02,
                this.radius - this.majorTickLen - 0.32 - this.majorTickLen,
                this.protractorTickness + this.zOffset).rotateZ(MathUtils.degToRad((i * 10) - 90));

            let tickLabelInner = new Mesh(geoTickLabelInner, this.labelMaterail);
            this.parentMesh.add(tickLabelInner);
        }

        // 90 degree label
        let geoTick90Label = new ShapeGeometry(Scene.resources.font.generateShapes("90", .36), 1.2);
        geoTick90Label.computeBoundingBox();
        geoTick90Label.translate(-((geoTick90Label.boundingBox.max.x - geoTick90Label.boundingBox.min.x) / 2) - .02,
            this.radius - this.majorTickLen - this.majorTickLen - 0.1,
            this.protractorTickness + this.zOffset);

        let tick90Label = new Mesh(geoTick90Label, this.labelMaterail);
        this.parentMesh.add(tick90Label);

        // minor ticks
        let midTickGeometry = new PlaneGeometry(

            this.midTickLen,
            tickWidth,
        ).translate(-this.midTickLen / 2, 0, this.tickZPos);

        let tickMidInstancedMesh = new InstancedMesh(midTickGeometry, this.tickMaterial, 18);
        this.parentMesh.add(tickMidInstancedMesh);

        for (let i = 0; i < tickMidInstancedMesh.count; i++) {

            let ang = (i * 10) + 5;
            dummy.rotation.z = MathUtils.degToRad(ang);
            dummy.position.x = Math.cos(MathUtils.degToRad(ang)) * (this.radius - 0.01);
            dummy.position.y = Math.sin(MathUtils.degToRad(ang)) * (this.radius - 0.01);
            dummy.updateMatrix();

            tickMidInstancedMesh.setMatrixAt(i, dummy.matrix);
        }

        let minorTickGeometry = new PlaneGeometry(
            this.minorTickLen,
            tickWidth,
        ).translate(-this.minorTickLen / 2, 0, this.tickZPos);

        let tickMinorInstancedMesh = new InstancedMesh(minorTickGeometry, this.tickMaterial, 8 * 18);
        this.parentMesh.add(tickMinorInstancedMesh);

        let index = 0;
        for (let i = 1; i < 180; i++) {

            if (i % 10 === 0 || i % 5 === 0) continue;

            dummy.rotation.z = MathUtils.degToRad(i);
            dummy.position.x = Math.cos(MathUtils.degToRad(i)) * (this.radius - 0.01);
            dummy.position.y = Math.sin(MathUtils.degToRad(i)) * (this.radius - 0.01);
            dummy.updateMatrix();

            tickMinorInstancedMesh.setMatrixAt(index++, dummy.matrix);
        }

        // fins

        let outerRingRadius = 3.87;
        this.midCircleRaidus = 3.35;
        let innerCircleRaidus = .7;

        let finLength = this.midCircleRaidus - innerCircleRaidus;

        let finGeometry = new PlaneGeometry(
            finLength + 0.05,
            tickWidth,
        ).translate(((finLength + 0.05) / 2) + innerCircleRaidus, 0, this.tickZPos);

        let finInstancedMesh = new InstancedMesh(finGeometry, this.tickMaterial, 16);
        this.parentMesh.add(finInstancedMesh);

        index = 0;
        for (let i = 10; i <= 170; i += 10) {
            if (i === 90) continue;
            dummy.rotation.z = MathUtils.degToRad(i);
            dummy.position.set(0, 0, 0);
            dummy.updateMatrix();

            finInstancedMesh.setMatrixAt(index++, dummy.matrix);
        }

        // normal 90 degrees line

        this.lineMaterial = new MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
        });

        let normalLineGeometry = new BoxGeometry(
            tickWidth,
            (outerRingRadius) - 0.3,
            lineTickness * 1.5,
        ).translate(0, ((outerRingRadius) - 0.3) / 2, this.protractorTickness);

        this.parentMesh.add(new Mesh(
            normalLineGeometry,
            this.lineMaterial
        ));

        // base line

        let baseLineGeometry = new BoxGeometry(
            (this.midCircleRaidus * 2) + 0.1,
            tickWidth - 0.005,
            lineTickness * 1.5
        ).translate(0, 0, this.protractorTickness);

        this.parentMesh.add(new Mesh(
            baseLineGeometry,
            this.lineMaterial
        ));

        // add rings and lines
        // inner ring

        let innerRing = new Mesh(
            new TorusGeometry(
                innerCircleRaidus, lineTickness, 6, 20, Math.PI
            ).translate(0, 0, this.protractorTickness),
            this.lineMaterial
        );

        this.parentMesh.add(innerRing);

        // mid ring

        let midRing = new Mesh(
            new TorusGeometry(
                this.midCircleRaidus, lineTickness, 6, 37, Math.PI
            ).translate(0, 0, this.protractorTickness),
            this.lineMaterial
        );
        this.parentMesh.add(midRing);

        let outerRingRight = new Mesh(
            new TorusGeometry(
                outerRingRadius, lineTickness, 6, 18, (Math.PI / 2) - 0.1
            ).translate(0, 0, this.protractorTickness),
            this.lineMaterial
        );

        let outerRingLeft = new Mesh(
            new TorusGeometry(
                outerRingRadius, lineTickness, 6, 18, (Math.PI / 2) - 0.1
            ).rotateZ((Math.PI / 2) + 0.1).translate(0, 0, this.protractorTickness),
            this.lineMaterial
        );

        this.parentMesh.add(outerRingRight);
        this.parentMesh.add(outerRingLeft);

    }

    updateCursor(e) {

        this.dragMode = util.getDistance(e, this.origin) < this.midCircleRaidus ? "m" : "r";

        if (this.dragMode === 'm')
            this.scene.setCursor("move");
        else if (this.dragMode === 'r')
            this.scene.setCursor("rotate");

    }

    showHelper(options = {}) {

        if (this.helperVisible) {
            return
        }

        this.helperVisible = true;
        this.helperMesh.visible = true;

        if (options.animate) {

            this.opacityTween = this.animate(this.opacityTween,
                { opacity: this.helperMesh.material.opacity }, { opacity: this.indicatorArcOpacity }, 100, util.easingSmooth, (value) => {
                    this.helperMesh.material.opacity = value.opacity;
                }, undefined, () => {
                    this.helperMesh.visible = true;
                    this.helperMesh.material.opacity = this.indicatorArcOpacity;
                    if (options.onFinish) options.onFinish();
                }, options.onStop)
        }
        else {
            this.stopOpacityTween();
            this.helperMesh.material.opacity = this.indicatorArcOpacity;
        }

        this.labelDegIndicator.show(options);
    }

    hideHelper(options = {}) {

        if (!this.helperVisible) return;

        if (options.animate) {

            this.opacityTween = this.animate(this.opacityTween,
                { opacity: this.helperMesh.material.opacity }, { opacity: 0 }, 100, options.easing, (value) => {

                    this.helperMesh.material.opacity = value.opacity;

                }, undefined, () => {
                    this.helperMesh.visible = false;
                    if (options.onFinish) options.onFinish();

                }, options.onStop)
        }
        else {
            this.stopOpacityTween();
            this.helperMesh.visible = false;
            this.helperMesh.material.opacity = 0;
        }

        this.helperVisible = false;
        this.labelDegIndicator.hide(options);

    }

    updateSnapPoints(){
        
        // console.warn(" ----------------- " + this.pointerPt);
        this.dragMode = "m";
        this.onDrag(this.pointerPt);

        // console.warn(this.itemSnappedForOrigin);
        
    }

    show(options = {}) {

        if (this.visible) return;

        super.show();

        this.parentMesh.visible = this.scene.states.protractorVisible = true;

    }

    hide(options = {}) {

        if (!this.visible) return;

        super.hide(options);

        options.easing = util.easingSmooth;

        this.hideHelper({
            animate: options.animate || options.toGoToRestingPosition
        })

        if (options.toGoToRestingPosition) {

            this.setOriginAndAngle(this.restingPosition, this.angle, {
                animate: true,
                easing: options.easing,
                duration: 1200,
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

        this.scene.states.protractorVisible = false;
        this.itemSnappedForAngle = this.itemSnappedForOrigin = undefined;

    }

    pushAside(options = {}) {

        this.setOriginAndAngle(this.restingPosition, this.angle, {
            animate: true,
            easing: options.easing,
            duration: 1200,
            onFinish: () => {

                if (options.onFinish) options.onFinish();

            },
            onStop: () => {
                if (options.onStop) options.onStop();
            }
        })
    }

}