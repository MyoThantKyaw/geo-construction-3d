
import Geometry from "../../geometries/abstract/Geometry";
import Point from "../../geometries/Point";
import { Vector2 } from "three";
import Definition from "../abstract/Definition";

import * as util from "../../helper/util"
import { Point as FlattenPoint, Vector as FlattenVector, Circle as FlattenCircle, Line as FlattenLine, Segment as FlattenSegment, Arc as FlattenArc, } from '@flatten-js/core';
import Arc from "../../geometries/Arc";
import Segment from "../../geometries/Segment";
import Scene from "../../Scene";
import DefPoint from "./abstract/DefPoint";

export default class DefPointOnIntersection extends DefPoint {

    /**
     * 
     * @param {String} itemToIntersect1Name 
     * @param {String} itemToIntersect2Name
     */
    constructor(itemToIntersect1Name, itemToIntersect2Name, intersectPointIndex = 0) {

        super();

        
        this.itemToIntersect1Name = itemToIntersect1Name;
        this.itemToIntersect2Name = itemToIntersect2Name;
        this.intersectPointIndex = intersectPointIndex;

        this.isFixed = true;

        this.intersectFun = () => { }

    }

    /**
     * 
     * @param {Point} item 
     * @param {Scene} scene 
     */
    setup(item, scene) {
     
        super.setup(item, scene);

        this.itemToIntersect1 = scene.getItemByName(this.itemToIntersect1Name);
        this.itemToIntersect2 = scene.getItemByName(this.itemToIntersect2Name);

        this.itemToIntersect1.addDependent(item);
        this.itemToIntersect2.addDependent(item);

        if (this.itemToIntersect1.isSegment && this.itemToIntersect2.isSegment) {
            this.intersectFun = this.intersectTwoSegments;
            this.segmentFlt1 = new FlattenSegment(new FlattenPoint(), new FlattenPoint())
            this.segmentFlt2 = new FlattenSegment(new FlattenPoint(), new FlattenPoint())

        }
        // arc segment || segment arc
        else if ((this.itemToIntersect1.isArc && this.itemToIntersect2.isSegment) || (this.itemToIntersect1.isSegment && this.itemToIntersect2.isArc)) {

            if (this.itemToIntersect1.isArc && this.itemToIntersect2.isSegment)
                this.intersectFun = () => this.intersectArcAndSegment(this.itemToIntersect1, this.itemToIntersect2);
            else {
                this.intersectFun = () => this.intersectArcAndSegment(this.itemToIntersect2, this.itemToIntersect1, true);
            }

            this.arcFlt = new FlattenArc(new FlattenPoint(0, 0), 4, 0, 4, true);
            this.circleFlt = new FlattenCircle(new FlattenPoint(0, 0), 4);
            this.segmentFlt = new FlattenSegment(new FlattenPoint(), new FlattenPoint(3, 3.5))
            this.lineFlt = new FlattenLine(new FlattenPoint(), new FlattenPoint(3, 3.5));

        }
        // circle segment || segment circle
        else if ((this.itemToIntersect1.isCircle && this.itemToIntersect2.isSegment) || (this.itemToIntersect1.isSegment && this.itemToIntersect2.isCircle)) {

            if (this.itemToIntersect1.isCircle && this.itemToIntersect2.isSegment)
                this.intersectFun = () => this.intersectCircleAndSegment(this.itemToIntersect1, this.itemToIntersect2);
            else
                this.intersectFun = () => this.intersectCircleAndSegment(this.itemToIntersect2, this.itemToIntersect1, true);

            this.circleFlt = new FlattenCircle(new FlattenPoint(0, 0), 4);
            this.segmentFlt = new FlattenSegment(new FlattenPoint(), new FlattenPoint())
            this.lineFlt = new FlattenLine(new FlattenPoint(), new FlattenPoint(1, 1));

        }
        // arc arc
        else if (this.itemToIntersect1.isArc && this.itemToIntersect2.isArc) {

            this.arcFltCircle1 = new FlattenCircle(new FlattenPoint(0, 0), 4);
            this.arcFltCircle2 = new FlattenCircle(new FlattenPoint(0, 0), 4);
            this.intersectFun = this.intersectTwoArcs;

        }

        else if ((this.itemToIntersect1.isCircle && this.itemToIntersect2.isArc) || (this.itemToIntersect1.isArc && this.itemToIntersect2.isCircle)) {

            if (this.itemToIntersect1.isCircle && this.itemToIntersect2.isArc)
                this.intersectFun = () => this.intersectCircleAndArc(this.itemToIntersect1, this.itemToIntersect2);
            else
                this.intersectFun = () => this.intersectCircleAndArc(this.itemToIntersect2, this.itemToIntersect1, true);

            this.circleFlt = new FlattenCircle(new FlattenPoint(), 4);
            this.arcFlt = new FlattenArc(new FlattenPoint(), 4, 0, 4, true);

        }

    }

