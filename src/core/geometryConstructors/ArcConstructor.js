import DefPointWithAngleFromALine from "../definitions/points/DefPointWithAngleFromALine";
import DefPointWithAngleAndLenFromALine from "../definitions/points/DefPointWithAngleAndLenFromALine";
import Point from "../geometries/Point";
import { BoxGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, TorusGeometry, Vector2 } from "three";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";
import DefLabelBetween2Points from "../definitions/labels/DefLabelBetween2Points";
import DefArcWithCenterPointRadiusStartEndAngle from "../definitions/arc/DefArcWithCenterPointRadiusStartEndAngle";
import DefArcOnSegment from "../definitions/arc/DefArcOnSegment";

import * as util from "../helper/util"
import { markRaw, reactive } from "vue";
import Arc from "../geometries/Arc";
import Compass from "../instruments/Compass";
import Label from "../graphics/Label";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import ConstructionPoint from "./materials/ConstructionPoint";
import DefLabelBetween2StaticPoints from "../definitions/labels/DefLabelBetween2StaticPoints";
import Ruler from "../instruments/Ruler";
import Geometry from "../geometries/abstract/Geometry";

export default class ArcConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);

        this.states = reactive({
            radius: 0,
            point1: new ConstructionPoint(),
            point2: new ConstructionPoint(),
            point3: new ConstructionPoint(),
            isValid: true,
            inputPanelEnabled: false,
        })

        this.name = 'ArcConstructor';

        scene.states.arcConstructor = this.states;

        this.withStaticAngle = true;
        this.isCounterClockWise = false;

        this.point1 = this.states.point1;
        this.point2 = this.states.point2;
        this.point3 = this.states.point3;

        this.centerPoint = undefined;
        this.radius = undefined;

        this.radiusLine = markRaw(new Mesh(
            new BoxGeometry(1, .025, .05),
            new MeshBasicMaterial({
                color: this.constructionColor,
                opacity: .4,
                transparent: true,
            })
        ));
        scene.add(this.radiusLine);
        this.radiusLine.visible = false;

        this.arcMesh = markRaw(new Mesh(new TorusGeometry(4, .1, 16, 100), new MeshBasicMaterial({ color: this.constructionColor })));
        scene.add(this.arcMesh);
        this.arcMesh.visible = false;

        this.selectableItemsTypes = [Point];

        this.contextMenuHandler = evt => {

            evt.preventDefault();

            if (this.point2.active) {
                this.enterInputMode();
            }
        }

        /**
         * @type {Ruler}
         */
        this.ruler = scene.ruler;

        this.labelLength = new Label(new DefLabelBetween2StaticPoints(new Vector2(), new Vector2()), {
            vAlign: Label.V_ALIGN_TOP,
            color: this.constructionColor,
        })
        this.scene.add(this.labelLength);

        this.preveiwCenterPoint = markRaw(new Mesh(new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .012, 20).rotateX(util.PI_BY_2), new MeshBasicMaterial({ color: this.constructionColor })));
        scene.add(this.preveiwCenterPoint).visible = false;

        scene.on("Escape:up", () => {
            if (this.active) {

                if (this.states.inputPanelEnabled) {
                    this.exitInputMode();
                }

                this.clearData();
                this.scene.requestRender();

            }
        })

    }

    enterPressHandlerAngle(e) {

        if (e.key !== "Enter" || !this.states.isValid) return;

        if (this.hoveredItem) {

            if (this.hoveredItem.isPoint) {

                this.point3 = this.hoveredItem;

                if (this.hoveredItem.isFree) {

                    this.point3.setDefinition(
                        new DefPointWithAngleFromALine(this.point1, this.point2, util.getAngleDifference(util.getAngle2Pts(this.point2.pos, this.point1.pos), util.getAngle2Pts(this.point2.pos, this.pointerCoor)), util.getDistance(this.point2.pos, this.pointerCoor))
                    )
                }
                else if (this.hoveredItem.isAngleFree) {

                    this.point3.setDefinition(
                        new DefPointWithAngleAndLenFromALine(this.point1, this.point2, util.getAngleDifference(util.getAngle2Pts(this.point2.pos, this.point1.pos), util.getAngle2Pts(this.point2.pos, this.pointerCoor)), util.getDistance(this.point2.pos, this.pointerCoor))
                    )
                }


            }
            else if (this.hoveredItem.isSegment) {

                const segment = this.hoveredItem;

                const segPoint1 = segment.definition.point1;

                this.point3 = segPoint1 === this.point2 ? segment.definition.point2 : segPoint1;

                if (this.point3.isFree)
                    this.point3.setDefinition(new DefPointWithAngleFromALine(this.point1, this.point2, util.getAngleDifference(util.getAngle2Pts(this.point2.pos, this.point1.pos), util.getAngle2Pts(this.point2.pos, this.pointerCoor)), util.getDistance(this.point2.pos, this.pointerCoor)));
                else if (this.point3.isAngleFree)
                    this.point3.setDefinition(new DefPointWithAngleAndLenFromALine(this.point1, this.point2, util.getAngleDifference(util.getAngle2Pts(this.point2.pos, this.point1.pos), util.getAngle2Pts(this.point2.pos, this.pointerCoor)), util.getDistance(this.point2.pos, this.pointerCoor)));

            }
        }
        else {

            const newPoint = this.createAndShowPoint(new DefPointWithAngleFromALine(this.point1, this.point2, util.getAngleDifference(util.getAngle2Pts(this.point2.pos, this.point1.pos), util.getAngle2Pts(this.point2.pos, this.pointerCoor)), util.getDistance(this.point2.pos, this.pointerCoor)));
            this.point3 = newPoint;
        }

        if (this.point1 && this.point1.isTemporaryUpdated) this.point1.makeTemporaryUpdatePermanent();
        if (this.point2 && this.point2.isTemporaryUpdated) this.point2.makeTemporaryUpdatePermanent();
        if (this.hoveredItem) {
            if (this.hoveredItem.isPoint && this.hoveredItem.isTemporaryUpdated) {
                this.hoveredItem.makeTemporaryUpdatePermanent();
            }
            if (this.hoveredItem.isSegment) {
                if (this.hoveredItem.definition.point1.isTemporaryUpdated) this.hoveredItem.definition.point1.makeTemporaryUpdatePermanent();
                if (this.hoveredItem.definition.point2.isTemporaryUpdated) this.hoveredItem.definition.point2.makeTemporaryUpdatePermanent();
            }
        }

        this.createArc();

    }

    updateArc(center, radius, startAngle, endAngle, isCounterClockWise) {

        this.angleDiff = util.getAngleDifference(startAngle, endAngle, isCounterClockWise);

        this.arcMesh.geometry = new TorusGeometry(radius, .03, 2, parseInt(this.angleDiff * 33) + 1, this.angleDiff)
        this.arcMesh.position.set(center.x, center.y, 0.01);
        this.arcMesh.rotation.z = isCounterClockWise ? startAngle : endAngle;

        this.angleDiffDegree = this.angleDiff * util.RAD_TO_DEG;

    }

    onPointerDown(e) {

        if (this.states.inputPanelEnabled) {

            // this.point2.copy(e);
            // this.resetPreview();
            this.exitInputMode();
            return;
        }

        if (e.selectedItem) {

            if (this.point3.active) {

            }
            else if (this.point2.active) {

                if (e.selectedItem.isSegment) {

                    this.lineWithArc = e.selectedItem;

                    const ptOnLine = util.projectPointOnLine(e, e.selectedItem.pt1, e.selectedItem.pt2)

                    this.point2.copy(ptOnLine); // edit to pt on segment

                    this.radius = util.getDistance(this.point1, this.point2);
                    this.startAngle = this.endAngle = util.getAngle2Pts(this.point1, this.point2);

                }
                else {

                    this.point2.copy(e);
                    this.startAngle = this.endAngle = util.getAngle2Pts(this.point1, this.point2);

                }

                this.point3.active = true;

            }
            else {
                this.point1.geometry = e.selectedItem;
                this.point1.copy(e.selectedItem.position);
                this.point2.active = true;

            }

        }
        else {

            if (this.point3.active) {

                this.point3.copy(e);
                this.createArc();

            }
            else if (this.point2.active) {
                this.point3.active = true;
                this.point2.copy(e);
                this.startAngle = this.endAngle = util.getAngle2Pts(this.point1, this.point2);
                this.radius = util.getDistance(this.point1, this.point2);

            }
            else {

                this.preveiwCenterPoint.position.set(this.point1.x, this.point1.y);
                this.preveiwCenterPoint.visible = true;
                this.point2.active = true;
                this.point1.copy(e);

            }

        }


        // this.updateInputDimensionValues();

    }

    onPointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        this.hoveredItem = e.hoveredItem;

        if (this.point3.active) {

            if (this.lineWithArc) {

                this.endAngle = util.getAngle2Pts(this.point1, e);
                this.startAngle = (this.endAngle + util.getAngleDifference(this.endAngle, util.getAngle2Pts(this.point1, this.point2)) * 2) % util.TWO_PI;

            }
            else {
                this.endAngle = util.getAngle2Pts(this.point1, e);
            }

            this.point3.copy(e);

        }
        else if (this.point2.active) {

            if (this.hoveredItem) {

                if (this.hoveredItem.isSegment) {

                    const ptOnLine = util.projectPointOnLine(e, this.hoveredItem.pt1, this.hoveredItem.pt2)
                    e.x = ptOnLine.x;
                    e.y = ptOnLine.y;

                }
            }

            this.states.isValid = true;
            this.point2.copy(e);

        }
        else {

            this.point1.active = true;

            if (this.hoveredItem && this.hoveredItem.isPoint) {
                this.point1.copy(this.hoveredItem.position);
            }
            else {

                this.point1.copy(e);
            }


        }

        this.updateGraphics();
        this.updateInputDimensionValues();

    }

    updateGraphics() {

        if (this.states.isValid) {

            if (this.point3.active) {

                this.isCounterClockWise = util.getAngleDifference(this.startAngle, this.endAngle) < Math.PI;
                this.updateArc(this.point1, this.radiusLine.scale.x, this.startAngle, this.endAngle, this.isCounterClockWise);

                this.radiusLine.rotation.z = Math.atan2(this.point3.y - this.point1.y, this.point3.x - this.point1.x);
                this.radiusLine.position.set(this.point1.x + Math.cos(this.radiusLine.rotation.z) * (this.radiusLine.scale.x / 2), this.point1.y + Math.sin(this.radiusLine.rotation.z) * (this.radiusLine.scale.x / 2), 0);

                this.arcMesh.visible = this.startAngle !== this.endAngle;
                this.labelLength.definition.update(this.point1, {
                    x: this.point1.x + Math.cos(this.endAngle) * this.radiusLine.scale.x,
                    y: this.point1.y + Math.sin(this.endAngle) * this.radiusLine.scale.x
                });
                this.radiusLine.visible = true;

                if (!this.labelLength.visible) this.labelLength.show();

            }
            else if (this.point2.active) {

                this.radiusLine.scale.x = util.getDistance(this.point1, this.point2);
                this.radiusLine.rotation.z = Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
                this.radiusLine.position.set(this.point1.x + Math.cos(this.radiusLine.rotation.z) * (this.radiusLine.scale.x / 2), this.point1.y + Math.sin(this.radiusLine.rotation.z) * (this.radiusLine.scale.x / 2), 0);


                this.labelLength.definition.update(this.point1, this.point2);
                this.radiusLine.visible = true;

                if (!this.labelLength.visible) {
                    setTimeout(() => {
                        if (this.point2.active) this.labelLength.show();
                    }, 50);
                }
            }
            else {
                this.arcMesh.visible = this.radiusLine.visible = false;
                this.labelLength.hide();
            }
        }
        else {
            this.arcMesh.visible = this.radiusLine.visible = false;
            this.labelLength.hide();
        }
    }

    createLengthLabelBetween2Points(point1, point2) {

        const label = new Label(new DefLabelBetween2Points(point1, point2), {
            vAlign: Label.V_ALIGN_TOP,
        });
        return this.scene.add(label).show();
    }

    createArc() {

        if (this.lineWithArc) {

            const direction = this.isInSameDirection(
                this.lineWithArc.getVector(),
                {
                    x: this.point2.x - this.point1.x,
                    y: this.point2.y - this.point1.y
                }
            );


            const cmd = new CmdCreateGeometry(Arc, new DefArcOnSegment(
                this.lineWithArc.name, this.point1.name, this.radius, util.getAngleDifference(this.endAngle, this.startAngle, !this.isCounterClockWise)
                , direction
            ), {

            })


            cmd.execute(this.scene);
            this.commands.push(cmd);

            this.scene.addCommand(this.commands);

        }
        else {

            if (this.point1.geometry) {
                this.point1.name = this.point1.geometry.name;
            }
            else {
                this.point1.name = this.createAndShowPoint(this.point1);
            }

            const cmd = new CmdCreateGeometry(Arc, new DefArcWithCenterPointRadiusStartEndAngle(
                this.point1.name, this.radius, this.isCounterClockWise ? this.startAngle : this.endAngle, this.isCounterClockWise ? this.endAngle : this.startAngle
            ), {

            })

            cmd.execute(this.scene);
            this.commands.push(cmd);

            this.scene.addCommand(this.commands);

        }

        this.clearData();
        this.scene.requestRender();

    }

    /**
     * 
     * @param {Compass} compass 
     */
    createArcDrawnWithCompass(compass) {

        let centerPointName;

        if (compass.itemSnappedForOrigin) {
            centerPointName = compass.itemSnappedForOrigin.name
        }
        else {
            centerPointName = this.createAndShowPoint(compass.origin);
        }

        const cmd = new CmdCreateGeometry(Arc, new DefArcWithCenterPointRadiusStartEndAngle(
            centerPointName, compass.radius, compass.drawModeStartAngle, compass.drawModeEndAngle
        ), {

        })

        cmd.execute(this.scene);
        this.commands.push(cmd);
        this.scene.addCommand(this.commands);

        this.clearData();

    }


    clearData() {

        this.point1.name = this.point2.name = this.point3.name = undefined;
        this.point1.geometry = this.point2.geometry = this.point3.geometry = undefined;

        this.point2.active = this.point3.active = false;
        this.point1.active = true;

        this.states.isValid = false;

        this.lineWithArc = undefined;

        this.states.inputPanelEnabled = false;

        this.commands.forEach(cmd => {
            if (cmd.geo && (cmd.geo.isPoint || cmd.geo.isArc)) {
                cmd.geo.setColor(Geometry.DEFAULT_COLOR);
            }
        });

        this.commands.length = 0;

        this.angleDiffDegree = this.angleDiff = 0;

        this.arcMesh.visible = false;
        this.radiusLine.visible = false;
        this.preveiwCenterPoint.visible = this.states.inputPanelEnabled = false;


        this.updateGraphics();
        this.updateInputDimensionValues();

        this.scene.removeHover();

    }

    setConstructorToolbar(toolbar) {

        this.toolbar = toolbar;
        this.inputArcRadius = toolbar.$refs.inputArcRadius;
        this.inputArcAngle = toolbar.$refs.inputArcAngle;


        this.updateInputDimensionValues();

    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        if (this.point3.active) {
            this.inputArcAngle.focus();
            this.inputArcAngle.select();

        }
        else if (this.point2.active) {
            this.inputArcRadius.focus();
            this.inputArcRadius.select();

        }
    }

    exitInputMode() {

        this.states.inputPanelEnabled = false;

        this.inputArcRadius.blur();
        this.inputArcAngle.blur();
    }

    arcRadiusInputChanged(e) {
        
        if(!this.states.inputPanelEnabled) return;

        const inputRadius = parseFloat(e.target.value);

        if (isNaN(inputRadius) || inputRadius === 0) {
            this.states.isValid = false;
            this.updateGraphics();
            this.scene.requestRender();
            return;
        }

        this.states.isValid = true;

        const angle = util.getAngle2Pts(this.point1, this.point2);
        this.point2.set(this.point1.x + Math.cos(angle) * inputRadius, this.point1.y + Math.sin(angle) * inputRadius);

        this.updateGraphics();


        this.scene.requestRender();

    }

    arcAngleInputChanged(e) {


        let inputArcAngle = parseFloat(e.target.value);

        if (isNaN(inputArcAngle) || inputArcAngle <= 0) {
            this.states.isValid = false;
            this.updateGraphics();
            this.scene.requestRender();
            return;
        }

        this.states.isValid = true;

        inputArcAngle = inputArcAngle * util.DEG_TO_RAD;

        if (this.lineWithArc) {

            this.endAngle = util.getAngle2Pts(this.point1, e);
            this.startAngle = (this.endAngle + util.getAngleDifference(this.endAngle, util.getAngle2Pts(this.point1, this.point2)) * 2) % util.TWO_PI;

        }
        else {
            if (this.isCounterClockWise) {
                this.endAngle = this.startAngle + inputArcAngle;
            }
            else {
                this.endAngle = this.startAngle - inputArcAngle;
            }

            const radius = util.getDistance(this.point1, this.point2);

            this.point3.set(this.point1.x + Math.cos(this.endAngle) * radius, this.point1.y + Math.sin(this.endAngle) * radius);

            // this.testPoint.position.set(this.point3.x, this.point3.y, 0);
            // this.testPoint.visible = true;
        }

        this.updateGraphics();
        this.scene.requestRender();

    }

    arcRadiusEnterPressed(e) {

        if (e.key !== "Enter" || !this.states.isValid) return;

        this.exitInputMode();
        this.onPointerDown(this.point2);
    }

    arcAngleEnterPressed(e) {

        if (e.key !== "Enter" || !this.states.isValid) return;

        this.exitInputMode();
        this.onPointerDown(this.point3);

    }

    originInputChanged(e, varName) {

        let x = parseFloat(e.target.value);

        if (isNaN(x)) {
            this.states.isValid = false;
            this.updateGraphics();
            this.scene.requestRender();
            return;
        }

        this.states.isValid = true;
        this.point1[varName] = x;



        this.updateGraphics();
        this.scene.requestRender();
    }

    originXEnterPressed(e) {

    }

    originYEnterPressed(e) {

    }


    setMode(mode) {

        if (mode === "input") {

            this.scene.freeze();

            this.radiusInput.focus();
            this.radiusInput.select();

        }
        else if (mode === 'pointer') {

            this.scene.unfreeze();
            this.resetPreview();
            this.states.isValid = true;
        }

        this.mode = mode;
        this.updateInputDimensionValues();
        this.scene.requestRender();
    }

    updateInputDimensionValues() {

        if (this.point3.active) {
            this.inputArcAngle.value = parseFloat(this.angleDiffDegree.toFixed(1));
        }
        else if (this.point2.active) {
            this.inputArcRadius.value = parseFloat(util.getDistance(this.point1, this.point2).toFixed(2))
        }
        else {
            this.inputArcRadius.value = this.inputArcAngle.value = "-";
        }



    }

    getPonit3OnSegment(segment) {

        const segPoint1 = segment.definition.point1;
        const segPoint2 = segment.definition.point2;

        return segPoint1 === this.point2 ? segPoint2 : segPoint1;

    }

    resetPreview() {

        if (this.point1 && this.point1.isTemporaryUpdated) this.point1.restoreState();
        if (this.point2 && this.point2.isTemporaryUpdated) this.point2.restoreState();
        if (this.hoveredItem) {
            if (this.hoveredItem.isPoint && this.hoveredItem.isTemporaryUpdated) {
                this.hoveredItem.restoreState();
            }
            if (this.hoveredItem.isSegment) {
                if (this.hoveredItem.definition.point1.isTemporaryUpdated) this.hoveredItem.definition.point1.restoreState();
                if (this.hoveredItem.definition.point2.isTemporaryUpdated) this.hoveredItem.definition.point2.restoreState();
            }
        }

    }

    isLine2Free() {

        if (this.hoveredItem) {
            if (this.hoveredItem.isPoint) {

                if (this.hoveredItem.hasItemInDependencyChain(this.point1)) return false;
                if (this.hoveredItem.hasItemInDependencyChain(this.point2)) return false;
            }
            else if (this.hoveredItem.isSegment) {
                const point3 = this.getPonit3OnSegment(this.hoveredItem);
                if (point3.hasItemInDependencyChain(this.point1)) return false;
                if (point3.hasItemInDependencyChain(this.point2)) return false;
            }

        }


        if (this.hoveredItem) {

            if (this.hoveredItem.isPoint) {
                return this.hoveredItem.isFree || this.hoveredItem.isAngleFree;
            }
            else if (this.hoveredItem.isSegment) {
                const point3 = this.getPonit3OnSegment(this.hoveredItem);

                return point3.isFree || point3.isAngleFree;
            }
        }
        else {
            // if (!this.point1.isFree) return false;
            return true;
        }

        return false;

    }

    activate() {

        super.activate();



    }

    deactivate() {

        super.deactivate();


        // if (this.point1 && this.point1.isCreatedPoint) {
        //     this.point1.isCreatedPoint = undefined;
        //     this.point1.delete();
        // }

        // if (this.point2 && this.point2.isCreatedPoint) {
        //     this.point2.isCreatedPoint = undefined;
        //     this.point2.delete();
        // }

        this.ruler.hide();
        this.clearData();

    }

    isInSameDirection(vect1, vect2) {
        return ((vect1.x * vect2.x) + (vect1.y * vect2.y)) >= 0;

    }

    isItemSelectable(item) {

        if (this.point3.active) {
            return false;
        }
        else if (this.point2.active) {

            // if(item.isSegment){
            //     return item.definition.point1Name === this.point1.name || item.definition.point2Name === this.point1.name;
            // }
            // else{
            //     return !item.isPoint
            // }
            return false;
        }
        else {
            return item.isPoint;
        }
    }
}