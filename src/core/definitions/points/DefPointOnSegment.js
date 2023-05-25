
import Point from "../../geometries/Point";
import { Vector2 } from "three";
import Definition from "../abstract/Definition";
import 
ene from "../../Scene";

import * as util from "../../helper/util"

export default class DefPointOnSegment extends Definition {

    /**
     * 
     * @param {String} segment 
     * @param {Number} relativePosFromPoint1 
     */
    constructor(segmentName, relativePosFromPoint1) {

        super();

        // console.warn("DefPointOnSegment");
        // console.warn(segmentName, relativePosFromPoint1);

        this.segmentName = segmentName;

        this.relativePosFromPoint1 = relativePosFromPoint1;

        this.tmpVect = new Vector2();
        this.position = new Vector2();

    }

    /**
     * 
     * @param {Point} item 
     * @param {Scene} scene
     */
    setup(item, scene) {

        super.setup(item);

        this.segment = scene.getItemByName(this.segmentName);
        this.pt1 = this.segment.pt1;
        this.pt2 = this.segment.pt2;

      
        this.segment.addDependent(item);

        item.addConstraintFunc(temptPt => {

            const pt = util.projectPointOnSegment(temptPt, this.pt1, this.pt2)

            temptPt.x = pt.x;
            temptPt.y = pt.y;
            return true;

        })


    }

    update(pt, alreadyPassedConstraint = false) {

        if(!alreadyPassedConstraint){
            pt = util.projectPointOnSegment(pt, this.pt1, this.pt2)
        }

        // update relative position
        this.relativePosFromPoint1 = util.getDistance(pt, this.pt1) / this.segment.getLength();
        this.item.dependeeUpdated();

    
    }

    calculateGeoInfo() {

        const len = this.segment.getLength();

        this.segment.getVector_(this.tmpVect);

        this.tmpVect.normalize();

        this.item.updateGeometry(
            this.segment.pt1.x + (this.tmpVect.x * (this.relativePosFromPoint1 * len)),
            this.segment.pt1.y + (this.tmpVect.y * (this.relativePosFromPoint1 * len))
        )

        this.position.copy(this.item.position);

        this.item.isValid.value = this.segment.isValid.value;


    }
    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointOnSegment(newDefItems.segmentName, newDefItems.relativePosFromPoint1);
        this.item.setDefinition(newDef);

    }

    clone() {
        return new DefPointOnSegment(this.segmentName, this.relativePosFromPoint1);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.segmentName, this.relativePosFromPoint1],
        }
        
    }
    
}
