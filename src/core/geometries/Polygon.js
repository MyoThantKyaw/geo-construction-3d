import { Vector2, Mesh, BoxGeometry, MeshLambertMaterial, MeshBasicMaterial, Shape, PlaneGeometry, ShapeGeometry, ExtrudeGeometry } from "three";

import Geometry from "./abstract/Geometry";
import { markRaw } from "vue";
import DefPolygon from "../definitions/polygons/abstract/DefPolygon";
import Scene from "../Scene";
import Segment from "./Segment";
import CmdMovePoint from "../commands/point/CmdMovePoint";
import * as util from "../helper/util"

import * as classifyPoint from "robust-point-in-polygon"

export default class Polygon extends Geometry {

    /**
     * 
     * @param {DefPolygon} definition 
     * @param {*} options 
     */
    constructor(definition, options = {}) {

        super(definition, options);

        this.lineWidth = Geometry.DEFAULT_LINE_WIDTH;

        Object.assign(this, options);


        /**
         * @type {Array<Vector2}
         */
        this.pts = [];

        this.isPolygon = true;
        this.isShape = true;
        
        this.opacity = .1;

        Object.assign(this, options);

        this.outlineFactorX = 1;
        this.outlineFactorY = 4.2;

        this.defaultOutlineFactorX = this.outlineFactorX;
        this.defaultOutlineFactorY = this.outlineFactorY;

        this.outlineFactorX = 1;
        this.outlineFactorY = 1;

        this.zOffset = 0.005;

        /**
         * @type {Array<Segment>}
         */
        this.segments = [];

        this.material = new MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity
        });

        this.parentMesh = markRaw(new Mesh(new ShapeGeometry(new Shape(), 10), this.material ));
        this.parentMesh.renderOrder = 1000;
        this.parentMesh.position.z = 0.01;

        if(!this.name)  this.name = "Polygon - " + this.getUUID();
        if(!this.desc) this.desc= "Polygon";

        this.prevPts = [];

    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene){

        super.setContext(scene);
        this.segments.length = 0;

        for(let segName of this.definition.segmentNames){
            this.segments.push(scene.getItemByName(segName));
        }
    }

    onDragStart(pt) {

        this.definition.onDragStart(pt);

        for(let i = 0; i < this.definition.points.length; i++){
            this.prevPts[i] = this.definition.points[i].position.clone();
        }
    }

    onDrag(pt) {

        this.definition.onDrag(pt);
    }

    onDragEnd(pt) {

        const cmds = [];

        for(let i = 0; i < this.definition.points.length; i++){

            const point = this.definition.points[i];

            if(point.isFree)  cmds.push(new CmdMovePoint(point.name, point.position, this.prevPts[i]))
            
            cmds[i].execute(this.scene, { alreayExecuted: true });
        }

        this.scene.addCommand(cmds);

    }

    updateGraphics(){

        const shape = new Shape();
        shape.moveTo(this.pts[0][0], this.pts[0][1]);

        for(let i = 1; i < this.pts.length; i++){
            shape.lineTo(this.pts[i][0], this.pts[i][1]);
        }

        this.parentMesh.geometry = new ShapeGeometry(shape)
    }


    onPointerEnter(e){
        for(let seg of this.segments){
            seg.onPointerEnter(e);
        }
    }

    onPointerOut(e){
        for(let seg of this.segments){
            seg.onPointerOut(e);
        }
    }

    setSelection(select){

        super.setSelection(select);

        for(let seg of this.segments){
            seg.setSelection(select);

        }

    }

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    update(pt1, pt2) {

    }

    isInPath(pt) {
        return classifyPoint(this.pts, [pt.x, pt.y]) === -1;
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
        
        // this.parentMesh.material.color.set(color);
        // this.indicatorMesh.material.color.set(color);
    }

    getDataToExport(){

        // return {
        //     className : this.constructor.name,
        //     defClassName : this.definition.constructor.name,
        //     options :{
        //         color : this.color,
        //         lineWidth : this.lineWidth,
        //         name : this.name,
        //     },
            
        //     definitionData : this.definition.getDataToExport(),
        // }
    }

}

Polygon.idCounter = 0;
Polygon.getNextName = function () {
    return "ဗဟုဂံ - " + Polygon.idCounter++;
}
