import Point from "../geometries/Point";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import Segment from "../geometries/Segment";
import { CylinderGeometry, Mesh, MeshBasicMaterial } from "three";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import ConstructionPoint from "./materials/ConstructionPoint";
import { reactive } from "vue";

import * as util from "../helper/util"

export default class PointConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);
        this.selectableItemsTypes = [Segment];
        this.availableInstruments = [2, 1];

        this.states = reactive({
            inputPanelEnabled: false,
            point1: new ConstructionPoint(),
            isValid: false,
        })

        this.point1 = this.states.point1;
        this.point1.active = true;

        this.preveiwPoint = new Mesh(new CylinderGeometry(Point.DEFAULT_RADIUS, Point.DEFAULT_RADIUS, .016, 20).rotateX(util.PI_BY_2), new MeshBasicMaterial({ color: this.constructionColor }));
        scene.add(this.preveiwPoint).visible = false;

        scene.on("Escape:up", () => {

            if (this.active) {

                if (this.states.inputPanelEnabled) {
                    this.exitInputMode();
                }

                this.clearData();
                this.scene.requestRender();

            }
        })

        this.contextMenuHandler = evt => {

            evt.preventDefault();
            this.enterInputMode();

        }

    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;
        this.preveiwPoint.position.set(this.point1.x, this.point1.y, 0);

        this.inputX.focus();
        this.inputX.select();

        this.preveiwPoint.visible = true;

        this.scene.requestRender();

    }

    exitInputMode() {

        this.states.inputPanelEnabled = false;
        this.preveiwPoint.visible = false;

        this.inputX.blur();
        this.inputY.blur();
    }

    locationInputChanged(e, varName) {

        if(!this.states.inputPanelEnabled) return;

        const value = parseFloat(e.target.value);

        if (isNaN(value)) {
            this.states.isValid = false;
            this.preveiwPoint.visible = false;
        }
        else {
            if (varName === 'x') {
                this.point1.x = value;
            }
            else if (varName === 'y') {
                this.point1.y = value;
            }

            this.preveiwPoint.visible = true;
            this.preveiwPoint.position.set(this.point1.x, this.point1.y, 0);
            this.states.isValid = true;
        }

        this.scene.requestRender();

    }

    locationInputEnterPressed(e, varName) {

        if (e.key !== "Enter" || !this.states.isValid) return;

        this.exitInputMode();
        this.onPointerDown(this.point1);
        this.preveiwPoint.visible = false;
        this.scene.requestRender();

    }

    onPointerDown(e) {

        if (this.states.inputPanelEnabled) {

            this.point1.copy(e);
            this.exitInputMode();
            return;
        }

        if (e.selectedItem) {

            if (e.selectedItem.isSegment) {

                const segment = e.selectedItem;
                const ptOnSegment = util.projectPointOnSegment(e, segment.pt1, segment.pt2)

                const cmd = new CmdCreateGeometry(Point, new DefPointOnSegment(segment.name, util.getDistance(segment.pt1, ptOnSegment) / segment.getLength()), {});
                cmd.execute(this.scene).indicate();
                this.scene.addCommand(cmd);

            }
        }
        else {
            this.scene.getItemByName(this.createAndShowPoint(e, {
                addToScene: true,
            })).indicate();

        }

        this.clearData();
        this.scene.requestRender();


    }

    onPointerMove(e) {

        if (this.states.inputPanelEnabled) return;

        this.hoveredItem = e.hoveredItem;

        if (this.hoveredItem) {

            if (this.hoveredItem.isSegment) {
                const ptOnSegment = util.projectPointOnSegment(e, this.hoveredItem.pt1, this.hoveredItem.pt2)
                e.x = ptOnSegment.x;
                e.y = ptOnSegment.y;
            }

        }
        else {

            // this.previewPoint.position.set(e.x, e.y, 0);
            // this.previewPoint.visible = true;

        }

        this.states.isValid = true;
        this.point1.copy(e);
        this.updateInputDimensionValues();

    }

    setConstructorToolbar(toolbar) {
        this.inputX = toolbar.$refs.inputOriginX;
        this.inputY = toolbar.$refs.inputOriginY;
    }

    updateInputDimensionValues() {

        if (this.states.isValid) {
            this.inputX.value = this.point1.x.toFixed(2);
            this.inputY.value = this.point1.y.toFixed(2);
        }
        else {
            this.inputX.value = "-";
            this.inputY.value = "-";
        }
    }

    isItemSelectable(item) {
        return item.isSegment;
    }

    clearData() {

        this.states.isValid = this.states.inputPanelEnabled = false;
        this.updateInputDimensionValues();

    }

    activate() {

        super.activate();

    }

    deactivate() {

        super.deactivate();
        this.preveiwPoint.visible = false;

    }

}