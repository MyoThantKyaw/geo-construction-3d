import Scene from "../../Scene";
import Geometry from "../../geometries/abstract/Geometry";

export default class Definition {

    constructor() {
        this.isFree = false;
        this.isFixed = false;
        this.isAngleFree = false;
    }

    getGeoInfo() {
    }

    calculateGeoInfo() {

    }
    
    onDragStart() { }
    onDrag() { }
    onDragEnd() { }


    /**
     * Update Definition Parameters
     */
    update() { }

    temporaryUpdate() { }

    /**
     * 
     * @param {Geometry} item 
     * @param {Scene} scene 
     */
    setup(item, scene) {
        
        this.item = item;
        this.scene = scene;

        if(this.item.constraintFuncs)
            this.item.constraintFuncs.length = 0;

        this.item.isTemporaryUpdated = false;
    }

    remove() {

        // will clear all dependees of the item
        const dependees = this.item.dependees.slice();
        for (let dependee of dependees) {
            dependee.removeDependent(this.item);
        }
        
    }

    saveState() {

    }

    restoreState() {

    }

    changeItems(itemsToChange) {

        const changedDefItems = {};

        for (let varName in this) {

            const changingItem = itemsToChange.find(ele => ele.from === this[varName]);

            if (changingItem)
                changedDefItems[varName] = changingItem.to;
            else
                changedDefItems[varName] = this[varName];

        }

        return changedDefItems;

    }

    moveTo(toPos){

    }

    rotate(angle){

    }

    clone(){

    }

    getDataToExport(){
        return []
    }
}