import Scene from "../Scene";
import Command from "./abstract/Command";

export default class CmdChangeProperty extends Command {

    /**
     * 
     * @param {String} itemName 
     */
    constructor(itemName, propertyName, oldVal, newVal, name) {

        super();

        this.itemName = itemName;
        this.propertyName = propertyName;
        this.oldVal = oldVal;
        this.newVal = newVal;

        this.name = name ? name : this.getUUID();
        // this.description = "Removed " + itemName;

    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {

        this.item = scene.getItemByName(this.itemName);
        this.item[this.propertyName] = this.newVal;
        this.item.dependeeUpdated();
    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {
        this.item[this.propertyName] = this.oldVal;
        this.item.dependeeUpdated();
    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [this.itemName, this.propertyName, this.oldVal, this.newVal, this.name]
        }
    }

}