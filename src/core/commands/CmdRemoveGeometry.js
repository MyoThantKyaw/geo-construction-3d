import Scene from "../Scene";
import Command from "./abstract/Command";


export default class CmdRemoveGeometry extends Command {

    /**
     * 
     * @param {String} itemName 
     */
    constructor(itemName, name) {

        super();

        this.itemName = itemName;

        this.name = name ? name : this.getUUID();
        this.description = "Removed " + itemName.substring(0, 15);

    }

    /**
     * 
     * @param {Scene} scene 
     * @param {*} options 
     */
    execute(scene, options = {}) {

        this.item = scene.getItemByName(this.itemName);

        this.item.delete();

    }

    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene) {

        // re-create geometry
        scene.add(this.item);
        this.item.show();
        // scene.getItemByName(this.pointName).definition.update(this.fromPoint);

    }

    getDataToExport() {
        return {
            className: this.constructor.name,
            data: [this.itemName, this.name]
        }
    }

}