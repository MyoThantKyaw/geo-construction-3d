
import Point from "../../geometries/Point";
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from "three";
import Definition from "../abstract/Definition";
import Scene from "../../Scene";

import * as util from "../../helper/util"

export default class DefPointWithAngleFromALine extends Definition {

    /**
     * 
     * @param {String} point1Name 
     * @param {String} point2Name 
     * @param {Number} angle 
     * @param {Number} length 
     */
    constructor(point1Name, point2Name, angle, length, clockwise = false) {

        super();

        this.point1Name = point1Name;
        this.point2Name = point2Name;
        this.angle = angle;
        this.length = length;
        this.clockwise = clockwise;

        this.position = new Vector2();



    }

    /**
     * 
     * @param {Point} item 
     * @param {Scene} scene 
     */
    setup(item, scene) {

        super.setup(item, scene);

        this.point1 = scene.getItemByName(this.point1Name);
        this.point2 = scene.getItemByName(this.point2Name);

        this.point1.addDependent(item);
        this.point2.addDependent(item);

        item.addConstraintFunc(temptPt => {
            return true;
        });

    }

    update(pt, alreadyPassedConstraint = false) {

        const lineVector = { x: this.point1.position.x - this.point2.position.x, y: this.point1.position.y - this.point2.position.y }

        const armVector = this.clockwise ? util.rotateVector(lineVector, this.angle) : util.rotateVector(lineVector, -this.angle);

        this.length = Math.max(0, ((armVector.x * (pt.x - this.point2.position.x)) + (armVector.y * (pt.y - this.point2.position.y))) / Math.sqrt((armVector.x ** 2) + (armVector.y ** 2)));
        this.item.dependeeUpdated();

    }

    calculateGeoInfo() {

        this.position.x = this.point1.position.x - this.point2.position.x;
        this.position.y = this.point1.position.y - this.point2.position.y;

        util.rotateVector_(this.position, this.clockwise ? this.angle : -this.angle);

        this.position.setLength(this.length).add(this.point2.position);
        this.item.updateGeometry(this.position.x, this.position.y);

        this.item.isValid.value = this.point1.isValid.value && this.point2.isValid.value;

    }

    /**
      * 
      * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
      */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointWithAngleFromALine(newDefItems.point1Name, newDefItems.point2Name, newDefItems.angle, newDefItems.length, newDefItems.clockwise);
        this.item.setDefinition(newDef);
    }

    clone() {
        return new DefPointWithAngleFromALine(this.point1Name, this.point2Name, this.angle, this.length, this.clockwise);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.point1Name, this.point2Name, this.angle, this.length, this.clockwise]
        }
         
    }
}