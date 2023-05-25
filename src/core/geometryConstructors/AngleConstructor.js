import DefPointFree from "../definitions/points/DefPointFree";
import DefPointWithAngleFromALine from "../definitions/points/DefPointWithAngleFromALine";
import DefPointWithAngleAndLenFromALine from "../definitions/points/DefPointWithAngleAndLenFromALine";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import DefSegment2Points from "../definitions/segments/DefSegment2Points";
import DefAngleThreePoints from "../definitions/symbols/angles/DefAngleThreePoints";
import DefAngleThreeStaticPoints from "../definitions/symbols/angles/DefAngleThreeStaticPoints";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import Angle from "../graphics/symbols/Angle";
import { BoxGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, Vector2 } from "three";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";
// import Label from "../graphics/Label";
import DefLabelBetween2Points from "../definitions/labels/DefLabelBetween2Points";
import DefLabelBetween2StaticPoints from "../definitions/labels/DefLabelBetween2StaticPoints";
import DefPointOnInvisibleCircle from "../definitions/points/DefPointOnInvisibleCircle";
// import Arc from "../geometries/Arc";
import Geometry from "../geometries/abstract/Geometry";

import * as util from "../helper/util"
import { reactive } from "vue";
import ConstructionPoint from "./materials/ConstructionPoint";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";

