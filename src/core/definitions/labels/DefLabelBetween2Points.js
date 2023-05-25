import { Vector2 } from "three";
import DefLabel from "./abstract/DefLabel";
import Label from "../../graphics/Label";
import Scene from "../../Scene";
import * as util from "../../helper/util"

export default class DefLabelBetween2Points extends DefLabel {

    /**
     * 
     * @param {String} point1Name 
     * @param {String} point2Name 
     * @param {*} options 
     */
    constructor(point1Name, point2Name) {

        super();

        this.point1Name = point1Name;
        this.point2Name = point2Name;

        this.tmpLineVect = new Vector2();
        this.normalVect = new Vector2();

    }

    /**
     * 
     * @param {Label} item 
     * @param {Scene} scene
     */
    setup(item, scene) {

        super.setup(item, scene)

        item.isDynamicValue = item.isDynamicValue !== false;

        this.point1 = scene.getItemByName(this.point1Name);
        this.point2 = scene.getItemByName(this.point2Name);

        this.pt1 = this.point1.position;
        this.pt2 = this.point2.position;

        this.point1.addDependent(item);
        this.point2.addDependent(item);

    }

    calculateGeoInfo(updateLabelText = true) {

        if (updateLabelText && this.item.isDynamicValue)
            this.updateLabelValue();

        if (this.rotateAlongLine)
            this.calcLabelPos2PointsRAL();

        this.item.isValid.value = this.point1.isValid.value && this.point2.isValid.value && util.getDistance(this.point1.position, this.point2.position) !== 0;

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

        const newText = parseFloat(util.getDistance(this.point1.position, this.point2.position).toFixed(2)) + "";

        if (newText !== this.item.text) {
            this.item.setText(newText + " cm");
        }

    }

    /**
      * 
      * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
      */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefLabelBetween2Points(newDefItems.point1Name, newDefItems.point2Name);

        this.item.setDefinition(newDef);
    }

    /**
     * 
     * @param {Scene} scene 
     */
    flipSide(scene){

        const tmpName = this.point2Name;
        this.point2Name = this.point1Name;
        this.point1Name = tmpName;
    
        
        this.point1 = scene.getItemByName(this.point1Name);
        this.point2 = scene.getItemByName(this.point2Name);

        this.pt1 = this.point1.position;
        this.pt2 = this.point2.position;

        this.calculateGeoInfo();

    }

    clone() {
        return new DefLabelBetween2Points(this.point1Name, this.point2Name);
    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [this.point1Name, this.point2Name]
        }

    }
}
