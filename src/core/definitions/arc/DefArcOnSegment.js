
import Arc from "../../geometries/Arc";
import Scene from "../../Scene";
import DefArc from "./abstract/DefArc";

export default class DefArcOnSegment extends DefArc { 

    /**
     * 
     * @param {String} segmentName 
     * @param {String} centerPointName 
     * @param {Number} radius 
     * @param {Number} arcAngle 
     * @param {Boolean} faceToEndPt 
     * @param {Boolean} withSpecificRadius 
     */
    constructor(segmentName, centerPointName, radius, arcAngle, faceToEndPt, withSpecificRadius){

        super();

        this.segmentName = segmentName;
        this.centerPointName = centerPointName;
        this.radius = radius;
        this.arcAngle = arcAngle;
        this.faceToEndPt = faceToEndPt;
        this.withSpecificRadius = withSpecificRadius;

    }

    /**
     * 
     * @param {Arc} item 
     * @param {Scene} scene
     */
    setup(item, scene){

        super.setup(item, scene);

        this.segment = scene.getItemByName(this.segmentName);
        this.centerPoint = scene.getItemByName(this.centerPointName);

        this.centerPoint.addDependent(item);
        this.segment.addDependent(item);

    }

    calculateGeoInfo(){

        const angle = this.faceToEndPt ? this.segment.getAngle() : this.segment.getAngle() + Math.PI;

        this.item.updateGeometry(this.centerPoint.position, this.radius, 
            this.arcAngle, angle - (this.arcAngle / 2));

        this.item.isValid.value = this.centerPoint.isValid && this.segment.isValid && this.radius <= this.segment.getLength();

        // update fields in item
        this.itemCenter.copy(this.item.centerPt);
        this.itemRadius = this.item.radius;
        this.itemArcAngle = this.item.arcAngle;
        this.itemArcRotationAngle = this.item.arcRotationAngle;
    

    }

    update(radius, startAngle, endAngle){

        // this.startAngle = startAngle;
        // this.endAngle = endAngle;
        // this.radius = radius;
        // this.item.dependeeUpdated();
        
    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefArcOnSegment(newDefItems.segmentName, newDefItems.centerPointName, newDefItems.radius, newDefItems.arcAngle, newDefItems.faceToEndPt, newDefItems.withSpecificRadius);
        this.item.setDefinition(newDef);
    }

    clone(){
        return new DefArcOnSegment(this.segmentName, this.centerPointName, this.radius, this.arcAngle, this.faceToEndPt, this.withSpecificRadius);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.segmentName, this.centerPointName, this.radius, this.arcAngle, this.faceToEndPt, this.withSpecificRadius],
        }
         
    }
}