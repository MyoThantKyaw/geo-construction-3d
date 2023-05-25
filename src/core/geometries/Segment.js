import { Vector2, Mesh, BoxGeometry, MeshLambertMaterial, MeshBasicMaterial } from "three";

import Geometry from "./abstract/Geometry";
import DefSegment from "../definitions/segments/abstract/DefSegment";
import CmdMoveSegment from "../commands/segment/CmdMoveSegment";
import { markRaw } from "vue";
import * as util from "../helper/util"

export default class Segment extends Geometry {

    /**
     * 
     * @param {DefSegment} definition 
     * @param {*} options 
     */
    constructor(definition, options = {}) {

        super(definition, options);

        this.lineWidth = Geometry.DEFAULT_LINE_WIDTH;

        Object.assign(this, options);

        this.pt1 = new Vector2();
        this.pt2 = new Vector2();

        this.isSegment = true;
        this.isLine = true;
        this.isStraightLine = true;
        this.lineIntersectable = true;
        
        this.opacity = 1;

        Object.assign(this, options);

        this.outlineFactorX = 1;
        this.outlineFactorY = 4.2;

        this.defaultOutlineFactorX = this.outlineFactorX;
        this.defaultOutlineFactorY = this.outlineFactorY;

        this.outlineFactorX = 1;
        this.outlineFactorY = 1;

        this.zOffset = 0.005;

        // this.outlineColor = util.getColorWithOpacity(this.color, .28);

        this.material = new MeshBasicMaterial({

            color: this.color,
            // transparent: true,
            // opacity: this.opacity,

        });

        this.parentMesh = markRaw(new Mesh(
            new BoxGeometry(1, this.lineWidth, 0.012),
            this.material
        ));
        this.parentMesh.matrixAutoUpdate = false;

        this.indicatorMesh = markRaw(new Mesh(
            this.parentMesh.geometry.clone(),
            new MeshLambertMaterial({ color: this.color, transparent: true, opacity: .2 })
        ));
        this.indicatorMesh.geometry.translate(0, 0, -0.002);
        this.parentMesh.add(this.indicatorMesh);

        this.lineVect = new Vector2();
        this.testVectToTestPt = new Vector2();

        if(!this.name)  this.name = "Segment - " + this.getUUID();
        if(!this.desc) this.desc= "Segment";

        this.prevPt1 = new Vector2();
        this.prevPt2 = new Vector2();

        // setTimeout(() => {
        //     console.log(this.isValid);

        //     setTimeout(() => {
        //         console.log(this.isValid.value = false);
        //     }, 4000);
        // }, 3000);

    }

    onDragStart(pt) {


        this.definition.onDragStart(pt);

        this.prevPt1.copy(this.pt1);
        this.prevPt2.copy(this.pt2);
    }

    onDrag(pt) {

        // console.log("onDrag ", this.isValid);

        if (this.definition.isFree)
            this.definition.onDrag(pt);

    }

    onDragEnd(pt) {

        const cmd = new CmdMoveSegment(
            this.name,
            this.definition.point1Name,
            this.definition.point2Name,
            this.pt1,
            this.pt2,
            this.prevPt1,
            this.prevPt2,
        )

        cmd.execute(this.scene, { alreayExecuted: true });
        this.scene.addCommand(cmd);
        

    }

    indicate() {

    }

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    update(pt1, pt2) {

        this.pt1.copy(pt1);
        this.pt2.copy(pt2);

        this.parentMesh.scale.x = util.getDistance(this.pt1, this.pt2);
        this.parentMesh.rotation.z = Math.atan2(this.pt2.y - this.pt1.y, this.pt2.x - this.pt1.x);
        this.parentMesh.position.set(this.pt1.x + Math.cos(this.parentMesh.rotation.z) * (this.parentMesh.scale.x / 2), this.pt1.y + Math.sin(this.parentMesh.rotation.z) * (this.parentMesh.scale.x / 2), 0);

        this.parentMesh.updateMatrix();

        
    }

    isInPath(pt) {

        this.lineVect.set(this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y).normalize();

        this.testVectToTestPt.set(pt.x - this.pt1.x, pt.y - this.pt1.y);

        const lenProjectedOnLine = this.lineVect.dot(this.testVectToTestPt);

        this.isInPathInfo.distance = Math.abs((this.lineVect.y * this.testVectToTestPt.x) + (-this.lineVect.x * this.testVectToTestPt.y))
        this.isInPathInfo.result = lenProjectedOnLine >= 0 && lenProjectedOnLine <= this.getLength() && this.isInPathInfo.distance <= .35;
        this.isInPathInfo.x = this.pt1.x + this.lineVect.x * lenProjectedOnLine;
        this.isInPathInfo.y = this.pt1.y + this.lineVect.y * lenProjectedOnLine;

        return this.isInPathInfo;

    }

    show() {

        super.show()

        this.parentMesh.visible = this.visible = true;
        return this;
    }

    hide() {

        super.hide();

        this.parentMesh.visible = false;
        return this;
    }

    setColor(color, isTempUpdate = false){

        if (color === undefined) {
            color = this.color;
        }

        if(!isTempUpdate){
            this.color = color;
        }

        this.parentMesh.material.color.set(color);
        this.indicatorMesh.material.color.set(color);

    }

    getAngle() {
        return util.getAngle2Pts(this.pt1, this.pt2);
    }

    getLength() {
        return Math.sqrt(((this.pt2.x - this.pt1.x) ** 2) + ((this.pt2.y - this.pt1.y) ** 2));
    }

    getVector() {
        return new Vector2(this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y);
    }

    getVector_(vectOut) {
        vectOut.x = this.pt2.x - this.pt1.x;
        vectOut.y = this.pt2.y - this.pt1.y;
    }

    setLineWidth(lineWidth){

        this.lineWidth = lineWidth;
        this.parentMesh.geometry = new BoxGeometry(1, this.lineWidth, 0.012);
        this.update(this.pt1, this.pt2);

        this.indicatorMesh.geometry = this.parentMesh.geometry.clone();
        this.indicatorMesh.geometry.translate(0, 0, -0.002);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            defClassName : this.definition.constructor.name,
            options :{
                color : this.color,
                lineWidth : this.lineWidth,
                name : this.name,
            },
            
            definitionData : this.definition.getDataToExport(),
        }
    }
}

