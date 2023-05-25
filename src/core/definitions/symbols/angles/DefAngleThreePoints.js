
import Point from "../../../geometries/Point";
import DefAngle from "./abstract/DefAngle";
import Scene from "../../../Scene";;

import * as util from "../../../helper/util" 

export default class DefAngleThreePoints extends DefAngle {

    /**
     * 
     * @param {Point} point1 
     * @param {Point} poitn2 
     * @param {Point} poitn3 
     */
    constructor(point1Name, point2Name, point3Name, inReverseOrder = false) {

        super(inReverseOrder);

        this.point1Name = point1Name;
        this.point2Name = point2Name;
        this.point3Name = point3Name;

    }

    /**
     * 
     * @param {Angle} item 
     * @param {Scene} scene
     */
    setup(item, scene) {

        super.setup(item);

        this.point1 = scene.getItemByName(this.point1Name);
        this.point2 = scene.getItemByName(this.point2Name);
        this.point3 = scene.getItemByName(this.point3Name);

        this.point1.addDependent(item);
        this.point2.addDependent(item);
        this.point3.addDependent(item);

    }

    calculateGeoInfo() {

        this.item.isValid.value = this.point1.isValid.value && this.point2.isValid.value && this.point3.isValid.value &&
            util.getDistance(this.point1.position, this.point2.position) !== 0 && util.getDistance(this.point3.position, this.point2.position) !== 0;

        if (this.item.isValid) {


            if (this.inReverseOrder) {
                this.item.update(this.point3.position, this.point2.position, this.point1.position);
            }
            else {
                this.item.update(this.point1.position, this.point2.position, this.point3.position);
            }

            this.pt1.copy(this.point1.position);
            this.pt2.copy(this.point2.position);
            this.pt3.copy(this.point3.position);


        }
    }

    /**
     * 
     * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
     */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefAngleThreePoints(newDefItems.point1Name, newDefItems.point2Name, newDefItems.point3Name, newDefItems.inReverseOrder)
        this.item.setDefinition(newDef);

    }

    clone() {
        return new DefAngleThreePoints(this.point1Name, this.point2Name, this.point3Name, this.inReverseOrder);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.point1Name, this.point2Name, this.point3Name, this.inReverseOrder]
        }
    }
}