import { Vector2 } from "three";
import DefLabel from "./abstract/DefLabel";
import Label from "../../graphics/Label";
import Scene from "../../Scene";
import * as util from "../../helper/util"

export default class DefLabelForPoint extends DefLabel {

    /**
     * 
     * @param {String} pointName 
     * @param {*} options 
     */
    constructor(pointName, offset = .2, angle = 0) {

        super();

        this.pointName = pointName;
        this.offset = offset;
        this.angle = angle;

    }

    /**
     * 
     * @param {Label} item 
     * @param {Scene} scene
     */
    setup(item, scene) {

        super.setup(item, scene);

        item.draggable = true;

        this.point = scene.getItemByName(this.pointName);

        this.point.addDependent(item);
    }

    onDragStart(e) {

        this.dragOffsetX = e.x - this.position.x;
        this.dragOffsetY = e.y - this.position.y;

    }

    onDrag(e) {

        const newPos = { x: e.x - this.dragOffsetX, y: e.y - this.dragOffsetY };

        this.angle = util.getAngle2Pts(this.point.position, newPos);

        const offset = util.getDistance(this.point.position, newPos);

        if(offset <= 1){
            this.offset = offset;
        }

        this.item.dependeeUpdated();

    }

    onDragEnd(e) {

    }

    update(pt){

        // apply constraint
        // update offset and angle

        this.angle = util.getAngle2Pts(this.point.position, pt);

        const offset = util.getDistance(this.point.position, pt);

        if(offset <= 1){
            this.offset = offset;
        }

        this.item.dependeeUpdated();
        
    }

    calculateGeoInfo() {

        this.item.isValid.value = this.point.isValid.value;
        this.position.set(
            this.point.position.x + Math.cos(this.angle) * (this.offset ),
            this.point.position.y + Math.sin(this.angle) * (this.offset )
        );

        this.item.updateGeometry(this.position.x, this.position.y, 0);

    }


    /**
      * 
      * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
      */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefLabelForPoint(newDefItems.pointName, newDefItems.offset, newDefItems.angle);

        this.item.setDefinition(newDef);
    }

    clone() {
        return new DefLabelForPoint(this.pointName, this.offset, this.angle);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.pointName, this.offset, this.angle]
        }
        
    }

}
