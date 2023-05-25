import Definition from "../../definitions/abstract/Definition";
import Scene from "../../Scene";
import GraphicItem from "../abstract/GraphicItem";

import { BoxGeometry, Group, Vector2, TorusGeometry, Mesh, MeshBasicMaterial, BufferGeometry, CircleGeometry, PlaneGeometry } from "three"
import Label from "../Label";
import DefLabelStaticPt from "../../definitions/labels/DefLabelStaticPt";
import { markRaw } from "vue";

import * as util from "../../helper/util"

export default class Angle extends GraphicItem {

    /**
     * 
     * @param {Definition} definition 
     */
    constructor(definition, options = {}) {

        super(definition);

        this.text = "";
        this.arcRadius = .5;
        this.labelVisible = true;

        Object.assign(this, options);

        if (this.text === '' || util.isFunction(this.text)) {

            this.isDyanmicLabel = true;

            const lbFunct = this.text;

            if (util.isFunction(this.text)) {
                this.getLabel = () => {
                    return lbFunct(this.angleDegree);
                }
            }
            else {
                this.getLabel = () => {
                    return this.angleDegree + "°";
                }
            }
        }
        else {
            this.isDyanmicLabel = false;
        }

        this.visible = false;

        this.isAngle = true;

        this.lineWidth = 0.06;
        this.halfLineWidth = this.lineWidth / 2;

        this.radialSegments = 8;
        this.tubularSegments = 95;

        this.material = new MeshBasicMaterial({
            color: this.color,
        });

        this.angle = 0;
        this.angleDegree = 0;
        this.isRightAngle = false;

        this.rightAngSymbolLen = .44;
        this.diagonalLength = Math.sqrt((this.rightAngSymbolLen ** 2) * 2);

        this.parentMesh = new Group();

        this.rightAngleGroup = new Group();
        this.nonRightAngle = markRaw(new Mesh(
            new TorusGeometry(.1, .1, 1),
            this.material,
        ));

        this.indicatorMaterial = new MeshBasicMaterial({
            color: 0x033f22,
            transparent: true,
            opacity: .13,
            depthTest: false,
        });

        this.indicatorMeshNonRightAngle = markRaw(new Mesh(new BufferGeometry(), this.indicatorMaterial))
        this.indicatorMeshRightAngle = markRaw(new Mesh(new BufferGeometry(), this.indicatorMaterial))


        this.nonRightAngle.add(this.indicatorMeshNonRightAngle);
        this.rightAngleGroup.add(this.indicatorMeshRightAngle);

        this.indicatorMeshNonRightAngle.visible = this.indicatorMeshRightAngle.visible = false;

        this.parentMesh.add(this.rightAngleGroup);
        this.parentMesh.add(this.nonRightAngle);

        this.rightAngleGroup.visible = false;
        this.nonRightAngle.visible = false;

        this.rightAngleLine1 = markRaw(new Mesh(new BoxGeometry(), this.material));
        this.rightAngleLine2 = markRaw(new Mesh(new BoxGeometry(), this.material));

        this.rightAngleGroup.add(this.rightAngleLine1);
        this.rightAngleGroup.add(this.rightAngleLine2);

        this.pt1 = new Vector2();
        this.pt2 = new Vector2();
        this.pt3 = new Vector2();

        if (!this.name) this.name = "Angle - " + this.getUUID();
        if (!this.desc) this.desc = "Angle";

        this.labelItem = new Label(new DefLabelStaticPt(new Vector2(), 0), {
            hOffset: 0,
            vOffset: 0,
            color: this.color,
            isInteractable: false,
        });
    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        scene.add(this.labelItem);
        super.setContext(scene);

        this.definition.setup(this, scene);
        this.dependeeUpdated();

    }

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     * @param {Vector2} pt3 
     */
    update(pt1, pt2, pt3) {

        this.pt1.copy(pt1);
        this.pt2.copy(pt2);
        this.pt3.copy(pt3);

        this.angle1 = util.getAngle(pt1.x - pt2.x, pt1.y - pt2.y);
        this.angle2 = util.getAngle(pt3.x - pt2.x, pt3.y - pt2.y);

        this.angle = util.getAngleDifference(this.angle1, this.angle2, false);

        this.angleDegree = parseFloat((this.angle * util.RAD_TO_DEG).toFixed(1));

        if (this.angleDegree === 90) {
            this.isRightAngle = true;
        }
        else {
            this.isRightAngle = false;
        }

        this.rightAngleGroup.visible = this.isRightAngle;
        this.nonRightAngle.visible = !this.isRightAngle;

        this.updateSymbolGeometry();

        // this.text = options.text ? options.text : angleDegree + "°";

    }

