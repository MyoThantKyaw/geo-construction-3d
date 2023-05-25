// import Circle from "../../geometries/Circle";
import Point from "../../geometries/Point";
import { Vector2 } from "three";
import Definition from "../abstract/Definition";
import Circle from "../../geometries/Circle";
import * as util from "../../helper/util";

export default class DefCircleWithCenterAndPointOnBoundary extends Definition {

    /**
     * 
     * @param {Point} centerPoint 
     * @param {Point} pointOnBoundary 
     */
    constructor(centerPointName, pointNameOnBoundary, withSpecificRadius) {

        super();

        this.centerPointName = centerPointName;
        this.pointNameOnBoundary = pointNameOnBoundary;
        this.withSpecificRadius = withSpecificRadius;

    }

    /**
     * 
     * @param {Circle} item 
     */
    setup(item, scene) {

        super.setup(item);

        this.centerPoint = scene.getItemByName(this.centerPointName);
        this.pointOnBoundary = scene.getItemByName(this.pointNameOnBoundary);

        this.centerPoint.addDependent(item);
        this.pointOnBoundary.addDependent(item);

    }

    calculateGeoInfo() {

        this.item.update(this.centerPoint.position, util.getDistance(this.centerPoint.position, this.pointOnBoundary.position));

        this.item.isValid.value = this.centerPoint.isValid.value && this.pointOnBoundary.isValid.value;


    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefCircleWithCenterAndPointOnBoundary(newDefItems.centerPointName, newDefItems.pointNameOnBoundary, newDefItems.withSpecificRadius);
        this.item.setDefinition(newDef);

    }

    clone() {
        return new DefCircleWithCenterAndPointOnBoundary(this.centerPointName, this.pointNameOnBoundary, this.withSpecificRadius);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.centerPointName, this.pointNameOnBoundary, this.withSpecificRadius]
        }
        
    }
}