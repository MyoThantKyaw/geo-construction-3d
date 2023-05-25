import Scene from "../Scene";
import Command from "./abstract/Command";


export default class CmdHideItem extends Command {

    /**
     * 
     * @param {String} itemName 
     */
    constructor(itemName, name) {

        super();

        this.itemName = itemName;

        this.name = name ? name : this.getUUID();
        this.description = "Hide " + itemName.substring(0, 15);

    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {

        this.item = scene.getItemByName(this.itemName);
        this.item.hide();

    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {

        this.item.show();

    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [this.itemName, this.name]
        }
    }

}