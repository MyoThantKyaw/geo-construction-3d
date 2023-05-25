import DefPointFree from "../../definitions/points/DefPointFree";
import DefPointOnIntersection from "../../definitions/points/DefPointOnIntersection";
import Point from "../../geometries/Point";
import Scene from "../../Scene";
import Command from "../abstract/Command";

export default class CmdReplacePointWithOtherPoint extends Command {


    /**
     * 
     * @param {String} pointName 
     * @param {String} otherPointName 
     */
    constructor(pointName, otherPointName, prevPt, name) {

        super();

        this.pointName = pointName;
        this.otherPointName = otherPointName;
        this.prevPt = prevPt;
        
        this.name = name ? name : this.getUUID();


        this.type = "Transform";
        this.isReplacing = true;
    }

    /**
     * 
     * @param {Scene} scene 
     */
    execute(scene) {

        this.point = scene.getItemByName(this.pointName);
        this.otherPoint = scene.getItemByName(this.otherPointName);

        this.previousDependents = this.point.dependents.slice();

        this.previousDependents.forEach(dependent => {

            dependent.definition.changeItems([{
                from: this.point.name,
                to: this.otherPoint.name,
            }])
        });

        this.point.delete();

        this.point.definition.deleted = true;

    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {

        // re-create point
        this.point = new Point(new DefPointFree(this.prevPt.x, this.prevPt.y), {
            name : this.pointName,
        });
        scene.add(this.point).show();

        this.previousDependents.forEach(dependent => {

            dependent.definition.changeItems([{
                from: this.otherPoint.name,
                to:  this.pointName,
            }])
        });

    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [
                this.pointName, this.otherPointName, {
                    className : "Vector2",
                    data : [
                        this.prevPt.x, this.prevPt.y
                    ]
                },
                this.name
            ]
        }
        
    }

}