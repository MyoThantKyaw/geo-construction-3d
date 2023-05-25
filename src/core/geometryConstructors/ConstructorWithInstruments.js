import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry, TorusGeometry, Vector2, Vector3 } from "three";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import DefArcWithCenterPointRadiusStartEndAngle from "../definitions/arc/DefArcWithCenterPointRadiusStartEndAngle";
import DefCircleWithFixedRadius from "../definitions/circles/DefCircleWithFixedRadius";
import DefLabelBetween2Points from "../definitions/labels/DefLabelBetween2Points";
import DefLabelForPoint from "../definitions/labels/DefLabelForPoint";
import DefPointFree from "../definitions/points/DefPointFree";
import DefPointOnIntersection from "../definitions/points/DefPointOnIntersection";
import DefPointOnInvisibleCircle from "../definitions/points/DefPointOnInvisibleCircle";
import DefPointOnParallelSegment from "../definitions/points/DefPointOnParallelSegment";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import DefPointWithAngleAndLenFromALine from "../definitions/points/DefPointWithAngleAndLenFromALine";
import DefPointWithAngleFromALine from "../definitions/points/DefPointWithAngleFromALine";
import DefSegment2Points from "../definitions/segments/DefSegment2Points";
import DefAngleThreePoints from "../definitions/symbols/angles/DefAngleThreePoints";
import Geometry from "../geometries/abstract/Geometry";
import Arc from "../geometries/Arc";
import Circle from "../geometries/Circle";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import Label from "../graphics/Label";
import Angle from "../graphics/symbols/Angle";
import Compass from "../instruments/Compass";
import Pencil from "../instruments/Pencil";
import Protractor from "../instruments/Protractor";
import Ruler from "../instruments/Ruler";
import Scene from "../Scene";
import ConstructionPoint from "./materials/ConstructionPoint";
import SetSquare45 from "../instruments/SetSquare45";
import { reactive } from "vue";

import * as util from "../helper/util";

export default class ConstructorWithInstruments {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        this.scene = scene;
        this.sceneStates = scene.states;

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
        /**
         * @type {Protractor}
         */
        this.protractor = scene.protractor;
        /**
         * @type {SetSquare45}
         */
        this.setSquare45 = scene.setSquare45;

        this.commands = [];

        this.states = reactive({
            drawingGeometry: undefined,
            point1: new ConstructionPoint(),
            point2: new ConstructionPoint(),
            point3: new ConstructionPoint(),
            inputPanelEnabled: false,
            activeInstrument: undefined,
        });

        this.point1 = this.states.point1;
        this.point2 = this.states.point2;
        this.point3 = this.states.point3;

        this.pointerPos = new Vector2();

        this.tmpVect3 = new Vector3();

        this.material = new MeshBasicMaterial({ color: Geometry.HIGHLIGHT_COLOR });

        // preview graphics
        this.previewSegment = new Mesh(
            new BoxGeometry(1, 0.06, 0.013),
            this.material
        );
        scene.add(this.previewSegment, false).visible = false;

        this.previewArc = new Mesh(new TorusGeometry(4, .02, 16, 100), new MeshBasicMaterial({ color: Geometry.HIGHLIGHT_COLOR }));
        scene.add(this.previewArc);
        this.previewArc.visible = false;

        this.pointerMoveEvent = {};
        this.pointerDownEvent = {};

        // this.inputLabel = scene.uiPanel.$refs.constWithInstInputLabel;

        this.scene.cameraControls.addEventListener("control", (e) => {
            if (!this.active) return;

        })

        this.contextMenuHandler = evt => {

            evt.preventDefault();

            if (!this.states.inputPanelEnabled && this.states.activeInstrument) {

                if (this.states.activeInstrument.isRuler) {
                    if (this.point2.active) {
                        this.segLengthInput.value = parseFloat(this.previewSegment.scale.x.toFixed(2));
                        this.enterInputMode();

                        this.drawingSegmentVect = new Vector2(this.point2.x - this.point1.x, this.point2.y - this.point1.y);
                        this.drawingSegmentVect.normalize();

                        setTimeout(() => {
                            this.segLengthInput.select();
                            this.segLengthInput.focus();
                        }, 0);
                    }
                }
                else if (this.states.activeInstrument.isProtractor) {

                    this.enterInputMode();
                    this.angleInput.value = this.protractor.helperAngleDeg;

                    setTimeout(() => {
                        this.angleInput.select();
                        this.angleInput.focus();
                    }, 0);

                }
            }

        }

        
        scene.on("Escape:up", e => {

            if (!this.active) return;

            this.cancelDrawing();

        })

