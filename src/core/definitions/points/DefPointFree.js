import Point from "../../geometries/Point";
import { Vector2 } from "three"
import DefPoint from "./abstract/DefPoint";

export default class DefPointFree extends DefPoint {


    constructor(x, y) {

        super();

        this.isFree = true;

        this.position = new Vector2(x, y);
        // this.backupPt = this.position.clone();
        
    }

    /**
     * 
     * @param {Point} item 
     */
    setup(item, scene) {
        super.setup(item, scene);

        item.addConstraintFunc(temptPt => {
            this.position.set(temptPt.x, temptPt.y);
            // console.warn(this.position);
            return true;
        })

        item.position.set(this.position.x, this.position.y);
        this.item.isValid.value = true;
        // console.log(":set set ponit freee");
    }

    calculateGeoInfo() {
        
        this.item.position.set(this.position.x, this.position.y, this.item.position.z);

    }

    getPosition(){
        return this.position.clone();
    }

    update(pt) {
        this.position.copy(pt);
        this.item.dependeeUpdated();
    }

    updateXY(x, y) {

        this.position.set(x, y);
        // this.item.informUpdateToDependents();
        this.item.dependeeUpdated();
    }

    /**
    * 
    * @param {*} itemToChange e.g [ {from : existingItem, to : newItem }, {}, ..]
    */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPointFree(newDefItems.position.x, newDefItems.position.y);
        this.item.setDefinition(newDef);
    }
    
    // /**
    //  * 
    //  * @param {Vector2} toPt 
    //  */
    // applyMove(toPt){
    //     this.position.set(pt.x, pt.y);
    // }

    clone(){

        
        const newDef = new DefPointFree(this.position.x, this.position.y);
        return newDef;
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.position.x, this.position.y]
        }
    }
}