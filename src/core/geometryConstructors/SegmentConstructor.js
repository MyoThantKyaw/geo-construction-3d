import DefPointOnInvisibleCircle from "../definitions/points/DefPointOnInvisibleCircle";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import DefSegment2Points from "../definitions/segments/DefSegment2Points";
import Geometry from "../geometries/abstract/Geometry";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import { BoxGeometry, Mesh, MeshLambertMaterial, Vector2 } from "three";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";

import * as util from "../helper/util"
import { reactive } from "vue";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import CmdMovePoint from "../commands/point/CmdMovePoint";
import CmdChangeDefOfFreePointToOtherDef from "../commands/point/CmdChangeDefOfFreePointToOtherDef";
import DefLabelBetween2StaticPoints from "../definitions/labels/DefLabelBetween2StaticPoints";
import Label from "../graphics/Label";

import ConstructionPoint from "../geometryConstructors/materials/ConstructionPoint"
import DefLabelBetween2Points from "../definitions/labels/DefLabelBetween2Points";

import DefPointOnIntersection from "../definitions/points/DefPointOnIntersection";

export default class SegmentConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);

        this.states = reactive({
            length: 0,
            point1: new ConstructionPoint(),
            point2: new ConstructionPoint(),
            isValid: true,
            inputPanelEnabled: false,
        })

        this.point1 = this.states.point1;
        this.point2 = this.states.point2;

        /**
         * @type {Geometry}
         */
        this.hoveredItem = undefined;

        this.snapAngleTolerance = .2;

        this.inLengthSnapMode = false;
        this.inAngleSnapMode = false;
        this.inFixedLengthMode = false;

        this.lineMaterial = new MeshLambertMaterial({ color: this.color, emissive: this.color, });

        this.previewSegment = new Mesh(
            new BoxGeometry(1, 0.06, 0.013),
            this.lineMaterial
        );
        this.previewSegment.matrixAutoUpdate = false;
        scene.add(this.previewSegment, false).visible = false;

        this.selectableItemsTypes = [Point, Segment];

        this.scene.container.addEventListener("pointerdown", e => {
            this.pressedKeyAtPointerDown = scene.pressedKey;
        })

        this.contextMenuHandler = evt => {

            evt.preventDefault();

            if (this.point2.active && this.isOnePointFree() && !this.scene.cameraControlEnabled && this.scene.pressedKey !== ' ' && this.pressedKeyAtPointerDown !== ' ') {
                this.enterInputMode();
            }
        }

        this.labelLength = new Label(new DefLabelBetween2StaticPoints(new Vector2(), new Vector2()), {
            vAlign: Label.V_ALIGN_TOP,
            color : this.constructionColor,
        })
        this.scene.add(this.labelLength);

        this.scene.on("f:down", () => {
            this.inFixedLengthMode = !this.inFixedLengthMode;
        })

        this.scene.on("shift:down", () => {
            this.inLengthSnapMode = !this.inLengthSnapMode;
        })

        this.scene.on("control:down", () => {
            this.inAngleSnapMode = !this.inAngleSnapMode;
        })



    }

    setConstructorToolbar(toolbar) {

        super.setConstructorToolbar(toolbar);

        this.toolbar = toolbar;
        this.inputLength = toolbar.$refs.inputLength;

    }

    /**
    * 
    * @param {Point} startPoint 
    */
    showPreviewLineWithLength(startPoint, length) {

        const vect = new Vector2(
            this.point2.x - this.point1.x,
            this.point2.y - this.point1.y,
        ).setLength(length);

        if (this.hoveredItem && (this.hoveredItem.isPoint || this.hoveredItem.isIntersectionPt)) {

            if (this.hoveredItem.isFree) {

                const cmd = new CmdMovePoint(this.hoveredItem.name,
                    new Vector2(
                        this.point1.x + vect.x,
                        this.point1.y + vect.y,
                    ),
                    this.hoveredItem.position,
                );

                cmd.execute(this.scene);
                this.scene.addCommand(cmd);

            }
            else {

                this.point1.set(
                    this.point2.x - vect.x,
                    this.point2.y - vect.y,
                )
            }

        }
        else {

            this.point2.copy(
                vect.add(this.point1)
            );
        }

        // this.updateLengthLabel();
        this.updateSegment();

    }

    onPointerDown(e) {

        if (this.states.inputPanelEnabled) {

            this.point2.copy(e);
            this.resetPreview();
            this.exitInputMode();
            return;

        }

        if (this.point2.active) {

            if (e.selectedItem) {

                if (e.selectedItem.isPoint || e.selectedItem.isIntersectionPt) {
                    this.point2.geometry = e.selectedItem;

                }
                if (e.selectedItem.isSegment) {

                    const segment = e.selectedItem;
                    const ptOnSegment = util.projectPointOnSegment(e, segment.pt1, segment.pt2)

                    if (this.point2.active && this.point1.x === ptOnSegment.x && this.point1.y === ptOnSegment.y)
                        return;

                    this.point2.geometry = segment;
                    this.point2.relativePos = util.getDistance(segment.pt1, ptOnSegment) / segment.getLength();
                    this.point2.copy(ptOnSegment);

                }
            }
            else {
                if (this.point1.x === e.x && this.point1.y === e.y) { return; }
                this.point2.copy(e);
            }

            this.createNewSegment();
        }
        else {

            if (e.selectedItem) {

                if (e.selectedItem.isPoint || e.selectedItem.isIntersectionPt) {

                    this.point1.geometry = e.selectedItem;

                }
                if (e.selectedItem.isSegment) {

                    const segment = e.selectedItem;
                    const ptOnSegment = util.projectPointOnSegment(e, segment.pt1, segment.pt2)

                    // if (this.point2.active && this.point1.x === ptOnSegment.x && this.point1.y === ptOnSegment.y)
                    //     return;

                    this.point1.copy(ptOnSegment);
                    this.point1.geometry = segment;
                    this.point1.relativePos = util.getDistance(segment.pt1, ptOnSegment) / segment.getLength();

                }

            }
            else {
                this.point1.copy(e);
            }

            this.point2.active = true;
            this.point2.copy(this.point1);


        }

        this.updateInputDimensionValues()

    }

    onPointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        this.hoveredItem = e.hoveredItem;

        this.checkFreePointerMove(e);

        this.states.isValid = true;

        if (this.point2.active) {

            if (this.hoveredItem) {

                if (this.hoveredItem.isPoint || this.hoveredItem.isIntersectionPt) {

                    this.point2.set(this.hoveredItem.position.x, this.hoveredItem.position.y);

                }
                else if (this.hoveredItem.isSegment) {

                    const ptOnLine = util.projectPointOnSegment(e, this.hoveredItem.pt1, this.hoveredItem.pt2);
                    this.point2.set(ptOnLine.x, ptOnLine.y);


                }
            }
            else {

                if (this.scene.pressedKey === 'Control') {

                    this.tempVect.set(e.x - this.point1.x, e.y - this.point1.y);

                    const angle = this.snapAngle(util.getAngle(this.tempVect.x, this.tempVect.y));
                    this.point2.set(this.point1.x + Math.cos(angle) * this.tempVect.length(), this.point1.y + Math.sin(angle) * this.tempVect.length());

                }
                else {
                    this.point2.set(e.x, e.y);
                }

            }

            this.updateSegment();

        }
        else {

            if (this.hoveredItem) {

                if (this.hoveredItem.isPoint || this.hoveredItem.isIntersectionPt) {

                    this.point1.set(this.hoveredItem.position.x, this.hoveredItem.position.y);


                }
                else if (this.hoveredItem.isSegment) {

                    const ptOnLine = util.projectPointOnSegment(e, this.hoveredItem.pt1, this.hoveredItem.pt2);
                    this.point1.set(ptOnLine.x, ptOnLine.y)


                }
            }
            else {
                this.point1.set(e.x, e.y);
            }

        }


        this.updateInputDimensionValues();

    }

    enterPressHandler(e) {

        const length = parseFloat(e.target.value);

        if (!(e.key === "Enter" && this.states.isValid) || length === 0) return;

        const angle = this.previewSegment.rotation.z;

        if (this.hoveredItem) {

            if (this.hoveredItem.isPoint) {

                // change definition of point.... to point on circle.

                if (this.hoveredItem.isFree) {
                    // move hovered item

                    this.toChangeHoveredPointDef = true;
                    this.point2.copy(this.hoveredItem.position);

                }
                else {
                    this.point2.geometry = this.hoveredItem;
                    this.toChangePoint1DefToFixedLength = true;
                }

            }
            else if (this.hoveredItem.isIntersectionPt) {
                this.point2.geometry = this.hoveredItem;
                this.toChangePoint1DefToFixedLength = true;
            }
        }
        else {

            // const cmd = new CmdCreateGeometry(Point, def, {
            // });

            // this.point2.geometry = cmd.execute(this.scene).name;
            // this.commands.push(cmd);

        }

        this.createNewSegment(true);
        this.exitInputMode();

    }


    getPt2OfLength(length) {

        let point2;

        const vect = new Vector2(
            this.pointerCoor.x - this.point1.pos.x,
            this.pointerCoor.y - this.point1.pos.y,
        )
        vect.setLength(length);

        point2 = {
            x: this.point1.pos.x + vect.x,
            y: this.point1.pos.y + vect.y
        };

        return point2;

    }


    updateLengthLabel() {

        // this.labelLength.definition.update(
        //     this.point1.pos, this.pointerCoor
        // )
        // this.labelLength.setContent(parseFloat(util.getDistance(this.point1.pos, this.pointerCoor).toFixed(2)) + "")

    }

    snapAngle(angle) {

        if (angle <= this.snapAngleTolerance || Math.abs(angle - util.TWO_PI) <= this.snapAngleTolerance) angle = 0;
        else if (Math.abs(angle - util.PI_BY_2) <= this.snapAngleTolerance) angle = util.PI_BY_2;
        else if (Math.abs(angle - Math.PI) <= this.snapAngleTolerance) angle = Math.PI;
        else if (Math.abs(angle - util.THREE_PI_BY_2) <= this.snapAngleTolerance) angle = util.THREE_PI_BY_2;

        return angle;
    }

    createNewSegment(fixedLen) {

        if (this.point1.x === this.point2.x && this.point1.y === this.point2.y) return;

        if (this.toChangePoint1DefToFixedLength) {

        }
        else if (this.point1.geometry) {

            if (this.point1.geometry.isSegment)
                this.point1.name = this.createAndShowPoint(new DefPointOnSegment(this.point1.geometry.name, this.point1.relativePos));

            else if (this.point1.geometry.isPoint)
                this.point1.name = this.point1.geometry.name;

            else if (this.point1.geometry.isIntersectionPt)
                this.point1.name = this.createAndShowPoint(new DefPointOnIntersection(this.point1.geometry.item1.name, this.point1.geometry.item2.name, this.point1.geometry.ptIndex));

        }
        else if (this.point1.name === undefined) {
            this.point1.name = this.createAndShowPoint(this.point1);
        }


        if (this.toChangeHoveredPointDef) {

            const cmd = new CmdChangeDefOfFreePointToOtherDef(this.hoveredItem.name,
                this.hoveredItem.position, DefPointOnInvisibleCircle,
                this.point1.name, util.getDistance(this.point1, this.point2), util.getAngle2Pts(this.point1, this.point2));

            this.point2.name = this.hoveredItem.name;

            cmd.execute(this.scene);
            this.commands.push(cmd);
        }

        else if (this.point2.geometry) {

            if (this.point2.geometry.isSegment)
                this.point2.name = this.createAndShowPoint(new DefPointOnSegment(this.point2.geometry.name, this.point2.relativePos));

            else if (this.point2.geometry.isPoint)
                this.point2.name = this.point2.geometry.name;

            else if (this.point2.geometry.isIntersectionPt)
                this.point2.name = this.createAndShowPoint(new DefPointOnIntersection(this.point2.geometry.item1.name, this.point2.geometry.item2.name, this.point2.geometry.ptIndex));

        }
        else if (fixedLen) {

            this.point2.name = this.createAndShowPoint(new DefPointOnInvisibleCircle(this.point1.name, util.getDistance(this.point1, this.point2), util.getAngle2Pts(this.point1, this.point2)));

        }
        else if (this.point2.name === undefined) {

            this.point2.name = this.createAndShowPoint(this.point2);
        }

        if (this.toChangePoint1DefToFixedLength) {
            console.log(this.point2.name, util.getDistance(this.point1, this.point2), util.getAngle2Pts(this.point1, this.point2));
            this.point1.name = this.createAndShowPoint(new DefPointOnInvisibleCircle(this.point2.name, util.getDistance(this.point1, this.point2), util.getAngle2Pts(this.point2, this.point1)));
        }

        if (fixedLen) {

            const cmd = new CmdCreateGeometry(
                Label, new DefLabelBetween2Points(this.point1.name, this.point2.name), {
                vAlign: Label.V_ALIGN_TOP
            });
            cmd.execute(this.scene);
            this.commands.push(cmd);

        }

        const cmdSegment = new CmdCreateGeometry(Segment, new DefSegment2Points(this.point1.name, this.point2.name), { 
         });
        const segment = cmdSegment.execute(this.scene);
        this.commands.push(cmdSegment);

        this.commands.forEach(cmd => {
            if (cmd.geo && cmd.geo.isPoint) {
                cmd.geo.setColor(Geometry.DEFAULT_COLOR);
            }
        });

        this.scene.addCommand(this.commands);
        this.clearData();
        this.updateInputDimensionValues();

        this.scene.requestRender();

    }

    activate() {

        super.activate();

        this.point1.active = true;

    }

    deactivate() {

        super.deactivate();


    }

    clearData() {

        this.point1.name = this.point2.name = this.point1.geometry = this.point2.geometry = undefined;

        this.point1.active = true;
        this.point2.active = false;

        this.point1.set(0, 0);
        this.point2.set(0, 0);

        this.previewSegment.visible = false;
        this.toChangePoint1DefToFixedLength = this.toChangeHoveredPointDef = false;

        this.inAngleSnapMode = this.inLengthSnapMode = this.states.inputPanelEnabled = this.states.isValid = false;

        this.labelLength.hide();
        this.commands.length = 0;

        this.scene.removeHover();

    }


    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    updateSegment() {

        this.previewSegment.scale.x = util.getDistance(this.point1, this.point2);
        this.previewSegment.rotation.z = Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
        this.previewSegment.position.set(this.point1.x + Math.cos(this.previewSegment.rotation.z) * (this.previewSegment.scale.x / 2), this.point1.y + Math.sin(this.previewSegment.rotation.z) * (this.previewSegment.scale.x / 2), 0);

        this.previewSegment.updateMatrix();
        this.previewSegment.visible = true;

        // update legnth label

        if (this.states.inputPanelEnabled) {

            if (this.point2.active) {
                this.labelLength.definition.update(this.point1, this.point2);

                if (!this.labelLength.visible)
                    this.labelLength.show();
            }
            else if (this.labelLength.visible) {

                this.labelLength.hide();

            }
        }
        else if (this.labelLength.visible) {

            this.labelLength.hide();

        }

    }

    updateInputDimensionValues() {

        if (this.point1.active && this.point2.active) {
            this.inputLength.value = parseFloat(util.getDistance(this.point1, this.point2).toFixed(2));
        }
        else {
            this.inputLength.value = "-";

        }
    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        this.inputLength.focus();
        this.inputLength.select();

        this.updateSegment();

        this.scene.saveCommandIndex();

        this.scene.requestRender();
    }

    resetPreview() {

        this.scene.restoreCommandIndex();
        this.updateSegment();

    }

    exitInputMode() {
        this.states.inputPanelEnabled = false;
        this.updateSegment();
        this.inputLength.blur();
    }

    isOnePointFree() {      

        if (this.hoveredItem) {
            if (this.hoveredItem.isIntersectionPt) {
                return (!this.point1.geometry || this.point1.geometry.isFree)
            }

            if (!this.hoveredItem.isPoint) {
                return false;
            }
        }

        return (this.point2.active && this.point1.geometry === undefined) || (this.point1.active && this.point1.geometry && this.point1.geometry.isFree) || !this.hoveredItem || this.hoveredItem.isFree;
    }

    isItemSelectable(item) {

        if (item.name === this.point2.geometry || this.states.inputPanelEnabled || this.scene.pressedKey === 'Control') {
            return false;
        }

        return item.isPoint || item.isSegment || item.isIntersectionPt;

    }

    lengthInputChanged(e) {

        
        if(!this.states.inputPanelEnabled) return;

        const inputLength = parseFloat(e.target.value);

        if (isNaN(inputLength) || inputLength === 0) {
            this.states.isValid = false;

        }
        else {
            this.states.isValid = true;
            this.showPreviewLineWithLength(this.point1, inputLength);
        }

        this.scene.requestRender();

    }

    snappedToOriginPoint() {


    }

    snappedToAnglePoint() {



    }

    isPtInSegmentPath(pt, pt1, pt2, tolerance = .01) {


        const lineVect = new Vector2(pt2.x - pt1.x, pt2.y - pt1.y).normalize();

        const testVectToTestPt = new Vector2(pt.x - pt1.x, pt.y - pt1.y);

        const lenProjectedOnLine = lineVect.dot(testVectToTestPt);

        const dist = Math.abs((lineVect.y * testVectToTestPt.x) + (-lineVect.x * testVectToTestPt.y))


        return lenProjectedOnLine >= 0 && lenProjectedOnLine <= util.getDistance(pt1, pt2) && dist <= tolerance;

    }

}