        scene.on("e:down", e => {

            if (!this.active || this.states.inputPanelEnabled || this.scene.selectionManager.selectedItems.length > 0) return;

            if (this.states.drawingGeometry !== 'point') {
                this.states.drawingGeometry = "point";

                if (!(this.pointerMoveEvent && this.pointerMoveEvent.hoveredItem)) {
                    this.pencil.moveTo(this.tmpVect3.set(this.pointerMoveEvent.x, this.pointerMoveEvent.y, 0));
                    this.pencil.show();

                    if (this.states.activeInstrument) {
                        this.states.activeInstrument.hideHelper()
                        this.states.activeInstrument = undefined;
                    }
                }

                scene.requestRender();
            }

        })

        scene.on('keyup', e => {
            if (!this.active) return;

            if (this.states.drawingGeometry === 'point') {

                this.clearData();
                this.pencil.hide();
                scene.requestRender();
            }

        })

        // this.testPoint = new Mesh(new SphereGeometry(.1, 10, 10), new MeshBasicMaterial({ color: 0x933f23 }));
        // scene.add(this.testPoint);

        // this.testPoint1 = new Mesh(new SphereGeometry(.2, 10, 10), new MeshBasicMaterial({ color: 0x002f23 }));
        // scene.add(this.testPoint1);

        // this.testPoint2 = new Mesh(new SphereGeometry(.3, 10, 10), new MeshBasicMaterial({ color: 0x001ff3 }));
        // scene.add(this.testPoint2);

        // this.testPoint.visible = this.testPoint1.visible = this.testPoint2.visible = false;

