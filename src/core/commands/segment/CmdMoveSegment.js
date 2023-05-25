import { Vector2 } from "three";
import Point from "../../geometries/Point";
import Scene from "../../Scene";
import Command from "../abstract/Command";


export default class CmdMoveSegment extends Command {


    /**
     * 
     * @param {String} segmentName 
     * @param {String} point1Name 
     * @param {String} point2Name 
     * @param {Vector2} toPt1 
     * @param {Vector2} toPt2 
     * @param {Vector2} fromPt1 
     * @param {Vector2} fromPt2 
     */
    constructor(segmentName, point1Name, point2Name, toPt1, toPt2, fromPt1, fromPt2, name) {

        super();

        this.segmentName = segmentName;
        this.point1Name = point1Name;
        this.point2Name = point2Name;
        this.toPt1 = toPt1.clone();
        this.toPt2 = toPt2.clone();

        this.fromPt1 = fromPt1.clone();
        this.fromPt2 = fromPt2.clone();

        this.name = name ? name : this.getUUID();

        this.type = "Transform";

        this.description = segmentName.substring(0, 15) + " ကို ရွှေ့သည်";
    }

    /**
     * @param {Scene} scene
     * @param {*} options 
     */
    execute(scene, options = {}) {

        if (options.alreayExecuted !== true) {

            scene.getItemByName(this.point1Name).definition.update(this.toPt1);
            scene.getItemByName(this.point2Name).definition.update(this.toPt2);

        }

   
    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {
        // move point to previous position
        scene.getItemByName(this.point1Name).definition.update(this.fromPt1);
        scene.getItemByName(this.point2Name).definition.update(this.fromPt2);

    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [
                this.segmentName, this.point1Name, this.point2Name, {
                    className: "Vector2",
                    data: [this.toPt1.x, this.toPt1.y]
                }, {
                    className: "Vector2",
                    data: [this.toPt2.x, this.toPt2.y],
                }, {
                    className: "Vector2",
                    data: [this.fromPt1.x, this.fromPt1.y]
                }, {
                    className: "Vector2",
                    data: [this.fromPt2.x, this.fromPt2.y]
                },
                this.name
            ]
        }
    }
}