
import { Vector2 } from "three";
import DefLabel from "./abstract/DefLabel";

import * as util from "../../helper/util"

export default class DefLabelBetween2StaticPoints extends DefLabel {

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    constructor(pt1, pt2) {

        super();

        this.isDynamicValue = true;

        this.pt1 = pt1;
        this.pt2 = pt2;

        this.tmpLineVect = new Vector2();
        this.normalVect = new Vector2();

        this.distance = 0;

    }

    /**
     * 
     * @param {Vector2} pt1 
     * @param {Vector2} pt2 
     */
    update(pt1, pt2) {

        this.pt1.copy(pt1);
        this.pt2.copy(pt2);

        this.item.dependeeUpdated();

    }

    calculateGeoInfo() {

        if (this.rotateAlongLine) {
            this.calcLabelPos2PointsRAL();
        }

        this.updateLabelValue();
        this.item.isValid.value = util.getDistance(this.pt1, this.pt2) !== 0;

    }

    calcLabelPos2PointsRAL() {

        this.tmpLineVect.set(this.pt2.x - this.pt1.x, this.pt2.y - this.pt1.y);

        this.normalVect.set(this.tmpLineVect.y, -this.tmpLineVect.x);
        this.normalVect.normalize();

        let angle = util.getAngle(this.tmpLineVect.x, this.tmpLineVect.y);

        if (angle >= Math.PI / 2 && angle < 3 * Math.PI / 2) {
            angle += Math.PI;
        }

        this.tmpLineVect.setLength((this.tmpLineVect.length() / 2) + (this.item.hAlign * this.item.halfWidth) + (this.item.hOffset * Math.sign( this.item.hAlign - 0.1 )));
        this.normalVect.setLength((this.item.vAlign * this.item.halfHeight) + (this.item.vOffset * Math.sign( this.item.vAlign - 0.1 )));

        this.item.updateGeometry(
            this.pt1.x + this.tmpLineVect.x + this.normalVect.x,
            this.pt1.y + this.tmpLineVect.y + this.normalVect.y 
            , angle)


    }

    updateLabelValue() {

        const newText =  parseFloat(util.getDistance(this.pt1, this.pt2).toFixed(2)) + "";

        if(newText !== this.item.text){
            this.item.setText(newText);
        }
    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefLabelBetween2StaticPoints(newDefItems.pt1, newDefItems.pt2);
        this.item.setDefinition(newDef);
    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [{
                className: "Vector2",
                data: [
                    this.pt1.x, this.pt1.y
                ]
            },
            {
                className: "Vector2",
                data: [
                    this.pt2.x, this.pt2.y
                ]
            }]
        }

    }


}