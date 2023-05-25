import Scene from "../Scene";
import Command from "./abstract/Command"


export default class CmdSetColor extends Command {

    /**
     * 
     * @param {String} itemName 
     * @param {Array<*>} params 
     * @param {*} params 
     */
    constructor(itemName, newColor, prevColor, name) {

        super();

        this.itemName = itemName;
        this.newColor = newColor;
        this.prevColor = prevColor;

        this.name = name ? name : this.getUUID();

        this.description = "Change color from " + prevColor + " to " + newColor;

    }

    /**
     * 
     * @param {Scene} scene 
     * @returns 
     */
    execute(scene, options = {}) {

        this.item = scene.getItemByName(this.itemName);
        this.item.setColor(this.newColor);

    }

     /**
     * 
     * @param {Scene} scene 
     */
     undo(scene){

        this.item.setColor(this.prevColor);

    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [
                this.itemName,
                this.newColor,
                this.prevColor,
                this.name
            ]
        }
    }

    
}