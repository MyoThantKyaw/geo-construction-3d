import { Vector2, Mesh, MeshBasicMaterial, TorusGeometry, BufferGeometry } from "three";

import Geometry from "./abstract/Geometry";
import { markRaw } from "vue";

import * as util from "../helper/util"

export default class Circle extends Geometry {

    /**
     * 
     * @param {} definition 
     * @param {*} options 
     */
    constructor(definition, options = {}) {

        super(definition, options);

        Object.assign(this, options);

        this.centerPt = new Vector2();
        this.radius = 0;

        this.isCircle = true;
        this.isShape = true;
        this.lineIntersectable = true;
        this.lineWidth = Geometry.DEFAULT_LINE_WIDTH;
        this.opacity = 1;

        this.zOffset = 0.005;


        Object.assign(this, options);

        this.defaultOutlineFactor = 1;
        this.outlineFactor = 3;

        // this.outlineColor = util.getColorWithOpacity(this.color, .28);

        this.material = new MeshBasicMaterial({
            color: this.color
        });

        this.parentMesh = markRaw(new Mesh(

            new TorusGeometry(1, Geometry.DEFAULT_LINE_WIDTH, 2, 200),
            this.material,

        ));

        this.parentMesh.matrixAutoUpdate = false;
        this.parentMesh.visible = false;

        this.indicatorMesh = markRaw(new Mesh(
            new BufferGeometry(),
            new MeshBasicMaterial({ color: this.color, transparent: true, opacity: .2 })
        ));
        this.parentMesh.add(this.indicatorMesh);
        this.indicatorMesh.visible = false;

        this.lineVect = new Vector2();
        this.testVectToTestPt = new Vector2();

        if (!this.name) this.name = "Circle - " + this.getUUID();
        if (!this.desc) this.desc = "Circle";

        this.prevPt1 = new Vector2();
        this.prevPt2 = new Vector2();

    }

    onDragStart(pt) {

    }

    onDrag(pt) {
    }

    onDragEnd(pt) {

    }

    indicate() {

    }

    onPointerEnter() {

        if (this.isHovered) return;

        this.isHovered = true;

        if (!this.isSelected.value) {
            this.indicatorMesh.visible = true;
        }
    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;

        if (!this.isSelected.value){
            this.indicatorMesh.visible = false;
        }
    }

    
    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if (select) {
            this.indicatorMesh.visible = true;
        }
        else {
            this.indicatorMesh.visible = false;

        }

    }

    /**
     * 
     * @param {*} centerPt 
     * @param {*} radius 
     */
    update(centerPt, radius) {


        this.radius = radius;
        this.centerPt.set(centerPt.x, centerPt.y);

        this.parentMesh.geometry = new TorusGeometry(radius, Geometry.DEFAULT_LINE_WIDTH / 2, 2, 100);
        this.parentMesh.position.set(this.centerPt.x, this.centerPt.y, this.zOffset);
        this.parentMesh.updateMatrix();

        this.indicatorMesh.geometry = new TorusGeometry(radius, (Geometry.DEFAULT_LINE_WIDTH * 1.7) + Geometry.DEFAULT_LINE_WIDTH / 2, 2, 100);

    }

    isInPath(pt) {

        // this.lineVect.set(this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y).normalize();

        // this.testVectToTestPt.set(pt.x - this.pt1.x, pt.y - this.pt1.y);

        // const lenProjectedOnLine = this.lineVect.dot(this.testVectToTestPt);

        // this.isInPathInfo.distance = Math.abs((this.lineVect.y * this.testVectToTestPt.x) + (-this.lineVect.x * this.testVectToTestPt.y))
        // this.isInPathInfo.result = lenProjectedOnLine >= 0 && lenProjectedOnLine <= this.getLength() && this.isInPathInfo.distance <= .35;
        // this.isInPathInfo.x = this.pt1.x + this.lineVect.x * lenProjectedOnLine;
        // this.isInPathInfo.y = this.pt1.y + this.lineVect.y * lenProjectedOnLine;

        // return this.isInPathInfo;

        this.isInPathInfo.distance = Math.abs(util.getDistance(this.centerPt, pt) - this.radius)
        this.isInPathInfo.result = this.isInPathInfo.distance < .3;

        return this.isInPathInfo;

    }

    show() {

        this.parentMesh.visible = this.visible = true;
        return this;
    }

    hide() {

        this.parentMesh.visible = this.visible = false;
        return this;
    }

    setColor(color, isTempUpdate = false) {

        if (color === undefined) {
            color = this.color;
        }

        if (!isTempUpdate) {
            this.color = color;
        }

        this.parentMesh.material.color.set(color);
        // this.indicatorMesh.material.color.set(color);
    }


}

Circle.idCounter = 0;
Circle.getNextName = function () {
    return "စက်ဝိုင်း - " + Circle.idCounter++;
}
