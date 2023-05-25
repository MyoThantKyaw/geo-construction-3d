import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import Geometry from "../geometries/abstract/Geometry";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import { CylinderGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, TorusGeometry, Vector2 } from "three";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";

import * as util from "../helper/util"
import { reactive } from "vue";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import CmdMovePoint from "../commands/point/CmdMovePoint";
import DefLabelBetween2StaticPoints from "../definitions/labels/DefLabelBetween2StaticPoints";
import Label from "../graphics/Label";

import ConstructionPoint from "../geometryConstructors/materials/ConstructionPoint"

import DefPointOnIntersection from "../definitions/points/DefPointOnIntersection";
import Circle from "../geometries/Circle";
import DefCircleWithCenterAndPointOnBoundary from "../definitions/circles/DefCircleWithCenterAndPointOnBoundary";

export default class CircleWithCenterAndPointOnCircumConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);

        this.states = reactive({
            point1: new ConstructionPoint(),
            point2: new ConstructionPoint(),
            isValid: true,
            radius: 0,
            inputPanelEnabled: false,
        })

        this.point1 = this.states.point1;
        this.point2 = this.states.point2;

        /**
         * @type {Geometry}
         */
        this.hoveredItem = undefined;

        this.material = new MeshLambertMaterial({ color: this.color, emissive: this.color, });

        this.previewCircle = new Mesh(

            new TorusGeometry(1, Geometry.DEFAULT_LINE_WIDTH, 2, 200),
            this.material,

        );
        this.previewCircle.matrixAutoUpdate = false;
        scene.add(this.previewCircle, false).visible = false;


        this.preveiwCenterPoint = new Mesh(new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .016, 20).rotateX(util.PI_BY_2), new MeshBasicMaterial({ color: this.constructionColor }));
        scene.add(this.preveiwCenterPoint).visible = false;

        this.selectableItemsTypes = [Point, Segment];

        this.scene.container.addEventListener("pointerdown", e => {
            this.pressedKeyAtPointerDown = scene.pressedKey;
        })

        this.contextMenuHandler = evt => {

            evt.preventDefault();

            if (this.point2.active && this.isPoint2Free()) {
                this.enterInputMode();
            }
        }

        this.labelLength = new Label(new DefLabelBetween2StaticPoints(new Vector2(), new Vector2()), {
            vAlign: Label.V_ALIGN_TOP,
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
        this.inputRadius = toolbar.$refs.inputRadius;

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
        this.updateCircle();

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

            this.createNewCircle();
        }
        else {

            if (e.selectedItem) {

                if (e.selectedItem.isPoint || e.selectedItem.isIntersectionPt) {

                    this.point1.geometry = e.selectedItem;

                }
                else if (e.selectedItem.isSegment) {

                    const segment = e.selectedItem;
                    const ptOnSegment = util.projectPointOnSegment(e, segment.pt1, segment.pt2)

                    // if (this.point2.active && this.point1.x === ptOnSegment.x && this.point1.y === ptOnSegment.y)
                    //     return;

                    this.point1.copy(ptOnSegment);
                    this.point1.geometry = segment;
                    this.point1.relativePos = util.getDistance(segment.pt1, ptOnSegment) / segment.getLength();

                    this.preveiwCenterPoint.position.set(this.point1.x, this.point1.y, 0);
                    this.preveiwCenterPoint.visible = true;

                }

            }
            else {
                this.point1.copy(e);
                this.preveiwCenterPoint.position.set(e.x, e.y, 0);
                this.preveiwCenterPoint.visible = true;
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
                this.point2.set(e.x, e.y);
            }

            this.updateCircle();

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

        // const angle = this.previewCircle.rotation.z;

        if (this.hoveredItem) {

            if (this.hoveredItem.isPoint) {

                // change definition of point.... to point on circle.

                if (this.hoveredItem.isFree) {

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
            //     name: Point.getNextName(),
            // });

            // this.point2.geometry = cmd.execute(this.scene).name;
            // this.commands.push(cmd);

        }

        this.createNewCircle(true);
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

    createNewCircle() {

        if (this.point1.x === this.point2.x && this.point1.y === this.point2.y) return;

        if (this.point1.geometry) {

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


        if (this.point2.geometry) {

            if (this.point2.geometry.isSegment)
                this.point2.name = this.createAndShowPoint(new DefPointOnSegment(this.point2.geometry.name, this.point2.relativePos));

            else if (this.point2.geometry.isPoint)
                this.point2.name = this.point2.geometry.name;

            else if (this.point2.geometry.isIntersectionPt)
                this.point2.name = this.createAndShowPoint(new DefPointOnIntersection(this.point2.geometry.item1.name, this.point2.geometry.item2.name, this.point2.geometry.ptIndex));

        }
        else if (this.point2.name === undefined) {

            this.point2.name = this.createAndShowPoint(this.point2);
        }

        const cmd = new CmdCreateGeometry(Circle, new DefCircleWithCenterAndPointOnBoundary(this.point1.name, this.point2.name), { });
        cmd.execute(this.scene);
        this.commands.push(cmd);

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

        this.preveiwCenterPoint.visible = this.previewCircle.visible = this.states.inputPanelEnabled =  false;
        
        this.states.isValid = false;

        this.commands.length = 0;

        this.scene.removeHover();

    }


    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    updateCircle() {

        this.states.radius = util.getDistance(this.point1, this.point2);

        this.previewCircle.geometry = new TorusGeometry(this.states.radius, Geometry.DEFAULT_LINE_WIDTH / 2, 2, 100);
        this.previewCircle.position.set(this.point1.x, this.point1.y, 0.006);

        this.previewCircle.updateMatrix();
        this.previewCircle.visible = true;

        // update legnth label
        // if (this.states.inputPanelEnabled) {

        //     if (this.point2.active) {
        //         this.labelLength.definition.update(this.point1, this.point2);

        //         if (!this.labelLength.visible)
        //             this.labelLength.show();
        //     }
        //     else if (this.labelLength.visible) {

        //         this.labelLength.hide();

        //     }
        // }
        // else if (this.labelLength.visible) {

        //     this.labelLength.hide();

        // }

    }

    updateInputDimensionValues() {

        if (this.point2.active)
            this.inputRadius.value = this.states.radius.toFixed(2);
        else
            this.inputRadius.value = "-";
    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        this.inputRadius.focus();
        this.inputRadius.select();

        this.updateCircle();

        this.scene.saveCommandIndex();

        this.scene.requestRender();
    }


    resetPreview() {

        this.scene.restoreCommandIndex();
        this.updateCircle();

    }

    exitInputMode() {
        this.states.inputPanelEnabled = false;
        this.updateCircle();
        this.inputRadius.blur();
    }

    radiusInputChanged(e) {
        
        if(!this.states.inputPanelEnabled) return;

        const inputRadius = parseFloat(e.target.value);

        if (isNaN(inputRadius) || inputRadius === 0) {
            this.states.isValid = false;

        }
        else {
            this.states.isValid = true;
            this.point2.set(this.point1.x + inputRadius, this.point1.y);
            this.updateCircle();
        }

        this.scene.requestRender();

    }

   
    radiusEnterPressHandler(e) {

        if (e.key !== "Enter" || !this.states.isValid) return;
        
        this.exitInputMode();
        this.createNewCircle();

        this.scene.requestRender();
    }

    isPoint2Free() {
        return this.hoveredItem === undefined;
    }

    isItemSelectable(item) {

        // if (item.name === this.point2.geometry || this.states.inputPanelEnabled || this.scene.pressedKey === 'Control') {
        //     return false;
        // }

        return item.isPoint || item.isSegment || item.isIntersectionPt;

    }

}