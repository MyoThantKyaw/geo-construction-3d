import { Vector2 } from "three";
import Command from "../abstract/Command";
import Scene from "../../Scene";


export default class CmdMovePoint extends Command {

    /**
     * @param {String} pointName 
     * @param {Vector2} toPt 
     * @param {Vector2} fromPoint 
     */
    constructor( pointName, toPt, fromPoint, name) {

        super();

        this.pointName = pointName;
        this.toPt = toPt.clone();
        this.fromPoint = fromPoint.clone();

        this.type = "Transform";

        this.name = name ? name : this.getUUID();

        this.description = pointName.substring(0, 15) + " ကို ရွှေ့သည်";

    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {
        
        if(options.alreayExecuted !== true){

            scene.getItemByName(this.pointName).definition.update(this.toPt);
            
        }

        this.description = this.pointName.substring(0, 15)  + " ကို ရွှေ့သည်";
        

    }

    undo(scene) {

        // move point to previous position
        scene.getItemByName(this.pointName).definition.update(this.fromPoint);
        
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [
                this.pointName, {
                    className : "Vector2",
                    data : [ this.toPt.x, this.toPt.y ]
                }, {
                    className : "Vector2",
                    data : [ this.fromPoint.x, this.fromPoint.y]
                },
                this.name
            ]
        }
        
    }

}