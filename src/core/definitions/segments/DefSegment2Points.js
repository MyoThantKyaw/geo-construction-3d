

import Segment from "../../geometries/Segment";
import { Vector2 } from "three";
import DefSegment from "./abstract/DefSegment";

export default class DefSegment2Points extends DefSegment {

    /**
     * 
     * @param {String} point1Name 
     * @param {String} point2Name 
     */
    constructor(point1Name, point2Name) {

        super(point1Name, point2Name);

        this.panOffset1 = new Vector2();
        this.panOffset2 = new Vector2();
    }


    /**
     * 
     * @param {Segment} item 
     */
    setup(item, scene) {

        super.setup(item, scene);

        this.isFree = this.point1.definition.isFree || this.point2.definition.isFree;

        this.point1.addDependent(item);
        this.point2.addDependent(item);

    }

    calculateGeoInfo() {

        this.item.update(this.point1.position, this.point2.position);
        this.item.isValid.value = this.point1.isValid.value && this.point2.isValid.value;

    }

    /**
     * 
     * @param {*} itemToChange e.g [ {from : existingItemName, to : newItemName }, {}, ..]
     */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefSegment2Points(newDefItems.point1Name, newDefItems.point2Name)
        this.item.setDefinition(newDef);

    }

    onDragStart(pt) {

        this.panOffset1.x = pt.x - this.point1.position.x;
        this.panOffset1.y = pt.y - this.point1.position.y;

        this.panOffset2.x = pt.x - this.point2.position.x;
        this.panOffset2.y = pt.y - this.point2.position.y;

    }


    onDrag(pt) {

        if (this.point1.definition.isFree)
            this.point1.definition.updateXY(pt.x - this.panOffset1.x, pt.y - this.panOffset1.y);
        if (this.point2.definition.isFree)
            this.point2.definition.updateXY(pt.x - this.panOffset2.x, pt.y - this.panOffset2.y);

    }

    clone() {
        return new DefSegment2Points(this.point1Name, this.point2Name);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.point1Name, this.point2Name],
        }
    }
}