export default class AngleConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);

        this.states = reactive({
            inputPanelEnabled: false,
            point1: new ConstructionPoint(),
            point2: new ConstructionPoint(),
            point3: new ConstructionPoint(),
            isValid: true,
            inputPanelEnabled: false,
            reversed: true,
        })
        this.point1 = this.states.point1;
        this.point2 = this.states.point2;
        this.point3 = this.states.point3;

        this.name = 'AngleConstructor';

        this.availableInstruments = [4];

        this.contextMenuHandler = evt => {

            evt.preventDefault();
            if (this.isLine2Free()) {
                this.enterInputMode();
            }
        }

        this.protractorRadius = 195;
        this.snapSegmentAngleTolerance = .2;

        this.material = new MeshBasicMaterial({ color: this.color });

        this.preveiwPoint1 = new Mesh

        const geometry = new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .012, 20).rotateX(util.PI_BY_2);
        const material = new MeshBasicMaterial({ color: this.constructionColor });

        this.preveiwPoint1 = new Mesh(geometry, material);
        scene.add(this.preveiwPoint1).visible = false;

        this.preveiwPoint2 = new Mesh(geometry, material);
        scene.add(this.preveiwPoint2).visible = false;

        this.preveiwPoint3 = new Mesh(geometry, material);
        scene.add(this.preveiwPoint3).visible = false;

        this.angleSymbol = new Angle(new DefAngleThreeStaticPoints(
            new Vector2(), new Vector2(), new Vector2(),
        ), {
            color: this.constructionColor
        });

        this.scene.add(this.angleSymbol);

        scene.on("f:up", () => {

            if (this.point3 && !this.states.inputPanelEnabled) {

                this.states.reversed = !this.states.reversed;
                this.updateSegment2();
                scene.requestRender();

            }

        })

        scene.on("Escape:up", () => {
            if(this.active){

                if(this.states.inputPanelEnabled){
                    this.exitInputMode();
                }

                this.clearData();
                this.scene.requestRender();

            }
        })

    }

    setConstructorToolbar(toolbar) {

        this.inputAngle = toolbar.$refs.inputAngle;


    }

    enterPressHandler(e) {

        if (e.key !== "Enter" || !this.states.isValid) return;

        this.exitInputMode();
        this.createAngle();

        this.scene.requestRender();

    }


    onPointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        this.hoveredItem = e.hoveredItem;

        this.checkFreePointerMove(e);

        if (this.point3.active) {
            // 
            if (this.hoveredItem) {

                if (this.hoveredItem.isPoint) {
                    
                    this.point3.set(this.hoveredItem.position.x, this.hoveredItem.position.y)
                }

            }
            else {

                this.point3.copy(e);
            }

            this.updateSegment2();
        }
        else if (this.point2.active) {

            // update segment
            if (this.hoveredItem) {

                if (this.hoveredItem.isPoint) {

                    this.point2.set(this.hoveredItem.position.x, this.hoveredItem.position.y);

                }
                else if (this.hoveredItem.isSegment) {

                    // project point on segment
                    const segment = this.hoveredItem;

                    if (segment.definition.point1.name === this.point1.name) {
                        this.point2.copy(segment.definition.point2.position);
                    }
                    else if (segment.definition.point2.name === this.point1.name) {
                        this.point2.copy(segment.definition.point1.position);
                    }

                }
            }
            else {
                this.point2.copy(e);
            }


        }
        else {
            // 
        }

        this.states.isValid = true;

        // if (this.point2) {
        //     // // snap hover item
        //     // // if hovered item is a point
        //     if (this.scene.ctrlDowned) {
        //         const angle1 = util.getAngle2Pts(this.point2.pos, this.point1.pos);
        //         const angle = angle1 + util.round((util.getAngleDifference(angle1, util.getAngle2Pts(this.point2.pos, this.pointerCoor)) * util.RAD_TO_DEG), 5) * util.DEG_TO_RAD;
        //         const length = util.getDistance(this.point2.pos, this.pointerCoor);
        //         this.pointerCoor.set(
        //             this.point2.pos.x + Math.cos(angle) * length,
        //             this.point2.pos.y + Math.sin(angle) * length,
        //         );
        //         e.x = this.pointerCoor.x;
        //         e.y = this.pointerCoor.y;
        //     }
        //     else if (this.scene.pressedKey !== 'f' && this.hoveredItem && this.hoveredItem.isPoint) {
        //         this.pointerCoor.set(this.hoveredItem.pos.x, this.hoveredItem.pos.y);
        //     }
        //     else if (this.scene.pressedKey !== 'f' && this.hoveredItem && this.hoveredItem.isSegment) {
        //         const segment = this.hoveredItem;
        //         if (segment.definition.point2 === this.point2)
        //             this.pointerCoor.copy(segment.definition.point1.pos);

        //         else if (segment.definition.point1 === this.point2)
        //             this.pointerCoor.copy(segment.definition.point2.pos);

        //         else {
        //             // console.log(("return"));
        //             // return;
        //         }
        //     }

        //     this.isValid = util.getDistance(this.point2.pos, this.pointerCoor) !== 0;
        // }
        // else if (this.point1) {

        //     if (this.hoveredItem && this.hoveredItem.isPoint) {

        //         this.pointerCoor.set(this.hoveredItem.pos.x, this.hoveredItem.pos.y);

        //     }
        //     else if (this.hoveredItem && this.hoveredItem.isSegment) {

        //         const segment = this.hoveredItem;
        //         if (segment.definition.point1 === this.point1) {
        //             this.pointerCoor.copy(segment.definition.point2.pos);
        //         }
        //         else if (segment.definition.point2 === this.point1) {
        //             this.pointerCoor.copy(segment.definition.point1.pos);
        //         }
        //         else {
        //             this.pointerCoor.set(e.x, e.y);
        //         }
        //     }

        //     this.isValid = util.getDistance(this.point1.pos, this.pointerCoor) !== 0;
        // }
        // else {
        //     this.isValid = false;
        // }


    }

    onPointerDown(e) {

        if (this.states.inputPanelEnabled) {

            this.point3.copy(e);
            this.resetPreview();
            this.exitInputMode();
            return;
        }


        if (e.selectedItem) {

            if (e.selectedItem.isPoint) {

                if (this.point3.active) {
                    this.point3.geometry = e.selectedItem;
                    this.point3.copy(e.selectedItem.position);

                    this.createAngle();
                }
                else if (this.point2.active) {
                    this.point2.geometry = e.selectedItem;
                    this.point2.copy(e.selectedItem.position);
                    this.point3.copy(this.point2);
                    this.point3.active = true;
                }
                else {
                    this.point1.geometry = e.selectedItem;
                    this.point1.copy(e.selectedItem.position);
                    this.point2.copy(this.point1);
                    this.point2.active = true;
                }

            }

        }
        else {

            if (this.point3.active) {
                this.point3.copy(e);
                this.createAngle();

            }
            else if (this.point2.active) {

                this.point3.active = true;

                this.point3.copy(e);
                this.point2.copy(e);

                this.preveiwPoint2.position.set(this.point2.x, this.point2.y, 0);
                this.preveiwPoint2.visible = true;

            }
            else {

                this.point2.active = true;
                this.point2.copy(e);
                this.point1.copy(e);

                this.preveiwPoint1.position.set(this.point1.x, this.point1.y, 0);
                this.preveiwPoint1.visible = true;


            }
        }


    }


    updateSegment2() {

        if (this.states.reversed) {
            this.angleSymbol.definition.update(this.point3, this.point2, this.point1);
        }
        else {
            this.angleSymbol.definition.update(this.point1, this.point2, this.point3);
        }

        if (!this.angleSymbol.visible) {
            this.angleSymbol.show();
        }

        
        this.updateInputDimensionValues();

        // update angle..


    }

    angleInputChanged(e) {
        
        if(!this.states.inputPanelEnabled) return;

        const inputAngle = parseFloat(e.target.value);

        if (isNaN(inputAngle) || inputAngle === 0) {
            this.states.isValid = false;
        }
        else {
            this.states.isValid = true;
            this.showAnglePreview(inputAngle * util.DEG_TO_RAD);
        }

        this.scene.requestRender();

    }

    showAnglePreview(angle) {

        // update point 3

        const segment2Length = util.getDistance(this.point2, this.point3);
        const baseLineVector = new Vector2(this.point1.x - this.point2.x, this.point1.y - this.point2.y);

        if (this.states.reversed) {
            baseLineVector.rotateAround(new Vector2(0, 0), angle);

        }
        else {
            baseLineVector.rotateAround(new Vector2(0, 0), -angle);
        }

        baseLineVector.setLength(segment2Length);
        this.point3.set(this.point2.x + baseLineVector.x, this.point2.y + baseLineVector.y);
        this.preveiwPoint3.position.set(this.point3.x, this.point3.y, 0);

        this.updateSegment2();

    }

    createAngle() {

        if (this.point1.geometry) {
            this.point1.name = this.point1.geometry.name;
        }
        else {
            this.point1.name = this.createAndShowPoint(this.point1);
        }


        if (this.point2.geometry) {
            this.point2.name = this.point2.geometry.name;
        }
        else {
            this.point2.name = this.createAndShowPoint(this.point2);
        }

        if (this.point3.geometry) {
            this.point3.name = this.point3.geometry.name;
        }
        else {

            let def = new DefPointWithAngleFromALine(
                this.point1.name,
                this.point2.name,
                util.getAngleDifference(util.getAngle2Pts(this.point2, this.point1), util.getAngle2Pts(this.point2, this.point3)),
                util.getDistance(this.point2, this.point3),
                true);

            this.point3.name = this.createAndShowPoint(def);

        }

        const cmdCreateAngle = new CmdCreateGeometry(
            Angle, new DefAngleThreePoints(this.point3.name, this.point2.name, this.point1.name, !this.states.reversed || (this.activeInstrument && this.activeInstrument.snappedSide === 'l')), {

        })
        cmdCreateAngle.execute(this.scene);
        this.commands.push(cmdCreateAngle);


        this.scene.addCommand(this.commands);

        this.commands.forEach(cmd => {
            if (cmd.geo && cmd.geo.isPoint) {
                cmd.geo.setColor(Geometry.DEFAULT_COLOR);
            }
        });

        this.clearData();

    }

    createLengthLabelBetween2Points(point1, point2) {

        const label = new Label(new DefLabelBetween2Points(point1, point2), {
            vAlign: Label.V_ALIGN_TOP
        });
        return this.scene.add(label).show();
    }


    snapAngleOfSegment(angle) {

        if (angle <= this.snapSegmentAngleTolerance || Math.abs(angle - util.TWO_PI) <= this.snapSegmentAngleTolerance) angle = 0;
        else if (Math.abs(angle - util.PI_BY_2) <= this.snapSegmentAngleTolerance) angle = util.PI_BY_2;
        else if (Math.abs(angle - Math.PI) <= this.snapSegmentAngleTolerance) angle = Math.PI;
        else if (Math.abs(angle - util.THREE_PI_BY_2) <= this.snapSegmentAngleTolerance) angle = util.THREE_PI_BY_2;

        return angle;
    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        this.inputAngle.focus();
        this.inputAngle.select();

        this.preveiwPoint3.position.set(this.point3.x, this.point3.y, 0);
        this.preveiwPoint3.visible = true;

        this.updateSegment2();

        this.scene.saveCommandIndex();

        this.scene.requestRender();

    }

    exitInputMode() {

        this.preveiwPoint3.visible = false;
        this.states.inputPanelEnabled = false;
        this.updateSegment2();
        this.inputAngle.blur();

    }

    resetPreview() {
        this.scene.restoreCommandIndex();
        this.updateSegment2();

    }


    clearData() {

        this.point2.active = this.point3.active = false;
        this.point1.name = this.point2.name = this.point3.name = undefined;
        this.point1.geometry = this.point2.geometry = this.point3.geometry = undefined;

        this.point1.active = true;
        this.states.isValid = false;
        this.states.reversed = true;

        this.angleSymbol.hide();

        this.commands.length = 0;

        this.states.inputPanelEnabled = false;

        this.preveiwPoint1.visible = this.preveiwPoint2.visible = this.preveiwPoint3.visible = false;

        this.updateInputDimensionValues();
        // this.scene.unfreeze();
        this.scene.removeHover();

    }


    calculateAngleInDeg(pt1, pt2, pt3) {

        const angleArm1 = util.getAngle2Pts(pt2, pt1);
        let angleArm2 = util.getAngle2Pts(pt2, pt3);

        if (angleArm2 < this.angleArm1) {
            angleArm2 += util.TWO_PI;
        }

        let angleDeg = parseFloat((util.getAngleDifference(angleArm1, angleArm2) * util.RAD_TO_DEG).toFixed(2));

        if (angleDeg === 360) {
            angleDeg = 0;
        }

        return angleDeg;

    }

    updateInputDimensionValues() {

        if (this.point3.active) {
            this.inputAngle.value = this.angleSymbol.angleDegree;
        }
        else if (this.point2.active) {
            this.inputAngle.value = "-";
        }
        else {
            this.inputAngle.value = "-";
        }

    }

    getPonit3OnSegment(segment) {

        const segPoint1 = segment.definition.point1;
        const segPoint2 = segment.definition.point2;

        return segPoint1 === this.point2 ? segPoint2 : segPoint1;

    }

    resetPreview() {


    }

    isLine2Free() {

        if(this.hoveredItem){
             return false;
        }

        if (this.point3.active) {

            if (this.hoveredItem) {
                return this.hoveredItem.isFree;
            }
            else {
                return true;
            }

        }

        // if (this.hoveredItem) {

        //     if (this.hoveredItem.isPoint) {

        //         // if(this.hoveredItem.isAngleFree || this.point1.isAngleFree) return true

        //         if (this.hoveredItem.hasItemInDependencyChain(this.point1)) return false;
        //         if (this.hoveredItem.hasItemInDependencyChain(this.point2)) return false;
        //     }
        //     else if (this.hoveredItem.isSegment) {
        //         const point3 = this.getPonit3OnSegment(this.hoveredItem);
        //         if (point3.hasItemInDependencyChain(this.point1)) return false;
        //         if (point3.hasItemInDependencyChain(this.point2)) return false;
        //     }
        // }

        // if (this.hoveredItem) {

        //     if (this.hoveredItem.isPoint) {
        //         return this.hoveredItem.isFree || this.hoveredItem.isAngleFree;
        //     }
        //     else if (this.hoveredItem.isSegment) {
        //         const point3 = this.getPonit3OnSegment(this.hoveredItem);
        //         return point3.isFree || point3.isAngleFree;
        //     }
        // }
        // else {
        //     // if (!this.point1.isFree) return false;
        //     return true;
        // }

        return false;

    }

    activate() {

        super.activate();

    }

    deactivate() {

        super.deactivate();


    }

    isItemSelectable(item) {

        return item.isPoint;

        // if (this.point1 && this.point2) {
        //     return (item.constructor === Point && !(item === this.point1 || item === this.point2)) || (item.constructor === Segment && (item.definition.point1 === this.point2 || item.definition.point2 === this.point2)
        //         && !((item.definition.point1 === this.point1 && item.definition.point2 === this.point2) || (item.definition.point1 === this.point2 && item.definition.point2 === this.point1)));
        // }
        // else if (this.point1) {
        //     return item.constructor === Point;
        // }
        // else {
        //     return item.constructor === Point || item.constructor === Segment || item.constructor === Arc;
        // }
    }

}