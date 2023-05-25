import Scene from "../Scene";
import Command from "./abstract/Command";

export default class CmdSetProperty extends Command {

    /**
     * 
     * @param {String} itemName 
     */
    constructor(itemName, propertyName, newVal, oldVal, name) {

        super();

        this.itemName = itemName;
        this.propertyName = propertyName;
        this.newVal = newVal;
        this.oldVal = oldVal;

        this.name = name ? name : this.getUUID();
        this.description = "Set " + this.capitalize(this.propertyName) + " of " + this.itemName.substring(0, 15);;

    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {

        this.item = scene.getItemByName(this.itemName);
        this.item["set" + this.capitalize(this.propertyName)](this.newVal);
        this.item.dependeeUpdated();

    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {
        
        this.item["set" + this.capitalize(this.propertyName)](this.oldVal);
        this.item.dependeeUpdated();
    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [this.itemName, this.propertyName, this.newVal, this.oldVal, this.name]
        }
    }

    /**
     * 
     * @param {String} str 
     * @returns 
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

}