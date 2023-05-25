import { Vector2 } from "three";
import Command from "../abstract/Command";


export default class CmdMoveLabel extends Command {

    /**
     * @param {String} labelName 
     * @param {Vector2} toPt 
     * @param {Vector2} fromPoint 
     */
    constructor( labelName, toPt, fromPoint, name) {

        super();

        this.labelName = labelName;
        this.toPt = toPt.clone();
        this.fromPoint = fromPoint.clone();
        this.name = name ? name : this.getUUID();

        this.type = "Transform";
        this.description = labelName.substring(0, 15) + " ကို ရွှေ့သည်";

    }

    /**
     * 
     * @param {*} options 
     */
    execute(scene, options = {}) {
        
        if(options.alreayExecuted !== true){
        
            scene.getItemByName(this.labelName).definition.update(this.toPt);
        }


    }

    undo(scene) {

        // move point to previous position
        scene.getItemByName(this.labelName).definition.update(this.fromPoint);
        
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [
                this.labelName, {
                    className : "Vector2",
                    data : [
                        this.toPt.x, this.toPt.y
                    ]
                }, {
                    className : "Vector2",
                    data : [
                        this.fromPoint.x, this.fromPoint.y
                    ]
                },
                this.name
            ]
        }
        
    }

}