    calculateGeoInfo() {

        this.intersectFun();

    }

    /**
     * 
     * @param {Scene} scene 
     */
    getPosition(scene){
        
    }

    intersectTwoArcs() {

        this.arcFltCircle1.r = this.itemToIntersect1.radius;
        this.arcFltCircle1.pc.x = this.itemToIntersect1.centerPt.x;
        this.arcFltCircle1.pc.y = this.itemToIntersect1.centerPt.y;

        this.arcFltCircle2.r = this.itemToIntersect2.radius;
        this.arcFltCircle2.pc.x = this.itemToIntersect2.centerPt.x;
        this.arcFltCircle2.pc.y = this.itemToIntersect2.centerPt.y;

        const res = this.arcFltCircle1.intersect(this.arcFltCircle2)[this.intersectPointIndex];

        if (res && this.itemToIntersect1.isPtOnArc(res) && this.itemToIntersect2.isPtOnArc(res)) {
            this.item.position.set(res.x, res.y, this.item.position.z)
            this.item.isValid.value = this.itemToIntersect1.isValid.value && this.itemToIntersect2.isValid.value;
        }
        else {
            this.item.isValid.value = false;
        }
    }

    /**
     * 
     * @param {Arc} arc 
     * @param {Segment} segment 
     * @param {Boolean} reverseOrder 
     */
    intersectArcAndSegment(arc, segment, reverseOrder = false) {

        this.arcFlt.startAngle = arc.arcRotationAngle;
        this.arcFlt.endAngle = arc.arcRotationAngle + arc.arcAngle;
        this.arcFlt.r = arc.radius;
        this.arcFlt.pc.x = arc.centerPt.x;
        this.arcFlt.pc.y = arc.centerPt.y;

        this.circleFlt.r = arc.radius;
        this.circleFlt.pc.x = arc.centerPt.x;
        this.circleFlt.pc.y = arc.centerPt.y;

        this.segmentFlt.ps.x = segment.pt1.x;
        this.segmentFlt.ps.y = segment.pt1.y;

        this.segmentFlt.pe.x = segment.pt2.x;
        this.segmentFlt.pe.y = segment.pt2.y;

        const segLen = segment.getLength();

        this.lineFlt.pt.x = segment.pt1.x;
        this.lineFlt.pt.y = segment.pt1.y;
        this.lineFlt.norm.x = -(segment.pt2.y - segment.pt1.y) / segLen;
        this.lineFlt.norm.y = (segment.pt2.x - segment.pt1.x) / segLen;

        const res = this.lineFlt.intersect(this.circleFlt)[this.intersectPointIndex];

        if (res && this.arcFlt.contains(res) && this.segmentFlt.contains(res)) {

            this.item.position.set(res.x, res.y, this.item.position.z);
            this.item.isValid.value = arc.isValid.value && segment.isValid.value;
        }
        else {
            this.item.isValid.value = false;
        }

    }

