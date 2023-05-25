// import Circle from "../../geometries/Circle";
import Point from "../../geometries/Point";
import { Vector2 } from "three";
import Definition from "../abstract/Definition";
import Circle from "../../geometries/Circle";
import * as util from "../../helper/util";

export default class DefCircleWithFixedRadius extends Definition {

    /**
     * 
     * @param {Point} centerPoint 
     * @param {Point} pointOnBoundary 
     */
    constructor(centerPointName, radius, withSpecificRadius) {

        super();


        this.centerPointName = centerPointName;
        this.radius = radius;
        this.withSpecificRadius = withSpecificRadius;

    }

    /**
     * 
     * @param {Circle} item 
     */
    setup(item, scene) {

        super.setup(item);

        this.centerPoint = scene.getItemByName(this.centerPointName);

        this.centerPoint.addDependent(item);

    }

    calculateGeoInfo() {

        this.item.update(this.centerPoint.position, this.radius);
        this.item.isValid.value = this.centerPoint.isValid.value && this.radius > 0;

    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefCircleWithFixedRadius(newDefItems.centerPointName, newDefItems.radius, newDefItems.withSpecificRadius);
        this.item.setDefinition(newDef);

    }

    clone() {
        return new DefCircleWithFixedRadius(this.centerPointName, this.radius, this.withSpecificRadius);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.centerPointName, this.radius, this.withSpecificRadius],
        }
         
    }
}