
import Point from "../../geometries/Point";
import {Vector2} from "three";
import Definition from "../abstract/Definition";
import Scene from "../../Scene";

import * as util from "../../helper/util"

export default class DefPointOnParallelSegment extends Definition {

    
    constructor(originPointName, length, segmentPoint1Name, segmentPoint2Name) {

        super();

        this.originPointName = originPointName;
        this.length = length;
        this.segmentPoint1Name = segmentPoint1Name;
        this.segmentPoint2Name = segmentPoint2Name;
        
    }


    /**
     * 
     * @param {Point} item 
     * @param {Scene} scene 
     */
    setup(item, scene){

        super.setup(item, scene);

        this.originPoint = scene.getItemByName(this.originPointName);
        this.originPoint.addDependent(item);

        item.addConstraintFunc(temptPt => {

            const angle = util.getAngle2Pts(this.segmentPoint1.position, this.segmentPoint2.position);

            const ptOnSegment = util.projectPointOnLine(temptPt, this.originPoint.position, {
                x :  this.originPoint.position.x + Math.cos(angle), y :  this.originPoint.position.y + Math.sin(angle)
            })

            temptPt.x = ptOnSegment.x;
            temptPt.y = ptOnSegment.y;

            this.length = util.getDistance(this.originPoint.position, ptOnSegment);
        
            return true;

        })
        
        this.segmentPoint1 = scene.getItemByName(this.segmentPoint1Name);
        this.segmentPoint2 = scene.getItemByName(this.segmentPoint2Name);

        this.segmentPoint1.addDependent(item);
        this.segmentPoint2.addDependent(item);
        
    }

    calculateGeoInfo(){

        const angle = util.getAngle2Pts(this.segmentPoint1.position, this.segmentPoint2.position);

        this.item.updateGeometry(
            this.originPoint.position.x + Math.cos(angle) * this.length, 
            this.originPoint.position.y + Math.sin(angle) * this.length
        )

        this.item.isValid.value = this.originPoint.isValid.value && this.segmentPoint1.isValid && this.segmentPoint2.isValid.value;

    }

    update(pt){

        const angle = util.getAngle2Pts(this.segmentPoint1.position, this.segmentPoint2.position);

        const ptOnSegment = util.projectPointOnLine(pt, this.originPoint.position, {
            x :  this.originPoint.position.x + Math.cos(angle), y :  this.originPoint.position.y + Math.sin(angle)
        })


        this.length = util.getDistance(this.originPoint.position, ptOnSegment);
        this.item.dependeeUpdated();

    }

     /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
     changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointOnParallelSegment(
            newDefItems.originPointName, newDefItems.length, newDefItems.segmentPoint1Name, newDefItems.segmentPoint2Name
        );
        this.item.setDefinition(newDef);

    }

    clone(){
        return new DefPointOnParallelSegment(this.originPointName, this.length, this.segmentPoint1Name, this.segmentPoint2Name);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.originPointName, this.length, this.segmentPoint1Name, this.segmentPoint2Name]
        }
         
    }


}