        // this.compass.on("update", e => {
        //     if(this.compass.inDrawMode){
        //         console.log("draw arc... ");
        //     }
        // })

    }

    onPointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        if (this.states.drawingGeometry) {
            // update preview ge

            if (this.states.drawingGeometry === 'segment') {

                this.point2.copy(this.states.activeInstrument.helperPt);
                this.pencil.moveTo(this.tmpVect3.set(this.point2.x, this.point2.y, 0));
                this.updateSegment();

                if (!this.pencil.visible) this.pencil.show();
            }
            else if (this.states.drawingGeometry === 'point') {

                if (e.hoveredItem) {

                    if (e.hoveredItem.isInstrument) {
                        if (this.pencil.visible) this.pencil.hide();
                    }
                    else {

                        if (e.hoveredItem.isIntersectionPt) {
                            e.x = e.hoveredItem.position.x;
                            e.y = e.hoveredItem.position.y;
                        }
                        else if (e.hoveredItem.isSegment) {

                            const ptOnSegment = util.projectPointOnSegment(e, e.hoveredItem.pt1, e.hoveredItem.pt2)
                            e.x = ptOnSegment.x;
                            e.y = ptOnSegment.y;

                        }
                        if (!this.pencil.visible) this.pencil.show();
                        this.pencil.moveTo(this.tmpVect3.set(e.x, e.y, 0));
                    }

                }
                else {
                    this.pencil.moveTo(this.tmpVect3.set(e.x, e.y, 0));
                    if (!this.pencil.visible) this.pencil.show();
                }
            }
        }
        else if (e.hoveredItem) {

            if (this.states.activeInstrument) {
                this.states.activeInstrument.hideHelper();
                this.states.activeInstrument = undefined;
            }

            this.pencil.hide();
        }
        else {

            // this.checkFreePointerMove(e);

            if (this.states.activeInstrument) {

                this.pencil.setZRotation(this.getPencilRotationAngle());
                this.pencil.moveTo(this.tmpVect3.set(this.states.activeInstrument.helperPt.x, this.states.activeInstrument.helperPt.y, 0));

                if (this.states.activeInstrument.isProtractor) {
                    this.pencil.show();
                    this.scene.requestRender();

                    // this.states.drawingGeometry = "angle";

                }
                else {

                    if (!this.pencil.visible) {

                        setTimeout(() => {

                            if (this.states.activeInstrument) {

                                this.pencil.show();
                                this.scene.requestRender()
                            }
                        }, 200);
                    }
                }

                if (!this.pencil.visible) {
                    setTimeout(() => {
                        if (this.states.activeInstrument) {
                            this.pencil.show();
                            this.scene.requestRender()
                        }
                    }, 200);
                }

            }
            else {

                if (this.pencil.visible) this.pencil.hide();

            }
        }

        this.pointerMoveEvent = e;

    }

    onPointerDown(e) {

        if (this.states.inputPanelEnabled) {

            this.exitInputMode();
            return;
        }

        this.scene.disableCameraControls()

        if (this.states.activeInstrument) {

            if (this.states.drawingGeometry === 'segment') {

                if (this.states.activeInstrument.helperPt.snappedPoint) {

                    this.point2.name = this.states.activeInstrument.helperPt.snappedPoint.name;
                    this.point2.point = this.states.activeInstrument.helperPt.snappedPoint;

                }

                this.point2.copy(this.states.activeInstrument.helperPt);

                let isFixedLen;

                if (this.states.activeInstrument.isRuler) {

                    isFixedLen =
                        (util.isPtEqual(this.states.activeInstrument.origin, this.point1) || util.isPtEqual(this.states.activeInstrument.origin, this.point2))

                    if (this.point1.name && this.point2.name) {
                        isFixedLen = false;
                    }

                    isFixedLen = isFixedLen && !(
                        (this.states.activeInstrument.pointSnappedForPt1 && this.states.activeInstrument.pointSnappedForPt1.name === this.point1.name && this.point1.name !== undefined)
                        &&
                        (this.states.activeInstrument.pointSnappedForPt2 && this.states.activeInstrument.pointSnappedForPt2.name === this.point2.name && this.point2.name !== undefined)
                    )
                    this.createSegment(isFixedLen);
                }
                else if (this.states.activeInstrument.isSetSquare45) {

                    this.createParallelSegment();

                }
            }
            else if (this.states.activeInstrument.isRuler) {

                this.states.drawingGeometry = "segment";
                this.states.activeInstrument.isDrawingGeoWithInstrument = true;

                if (this.states.activeInstrument.helperPt.snappedPoint) {

                    
                    this.point1.name = this.states.activeInstrument.helperPt.snappedPoint.name;
                    this.point1.point = this.states.activeInstrument.helperPt.snappedPoint;
                    this.point1.copy(this.states.activeInstrument.helperPt.snappedPoint.position);

                }
                else {

                    this.point1.copy(this.states.activeInstrument.helperPt);

                }

                this.point1.active = this.point2.active = true;
                this.pencil.show();

            }
            else if (this.states.activeInstrument.isSetSquare45) {

                this.states.drawingGeometry = "segment";
                this.states.activeInstrument.isDrawingGeoWithInstrument = true;

                if (this.states.activeInstrument.helperPt.snappedPoint) {

                    this.point1.name = this.states.activeInstrument.helperPt.snappedPoint.name;
                    this.point1.point = this.states.activeInstrument.helperPt.snappedPoint;
                    this.point1.copy(this.states.activeInstrument.helperPt.snappedPoint.position);

                }
                else {

                    this.point1.copy(this.states.activeInstrument.helperPt);

                }


                this.point1.active = this.point2.active = true;


            }
            else if (this.states.activeInstrument.isProtractor) {
                this.createAngle();
            }

        }
        else {

            if (this.states.drawingGeometry === 'point') {

                if (e.selectedItem) {

                    if (e.selectedItem.isIntersectionPt) {
                        e.x = e.selectedItem.position.x;
                        e.y = e.selectedItem.position.y;

                        this.createPoint(new DefPointOnIntersection(
                            e.selectedItem.item1.name, e.selectedItem.item2.name, e.selectedItem.ptIndex
                        ));
                    }
                    else if (e.selectedItem.isSegment) {

                        const ptOnSegment = util.projectPointOnSegment(e, e.selectedItem.pt1, e.selectedItem.pt2)
                        e.x = ptOnSegment.x;
                        e.y = ptOnSegment.y;

                        this.createPoint(new DefPointOnSegment(
                            e.selectedItem.name, util.getDistance(e, e.selectedItem.pt1) / e.selectedItem.getLength()
                        ));
                    }

                }
                else {
                    this.createPoint(e);
                }

            }
            else {
                this.scene.enableCameraControls();
            }

        }


        this.pointerDownEvent = e;

    }

    createPoint(def) {

        this.createAndShowPoint(def);
        this.scene.addCommand(this.commands);
        this.clearData();

    }

    createParallelSegment() {

        if (this.states.activeInstrument.snappedLine === undefined) {
            this.createSegment();
            return;
        }

        const isParallel = util.areLinesParallel(
            this.states.activeInstrument.snappedLine.pt1, this.states.activeInstrument.snappedLine.pt2,
            this.point1, this.point2
        );

        if (this.states.activeInstrument.snappedLine &&
            isParallel.parallel
        ) {

            let flipped = false;

            // flip point definitions
            if (this.point2.name && this.point1.name === undefined) {


                this.point1.name = this.point2.name;
                this.point2.name = undefined;

                const pt1 = this.point1.clone();
                this.point1.copy(this.point2);
                this.point2.copy(pt1);


                flipped = true

            }
            else if (isParallel.inReversedOrder) {

                flipped = true;
            }

            if (this.point1.name) {

                if (this.point1.type === "IntersectionPoint") {

                    this.point1.name = this.createAndShowPoint(new DefPointOnIntersection(
                        this.point1.point.item1.name,
                        this.point1.point.item2.name,
                        this.point1.point.ptIndex
                    ))
                }
            }
            else {
                this.point1.name = this.createAndShowPoint(this.point1);
            }

            this.point2.name = this.createAndShowPoint(new DefPointOnParallelSegment(
                this.point1.name,
                util.getDistance(this.point1, this.point2),
                !flipped ? this.states.activeInstrument.snappedLine.definition.point1Name : this.states.activeInstrument.snappedLine.definition.point2Name,
                !flipped ? this.states.activeInstrument.snappedLine.definition.point2Name : this.states.activeInstrument.snappedLine.definition.point1Name
            ))


            const cmdSegment = new CmdCreateGeometry(Segment, new DefSegment2Points(
                this.point1.name,
                this.point2.name), {});
            cmdSegment.execute(this.scene);
            this.commands.push(cmdSegment);

            this.scene.addCommand(this.commands);
            this.clearData();


        }
        else {

            if (this.point1.name) {

                if (this.point1.type === "IntersectionPoint") {

                    this.point1.name = this.createAndShowPoint(new DefPointOnIntersection(
                        this.point1.point.item1.name,
                        this.point1.point.item2.name,
                        this.point1.point.ptIndex
                    ))
                }
            }
            else {
                this.point1.name = this.createAndShowPoint(this.point1);
            }

            if (this.point2.name) {

                if (this.point2.type === "IntersectionPoint") {

                    this.point2.name = this.createAndShowPoint(new DefPointOnIntersection(
                        this.point2.point.item1.name,
                        this.point2.point.item2.name,
                        this.point2.point.ptIndex
                    ))
                }
            }
            else {
                this.point2.name = this.createAndShowPoint(this.point2);
            }

            const cmdSegment = new CmdCreateGeometry(Segment, new DefSegment2Points(this.point1.name, this.point2.name), {});
            cmdSegment.execute(this.scene);
            this.commands.push(cmdSegment);

            this.scene.addCommand(this.commands);
            this.clearData();

        }

    }

    createSegment(isFixedLen) {

        if (( this.point2.name && this.point2.name !== "ptOnSegment") && this.point1.name === undefined) {

            this.point1.name = this.point2.name;
            this.point2.name = undefined;

            const pt1 = this.point1.clone();
            this.point1.copy(this.point2);
            this.point2.copy(pt1);

        }

        const isSegmentOnPointWithAngle = this.checkIfSegmentOnPointWithAngle(undefined, isFixedLen);

        if (!isSegmentOnPointWithAngle) {


            if(this.point1.point && this.point1.point.name === "ptOnSegment"){
                const segment = this.scene.getItemByName(this.point1.point.segmentName)
                this.point1.name = this.createAndShowPoint(new DefPointOnSegment(
                    segment.name,
                    util.getDistance( segment.pt1, this.point1.point.position ) / segment.getLength()
                ));

                isFixedLen = false;
            }
            else if (this.point1.point && this.point1.point.isIntersectionPt) {
                this.point1.name = this.createAndShowPoint(new DefPointOnIntersection(
                    this.point1.point.item1.name,
                    this.point1.point.item2.name,
                    this.point1.point.ptIndex
                ))
            }
            else if (this.point1.name === undefined) {
                this.point1.name = this.createAndShowPoint(this.point1);

            }

            if(this.point2.point && this.point2.point.name === "ptOnSegment"){
                const segment = this.scene.getItemByName(this.point2.point.segmentName)
                this.point2.name = this.createAndShowPoint(new DefPointOnSegment(
                    segment.name,
                    util.getDistance( segment.pt1, this.point2.point.position ) / segment.getLength()
                ));

                isFixedLen = false;

            }
            else if (this.point2.point && this.point2.point.isIntersectionPt) {

                this.point2.name = this.createAndShowPoint(new DefPointOnIntersection(
                    this.point2.point.item1.name,
                    this.point2.point.item2.name,
                    this.point2.point.ptIndex
                ))
            }
            else if (this.point2.name === undefined) {
                if (isFixedLen) {
                    this.point2.name = this.createAndShowPoint(new DefPointOnInvisibleCircle(
                        this.point1.name,
                        util.getDistance(this.point1, this.point2), util.getAngle2Pts(this.point1, this.point2)))
                }
                else
                    this.point2.name = this.createAndShowPoint(this.point2);

            }
            else {
            }
        }


        if (isFixedLen) {

            const cmd = new CmdCreateGeometry(
                Label, new DefLabelBetween2Points(this.point1.name, this.point2.name), {

                vAlign: Label.V_ALIGN_TOP
            });
            cmd.execute(this.scene);
            this.commands.push(cmd);
        }

        this.states.activeInstrument.moveAndSnapOrigin(this.point1);

        const cmdSegment = new CmdCreateGeometry(Segment, new DefSegment2Points(this.point1.name, this.point2.name), {});
        const segment = cmdSegment.execute(this.scene);
        this.commands.push(cmdSegment);

        this.scene.addCommand(this.commands);
        this.clearData();

    }

    checkIfSegmentOnPointWithAngle(e, isFixedLen) {

        let pointWithAngleAndLength = undefined;

        for (let i = 0; i < this.scene.points.length; i++) {

            const point = this.scene.points[i];
            const pointPos = point.position;

            if ((point.definition.constructor === DefPointWithAngleFromALine || point.definition.constructor === DefPointWithAngleAndLenFromALine) && point.definition.point2Name === this.point1.name && this.isPtInSegmentPath(pointPos, this.point1, this.point2, 0.0001)) {
                pointWithAngleAndLength = point;

                break;
            }
        }

        if (!this.states.activeInstrument.pointSnappedForPt1) return;

        const lineLen = util.getDistance(this.point1, this.point2);

        if (pointWithAngleAndLength) {

            if (isFixedLen) {
                this.point2.name = this.createAndShowPoint(

                    new DefPointWithAngleAndLenFromALine(
                        pointWithAngleAndLength.definition.point1Name,
                        pointWithAngleAndLength.definition.point2Name,
                        pointWithAngleAndLength.definition.clockwise ? pointWithAngleAndLength.definition.angle : (util.TWO_PI - pointWithAngleAndLength.definition.angle),
                        lineLen,
                        true
                    )
                );
            }
            else {
                this.point2.name = this.createAndShowPoint(

                    new DefPointWithAngleFromALine(
                        pointWithAngleAndLength.definition.point1Name,
                        pointWithAngleAndLength.definition.point2Name,
                        pointWithAngleAndLength.definition.clockwise ? pointWithAngleAndLength.definition.angle : (util.TWO_PI - pointWithAngleAndLength.definition.angle),
                        lineLen,
                        true
                    )
                );
            }



        }

        return pointWithAngleAndLength;

    }


    updateArc(center, radius, startAngle, endAngle, isCounterClockWise) {

        this.angleDiff = util.getAngleDifference(startAngle, endAngle, isCounterClockWise);

        this.previewArc.geometry = new TorusGeometry(radius, .03, 2, parseInt(this.angleDiff * 33) + 1, this.angleDiff)
        this.previewArc.position.set(center.x, center.y, 0.01);
        this.previewArc.rotation.z = isCounterClockWise ? startAngle : endAngle;
        this.previewArc.visible = true;

        this.angleDiffDegree = this.angleDiff * util.RAD_TO_DEG;

    }


    createArc(compass) {

        let centerPointName;

        if (compass.itemSnappedForOrigin) {
            if (compass.itemSnappedForOrigin.type === "IntersectionPoint") {
                centerPointName = this.createAndShowPoint(new DefPointOnIntersection(
                    compass.itemSnappedForOrigin.item1.name,
                    compass.itemSnappedForOrigin.item2.name,
                    compass.itemSnappedForOrigin.ptIndex,
                ))
            }
            else {
                centerPointName = compass.itemSnappedForOrigin.name;
            }
        }
        else {
            centerPointName = this.createAndShowPoint(compass.origin);
        }

        let cmd;
        if (compass.isArcCompleteCircle) {
            cmd = new CmdCreateGeometry(Circle, new DefCircleWithFixedRadius(centerPointName, compass.radius, compass.radiusIndicatorVisible), {})
        }
        else {
            cmd = new CmdCreateGeometry(Arc, new DefArcWithCenterPointRadiusStartEndAngle(centerPointName, compass.radius, compass.drawModeStartAngle, compass.drawModeEndAngle, compass.radiusIndicatorVisible), {})
        }

        cmd.execute(this.scene);
        this.commands.push(cmd);
        this.scene.addCommand(this.commands);

        compass.itemSnappedForOrigin = this.scene.getItemByName(centerPointName);

        if (compass.radiusIndicatorVisible) {

            // console.log(this.scene.intersectionPts);

            // const centerPoint = this.scene.getItemByName(centerPointName);
            // for(let segment of this.scene.lines.length){

            //     if(centerPoint.name === segment.definition.point1Name || centerPoint.name === segment.definition.point2Name){

            //     }
            // }
        }

        this.clearData();


    }

    createAngle() {

        this.point1.active = true;
        this.point2.active = true;

        const pointSnappedForAngle = this.states.activeInstrument.itemSnappedForAngle;
        let pointSnappedForOrigin = this.states.activeInstrument.itemSnappedForOrigin;

        if (pointSnappedForOrigin.type === "IntersectionPoint") {
            pointSnappedForOrigin = this.scene.getItemByName(this.createAndShowPoint(new DefPointOnIntersection(pointSnappedForOrigin.item1.name, pointSnappedForOrigin.item2.name, pointSnappedForOrigin.ptIndex)))
        }

        this.point1.set(pointSnappedForAngle.position.x, pointSnappedForAngle.position.y);
        this.point2.set(pointSnappedForOrigin.position.x, pointSnappedForOrigin.position.y);

        this.point1.name = pointSnappedForAngle.name;
        this.point2.name = pointSnappedForOrigin.name;

        this.point3.set(this.states.activeInstrument.helperPt.x, this.states.activeInstrument.helperPt.y)

        this.point3.name = this.createAndShowPoint(
            new DefPointWithAngleAndLenFromALine(
                this.point1.name,
                this.point2.name,
                this.states.activeInstrument.helperAngle,
                util.getDistance(this.point2, this.point3), this.states.activeInstrument.snappedSide !== 'l'
            ),
            {
                draggable: false,
                r : Point.DEFAULT_RADIUS * .75,
            }
        )

        const cmdCreateAngle = new CmdCreateGeometry(
            Angle, new DefAngleThreePoints(this.point3.name, this.point2.name, this.point1.name, this.states.activeInstrument.snappedSide === 'l'), {
        })
        cmdCreateAngle.execute(this.scene);
        this.commands.push(cmdCreateAngle);

        this.scene.addCommand(this.commands);

        this.clearData();
        
        if(this.protractor.itemSnappedForOrigin.isIntersectionPt){
            this.protractor.updateSnapPoints();
            console.log("itemSnappedForOrigin.isIntersectionPt");
        }

    }

    setConstructorToolbar(toolbar) {

        this.segLengthInput = toolbar.$refs.inputSegmentLength;
        this.angleInput = toolbar.$refs.inputAngle;

    }

    segmentLengthInputChanged(e) {

        if(!this.states.inputPanelEnabled) return;

        const length = parseFloat(e.target.value);

        if (isNaN(length) || length <= 0 || length >= 20) {

            if (this.pencil.visible)  this.pencil.hide();
            this.previewSegment.visible = false;

            this.ruler.hideHelper();
            
        }
        else {

            if (!this.pencil.visible)  this.pencil.show();
            this.previewSegment.visible = true;

            // this.drawingSegmentVect.setLength(length);

            const ptOnRuler = {x : this.point1.x + this.drawingSegmentVect.x * length, y : this.point1.y + this.drawingSegmentVect.y * length};

            this.ruler.updateHelper(ptOnRuler, {
                toRound : false,
            });

            this.ruler.showHelper();

            this.point2.copy(this.states.activeInstrument.helperPt);
            this.pencil.moveTo(this.tmpVect3.set(ptOnRuler.x, ptOnRuler.y, 0));
            this.updateSegment();

        }

        this.scene.requestRender();
    }

    segmentLengthEnterPressHandler(e) {

        if (!(e.key === "Enter")) return;

        const length = parseFloat(e.target.value);

        if (isNaN(length) || length <= 0 || length >= 20) {
            return;
        }

        this.pencil.hide({
            toGoToRestingPosition: true,
        });
        this.createSegment(true);
        this.exitInputMode();
       
        this.ruler.hideHelper();
        this.ruler.pointSnappedForPt1 = undefined;

        this.ruler.measureAnimate( { x : -5, y : -14}, { x : -3, y : -14});

    }

    angleInputChanged(e) {

        if(!this.states.inputPanelEnabled) return;

        const angle = parseFloat(e.target.value);

        if (isNaN(angle) ||  angle <= 0 || angle > 180) {

            if (this.protractor.helperVisible) {
                this.pencil.hide();
                this.protractor.hideHelper();
            }

        }
        else {

            const angRad = angle * util.DEG_TO_RAD;

            const pencilPoint = new Vector2();

            if (this.protractor.snappedSide === 'l') {
                pencilPoint.x = this.protractor.origin.x + (this.protractor.radius + .5) * Math.cos((this.protractor.angle + Math.PI) - angRad)
                pencilPoint.y = this.protractor.origin.y + (this.protractor.radius + .5) * Math.sin((this.protractor.angle + Math.PI) - angRad)
            }
            else {
                pencilPoint.x = this.protractor.origin.x + (this.protractor.radius + .5) * Math.cos(this.protractor.angle + angRad)
                pencilPoint.y = this.protractor.origin.y + (this.protractor.radius + .5) * Math.sin(this.protractor.angle + angRad)
            }

            this.protractor.updateHelper(pencilPoint);

            this.pencil.setZRotation(this.getPencilRotationAngle());
            this.pencil.moveTo(new Vector3(this.protractor.helperPt.x, this.protractor.helperPt.y, 0));

            if (!this.protractor.helperVisible) {
                this.pencil.show();
                this.protractor.showHelper();
            }
        }

        this.scene.requestRender();
    }

    angleInputEnterPressHandler(e) {

        if(!this.states.inputPanelEnabled) return;

        if (!(e.key === "Enter")) return;

        const angle = parseFloat(e.target.value);

        if (isNaN(angle) ||  angle <= 0 || angle > 180) {
            return;
        }

        this.pencil.hide({
            toGoToRestingPosition: true,
        });

        this.createAngle();
        this.exitInputMode();

        this.protractor.hideHelper();
        this.protractor.itemSnappedForAngle = undefined;
        this.protractor.pushAside();

        this.scene.requestRender();
    }

    cancelDrawing() {

        if(this.states.inputPanelEnabled){
            this.exitInputMode();
        }
        this.clearData();
    }

    clearData() {

        this.point1.active = this.point2.active = this.point3.active = false;
        this.point1.name = this.point2.name = this.point3.name = undefined;
        this.point1.point = this.point2.point = this.point3.point = undefined;
        this.states.drawingGeometry = undefined;
        if (this.states.activeInstrument) {
            this.states.activeInstrument.isDrawingGeoWithInstrument = false;
        }

        this.commands.length = 0;
        this.previewSegment.visible = this.previewArc.visible = false;

        this.ruler.hideHelper();
        if(this.pencil.visible) this.pencil.hide();
        this.protractor.hideHelper();

        // this.states.activeInstrument = undefined;
        
        this.scene.requestRender();

    }

    createAndShowPoint(def, options = {}) {

        const addToScene = options.addToScene || false;

        if (typeof def.x === "number") {
            def = new DefPointFree(def.x, def.y);
        }

        const command = new CmdCreateGeometry(Point, def, options);

        this.commands.push(command);
        const item = command.execute(this.scene);

        if (options.highlightColor) {
            item.setColor(Geometry.HIGHLIGHT_COLOR);
        }

        if (addToScene)
            this.scene.addCommand(command)


        return item.name;

    }

    getLabelForItem(item) {

        for (let label of this.scene.labels) {

            if (label.definition) {

            }
        }
    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        this.scene.requestRender();

    }

    exitInputMode() {

        this.states.inputPanelEnabled = false;
        // this.states.activeInstrument = undefined;
        // this.updateSegment();
    }

    activate() {

        this.active = true;
        this.scene.container.addEventListener("contextmenu", this.contextMenuHandler);

    }

    deactivate() {

        this.exitInputMode()

        this.active = false;
        this.scene.container.removeEventListener("contextmenu", this.contextMenuHandler);

        this.compass.hide();
        this.ruler.hide();
        this.protractor.hide();
        this.pencil.hide();
        this.setSquare45.hide();

    }

    checkFreePointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        if (this.states.drawingGeometry) {
            if (this.states.activeInstrument)
                this.states.activeInstrument.updateHelper(e, true)
            return this.states.activeInstrument;
        }
        else {

            this.states.activeInstrument = undefined;

            for (let i = 0; i < this.scene.instruments.length; i++) {

                if (this.scene.instruments[i].visible && this.scene.instruments[i].instrumentType !== 'Pencil') {

                    if (!this.states.activeInstrument && this.scene.instruments[i].updateHelper(e, true)) {
                        this.states.activeInstrument = this.scene.instruments[i];
                        this.states.activeInstrument.showHelper({
                            animate: true,
                        });

                    }
                    else {
                        this.scene.instruments[i].hideHelper({ animate: true });
                    }
                }
            }

            return this.states.activeInstrument;

        }
    }

    isItemSelectable(item) {

        if (this.states.inputPanelEnabled) {
            return false;
        }

        if (this.states.drawingGeometry === "point") {

            return item.isSegment || item.isIntersectionPt;
        }

        return true;
    }

    getPencilRotationAngle() {

        if (this.states.activeInstrument.isProtractor) {

            return util.getAngle2Pts(this.states.activeInstrument.origin, this.states.activeInstrument.helperPt)
        }
        else if (this.states.activeInstrument.isRuler || this.states.activeInstrument.isSetSquare45) {
            return this.getPencilInclinationAngle(this.states.activeInstrument.vectorNorm, this.states.activeInstrument.side);
        }
        else {
            return 0;
        }

    }

    isPtInSegmentPath(pt, pt1, pt2, tolerance = .01) {

        const lineVect = new Vector2(pt2.x - pt1.x, pt2.y - pt1.y).normalize();

        const testVectToTestPt = new Vector2(pt.x - pt1.x, pt.y - pt1.y);

        const lenProjectedOnLine = lineVect.dot(testVectToTestPt);

        const dist = Math.abs((lineVect.y * testVectToTestPt.x) + (-lineVect.x * testVectToTestPt.y))

        return lenProjectedOnLine >= 0 && lenProjectedOnLine <= util.getDistance(pt1, pt2) && dist <= tolerance;

    }

    getPencilInclinationAngle(lineVector, directionFactor) {

        return util.getAngle(lineVector.x, lineVector.y) - (-directionFactor * .9);

    }

    updateSegment() {

        this.previewSegment.scale.x = util.getDistance(this.point1, this.point2);
        this.previewSegment.rotation.z = Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
        this.previewSegment.position.set(this.point1.x + Math.cos(this.previewSegment.rotation.z) * (this.previewSegment.scale.x / 2), this.point1.y + Math.sin(this.previewSegment.rotation.z) * (this.previewSegment.scale.x / 2), 0);

        this.previewSegment.updateMatrix();
        this.previewSegment.visible = true;

    }

    /**
     * 
     * @param {Point} point 
     */
    hasLabelOnPoint(point) {

        for (let label of this.scene.labels) {
            if (label.definition.constructor === DefLabelForPoint && label.definition.pointName === point.name) {
                return true;
            }
        }

        return false;
    }
}