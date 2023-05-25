
import { Vector2 } from "three";
import DefAngle from "./abstract/DefAngle";
import * as util from "../../../helper/util"

export default class DefAngleThreeStaticPoints extends DefAngle {

    /**
     * 
     * @param {Vector2} point1 
     * @param {Vector2} poitn2 
     * @param {Vector2} poitn3 
     */
    constructor(pt1, pt2, pt3, inReverseOrder = false) {

        super(inReverseOrder);

        this.pt1 = pt1;
        this.pt2 = pt2;
        this.pt3 = pt3;

    }

    setup(item) {
        super.setup(item);
    }

    calculateGeoInfo() {

        this.item.isValid.value = util.getDistance(this.pt1, this.pt2) !== 0 &&  util.getDistance(this.pt3, this.pt2) !== 0;
        
        if(this.item.isValid.value){

            if (this.inReverseOrder) {
                this.item.update(this.pt3, this.pt2, this.pt1);
            }
            else {
                this.item.update(this.pt1, this.pt2, this.pt3);
            }
    
        }
        
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

        this.item.dependeeUpdated();

    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefAngleThreeStaticPoints(newDefItems.pt1, newDefItems.pt2, newDefItems.pt3)
        this.item.setDefinition(newDef);
    }

    clone(){
        return new DefAngleThreeStaticPoints(this.pt1.clone(), this.pt2.clone(), this.pt3.clone(), this.inReverseOrder);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.pt1.clone(), this.pt2.clone(), this.pt3.clone(), this.inReverseOrder]
        }
    }

}