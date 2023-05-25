
import Point from "../../geometries/Point";
import {Vector2} from "three";
import Definition from "../abstract/Definition";
import Scene from "../../Scene";

import * as util from "../../helper/util"

export default class DefPointOnInvisibleCircle extends Definition {

    /**
     * 
     * @param {String} centerPointName 
     * @param {Number} radius 
     * @param {Number} angle 
     */
    constructor(centerPointName, radius, angle) {

        super();

        this.centerPointName = centerPointName;
        this.angle = angle;
        this.radius = radius;
        this.isAngleFree = true;
        
        this.position = new Vector2();

        this.name = "PointOnInvisibleCircle";
        this.id = "P_O_I_C";
    }


    /**
     * 
     * @param {Point} item 
     * @param {Scene} scene 
     */
    setup(item, scene){

        super.setup(item, scene);

        this.centerPoint = scene.getItemByName(this.centerPointName);
        this.centerPoint.addDependent(item);

        item.addConstraintFunc(temptPt => {

            const angle = util.getAngle(
                temptPt.x - this.centerPoint.position.x,
                temptPt.y - this.centerPoint.position.y,
            );

            temptPt.x = this.centerPoint.position.x + Math.cos(angle) * this.radius;
            temptPt.y = this.centerPoint.position.y + Math.sin(angle) * this.radius;

            return true;
        })

    }

    calculateGeoInfo(){

     
        this.position.set(
            this.centerPoint.position.x + Math.cos(this.angle) * this.radius,
            this.centerPoint.position.y + Math.sin(this.angle) * this.radius
        );

        this.item.updateGeometry(this.position.x, this.position.y);
        this.item.isValid.value = this.centerPoint.isValid.value;

    }


    update(pt){

        this.angle = util.getAngle2Pts(this.centerPoint.position, pt);
        this.item.dependeeUpdated(); 
    }

     /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
     changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointOnInvisibleCircle(newDefItems.centerPointName, newDefItems.radius, newDefItems.angle);
        this.item.setDefinition(newDef);

    }

    saveState() {
        this.backupPt = this.position.clone();
        this.item.isTemporaryUpdated = false;
    }
    // restoreState() {

    //     if(!this.backupPt) return;

    //     if (this.item.isTemporaryUpdated) {
    //         this.update(this.backupPt);
    //         console.warn("rstore state...");
    //     }
    // }

    clone(){
        return new DefPointOnInvisibleCircle(this.centerPointName, this.radius, this.angle);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.centerPointName, this.radius, this.angle]
        }
        
    }
}