    updateSymbolGeometry() {

        // label location

        if (this.isRightAngle) {

            this.rightAngleLine1.geometry = new BoxGeometry(this.rightAngSymbolLen + this.lineWidth, this.lineWidth, 0.001).translate(this.rightAngSymbolLen / 2, this.rightAngSymbolLen, 0);
            this.rightAngleLine2.geometry = new BoxGeometry(this.lineWidth, this.rightAngSymbolLen, 0.001).translate(this.rightAngSymbolLen, this.rightAngSymbolLen / 2, 0);

            this.rightAngleGroup.rotation.z = this.angle2;
            this.rightAngleGroup.position.set(this.pt2.x, this.pt2.y, 0.002);

            this.indicatorMeshRightAngle.geometry = new PlaneGeometry(this.rightAngSymbolLen + .1, this.rightAngSymbolLen + .1);
            this.indicatorMeshRightAngle.geometry.translate(.05 + this.rightAngSymbolLen / 2, .05 + this.rightAngSymbolLen / 2, 0);

        }
        else {

            this.nonRightAngle.geometry = new TorusGeometry(this.arcRadius, this.halfLineWidth, 2, parseInt(this.tubularSegments * (this.angle / util.TWO_PI) + 1), this.angle);

            this.nonRightAngle.position.set(this.pt2.x, this.pt2.y, 0.002);
            this.nonRightAngle.rotation.z = this.angle2;

            this.indicatorMeshNonRightAngle.geometry = new CircleGeometry(this.arcRadius + .1, parseInt(this.tubularSegments * (this.angle / util.TWO_PI) + 1), 0, this.angle);

        }

        this.updateLabel();

    }

    onPointerEnter() {

        if (this.isHovered) return;

        this.isHovered = true;

        if (!this.isSelected.value) {
            this.indicatorMeshRightAngle.visible = this.indicatorMeshNonRightAngle.visible = this.labelItem.indicatorMesh.visible = true;
        }

    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;

        if (!this.isSelected.value) {
            this.indicatorMeshRightAngle.visible = this.indicatorMeshNonRightAngle.visible = this.labelItem.indicatorMesh.visible = false;
             
        }
    }

    updateLabel() {

        this.labelItem.setText(this.isDyanmicLabel ? this.getLabel() : this.text);

        const labelAngle = this.angle2 + this.angle / 2;

        const lbDist = this.isRightAngle ? this.diagonalLength : this.arcRadius + .1;

        this.labelItem.definition.update(
            this.pt2.x + Math.cos(labelAngle) * (lbDist + (this.labelItem.halfWidth) + 0.15),
            this.pt2.y + Math.sin(labelAngle) * (lbDist + (this.labelItem.halfHeight) + 0.15), 0
        )
    }

    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if (select) {
            this.indicatorMeshRightAngle.visible = this.indicatorMeshNonRightAngle.visible = this.labelItem.indicatorMesh.visible = true;
        }
        else {
            this.indicatorMeshRightAngle.visible = this.indicatorMeshNonRightAngle.visible = this.labelItem.indicatorMesh.visible = false;
        }
    }

    updateAngle() {

    }

    dependeeUpdated() {
        this.definition.calculateGeoInfo();
        // if (this.isDynamicValue) this.definition.updateLabelValue();
    }

    show() {

        this.parentMesh.visible = true;
        this.visible = true;
        if (this.labelVisible) {

            this.labelItem.show();
        }

    }

    hide() {

        super.hide();

        this.parentMesh.visible = false;
        this.labelItem.hide();

    }

    setText(text) {
        this.text = text;
        this.updateLabel();
    }

    setIsDyanmicLabel(isDyanmicLabel) {

        this.isDyanmicLabel = isDyanmicLabel;
        this.updateLabel();

    }

    setColor(color, isTempUpdate = false){
        
        if (color === undefined) {
            color = this.color;
        }

        if(!isTempUpdate){
            this.color = color;
        }

        this.material.color.set(color);
        this.indicatorMaterial.color.set(color);
        this.labelItem.setColor(color);
        
    }


    isInPath(pt) {

        const angle = util.getAngle(pt.x - this.pt2.x, pt.y - this.pt2.y);
        const angle2 = util.getAngle(this.pt1.x - this.pt2.x, this.pt1.y - this.pt2.y);
        
        this.isInPathInfo.result = this.angle >= util.getAngleDifference(angle, angle2) && util.getDistance(this.pt2, pt) < this.arcRadius + .5;

        return this.isInPathInfo;

    }

    delete() {

        super.delete();
        this.labelItem.delete();

    }
}

Angle.idCounter = 0;
Angle.getNextName = function () {
    // return "Segment-" + Segment.idCounter++;
    return "ထောင့် - " + Angle.idCounter++;
}