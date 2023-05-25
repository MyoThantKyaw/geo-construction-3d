
import { Vector2 } from "three";
import Label from "../../graphics/Label";
import Definition from "../abstract/Definition";

export default class DefLabelStaticPt extends Definition {

    /**
     * 
     * @param {Vector2} pt 
     * @param {*} options 
     */
    constructor(pt, angle) {

        super();

        this.pt = pt.clone();
        this.angle = angle;

    }

    /**
     * 
     * @param {Label} item 
     */
    setup(item, scene) {

        super.setup(item, scene);
        this.item.isValid = true;
    }

    calculateGeoInfo() {

        this.item.updateGeometry(this.pt.x, this.pt.y, this.angle);

    }

    update(x, y, angle) {

        this.pt.set(x, y);
        this.angle = angle;
        this.item.dependeeUpdated();
    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        this.item.setDefinition(new DefLabelStaticPt(newDefItems.pt, newDefItems.angle));

    }

    clone() {
        return new DefLabelStaticPt(this.pt, this.angle)
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [{
                className : "Vector2",
                data : [
                    this.pt.x, this.pt.y
                ]
            }, this.angle]
        }

    }

}
