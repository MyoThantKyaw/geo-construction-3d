import Scene from "../../Scene";
import Command from "../abstract/Command";

export default class CmdFlipSideOfLabel extends Command {

    constructor(labelName, name) {

        super();

        this.labelName = labelName;
        this.name = name ? name : this.getUUID();

        this.description = "Flip Side " + labelName.substring(0, 15);
    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {

        const def = scene.getItemByName(this.labelName).definition
        def.flipSide(scene);
        
    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene){
        const def = scene.getItemByName(this.labelName).definition
        def.flipSide(scene);
    }

    getDataToExport() {

        return {

            className: this.constructor.name,
            data: [
                this.labelName, this.name
            ]
        }

    }


}