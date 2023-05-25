import Arc from "../../geometries/Arc";
import Scene from "../../Scene";
import DefArc from "./abstract/DefArc";
import * as util from "../../helper/util"

export default class DefArcWithCenterPointRadiusStartEndAngle extends DefArc {

    /**
     * 
     * @param {String} centerPointName 
     * @param {Number} radius 
     * @param {Number} startAngle 
     * @param {Number} endAngle 
     * @param {Boolean} withSpecificRadius 
     */
    constructor(centerPointName, radius, startAngle, endAngle, withSpecificRadius) {

        super();
        
        this.centerPointName = centerPointName;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.withSpecificRadius = withSpecificRadius;

    }

    /**
     * 
     * @param {Arc} item 
     * @param {Scene} scene 
     */
    setup(item, scene) {

        super.setup(item, scene);
        this.centerPoint = scene.getItemByName(this.centerPointName);

        this.centerPoint.addDependent(item);
        this.item.centerPt = this.centerPoint.position;

    }

    calculateGeoInfo() {

        this.item.updateGeometry(this.centerPoint.position, this.radius, util.getAngleDifference(this.startAngle, this.endAngle, true), this.startAngle);
        this.item.isValid.value = this.centerPoint.isValid.value;

        // update fields in item
        this.itemRadius = this.item.radius;
        this.itemArcAngle = this.item.arcAngle;
        this.itemArcRotationAngle = this.item.arcRotationAngle;

    }

    update(radius, startAngle, endAngle) {

        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.radius = radius;

        this.item.dependeeUpdated();

    }

    /**
   * 
   * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
   */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefArcWithCenterPointRadiusStartEndAngle(newDefItems.centerPointName, newDefItems.radius, newDefItems.startAngle, newDefItems.endAngle, newDefItems.withSpecificRadius);
        this.item.setDefinition(newDef);
    }

    clone(){

        return new DefArcWithCenterPointRadiusStartEndAngle(this.centerPointName, this.radius, this.startAngle, this.endAngle, this.withSpecificRadius);

    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.centerPointName, this.radius, this.startAngle, this.endAngle, this.withSpecificRadius],
        }
         
    }
}