    intersectCircleAndSegment(circle, segment, reverseOrder = false) {

        this.circleFlt.r = circle.radius;
        this.circleFlt.pc.x = circle.centerPt.x;
        this.circleFlt.pc.y = circle.centerPt.y;

        this.segmentFlt.ps.x = segment.pt1.x;
        this.segmentFlt.ps.y = segment.pt1.y;

        this.segmentFlt.pe.x = segment.pt2.x;
        this.segmentFlt.pe.y = segment.pt2.y;

        const segLen = segment.getLength();

        this.lineFlt.pt.x = segment.pt1.x;
        this.lineFlt.pt.y = segment.pt1.y;
        this.lineFlt.norm.x = -(segment.pt2.y - segment.pt1.y) / segLen;
        this.lineFlt.norm.y = (segment.pt2.x - segment.pt1.x) / segLen;

        let res;
        if (reverseOrder) {
            res = this.lineFlt.intersect(this.circleFlt)[this.intersectPointIndex];
        }
        else {
            res = this.circleFlt.intersect(this.lineFlt)[this.intersectPointIndex];
        }

        if (res && this.segmentFlt.contains(res)) {

            this.item.position.set(res.x, res.y, this.item.position.z);
            this.item.isValid.value = circle.isValid.value && segment.isValid.value;
        }
        else {
            this.item.isValid.value = false;
        }

    }

    intersectCircleAndArc(circle, arc, reverseOrder = false) {

        this.circleFlt.r = circle.radius;
        this.circleFlt.pc.x = circle.centerPt.x;
        this.circleFlt.pc.y = circle.centerPt.y;

        this.arcFlt.startAngle = arc.arcRotationAngle;
        this.arcFlt.endAngle = arc.arcRotationAngle + arc.arcAngle;
        this.arcFlt.r = arc.radius;
        this.arcFlt.pc.x = arc.centerPt.x;
        this.arcFlt.pc.y = arc.centerPt.y;

        let res;
        if (reverseOrder) {
            res = this.arcFlt.intersect(this.circleFlt)[this.intersectPointIndex];
        }
        else {
            res = this.circleFlt.intersect(this.arcFlt)[this.intersectPointIndex];
        }

        if (res) {

            this.item.position.set(res.x, res.y, this.item.position.z)
            this.item.isValid.value = circle.isValid.value && arc.isValid.value;
        }
        else {
            this.item.isValid.value = false;
        }

    }

    intersectTwoSegments() {

        this.segmentFlt1.ps.x = this.itemToIntersect1.pt1.x;
        this.segmentFlt1.ps.y = this.itemToIntersect1.pt1.y;
        this.segmentFlt1.pe.x = this.itemToIntersect1.pt2.x;
        this.segmentFlt1.pe.y = this.itemToIntersect1.pt2.y;

        this.segmentFlt2.ps.x = this.itemToIntersect2.pt1.x;
        this.segmentFlt2.ps.y = this.itemToIntersect2.pt1.y;
        this.segmentFlt2.pe.x = this.itemToIntersect2.pt2.x;
        this.segmentFlt2.pe.y = this.itemToIntersect2.pt2.y;

        const res = this.segmentFlt1.intersect(this.segmentFlt2)[0]

        if (res) {

            this.item.position.set(res.x, res.y, this.item.position.z);
            this.item.isValid.value = this.itemToIntersect1.isValid.value && this.itemToIntersect2.isValid.value;
        }
        else {
            this.item.isValid.value = false;
        }


        // if(!this.item.isValid){
            
        //     console.log(this.item.name, " is invalid");
        // }

        // console.log('this.item.isValid ', this.item.isValid);


    }

    onTipsOnSegment(res, seg) {

        return (util.isEqual(res.x, seg.pt1.x) && util.isEqual(res.y, seg.pt1.y)) || (util.isEqual(res.x, seg.pt2.x) && util.isEqual(res.y, seg.pt2.y))

    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

   
        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointOnIntersection(newDefItems.itemToIntersect1, newDefItems.itemToIntersect2, newDefItems.intersectPointIndex);
        this.item.setDefinition(newDef);
    }

    clone() {
        return new DefPointOnIntersection(this.itemToIntersect1Name, this.itemToIntersect2Name, this.intersectPointIndex);
    }

    getDataToExport(){

        return {
            className : this.constructor.name,
            data : [this.itemToIntersect1Name, this.itemToIntersect2Name, this.intersectPointIndex]
         }
        
        
    }
}