import DefPointFree from "../../definitions/points/DefPointFree";
import DefPointOnIntersection from "../../definitions/points/DefPointOnIntersection";
import Point from "../../geometries/Point";
import Scene from "../../Scene";
import Command from "../abstract/Command";

export default class CmdChangeDefOfFreePointToOtherDef extends Command {


    /**
     * 
     * @param {String} pointName 
     * @param {String} intersectItem1Name 
     * @param {String} intersectItem2Name 
     * @param {Number} ptIndex 
     */
    constructor(pointName, prevPt, defClass, name, ...args) {

        super();
        this.pointName = pointName;
        this.defClass = defClass;
        this.prevPt = prevPt.clone();

        this.name = name ? name : this.getUUID();

        this.args = args;
        this.type = "Transform";

    }

    /**
     * 
     * @param {Scene} scene 
     */
    execute(scene) {

        this.point = scene.getItemByName(this.pointName);

        this.point.setDefinition(new this.defClass(
            ...this.args
        ));

        return this.point;
    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {

        this.point = scene.getItemByName(this.pointName);
        this.point.setDefinition(new DefPointFree(this.prevPt.x, this.prevPt.y));

    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data : [
                this.pointName, {
                    className : "Vector2",
                    data : [
                        this.prevPt.x, this.prevPt.y
                    ]
                }, {
                    className : this.defClass.name
                }, 
                this.name,
                ...this.args
            ]
        }

    }
}