import Scene from "../../../Scene";
import { Vector2 } from "three";
import Label from "../../../graphics/Label";
import Definition from "../../abstract/Definition";
// import Label from "../../../graphics/Label";


export default class DefLabel extends Definition {

    constructor() {
        super();

        this.rotateAlongLine = true;
        this.position = new Vector2();
    }
    /**
      * 
      * @param {Label} item 
      * @param {Scene} scene 
      */
    setup(item, scene) {
        
        /**
         * @type {Label}
         */
        this.item = item;
        this.scene = scene;

    }


    updateLabelValue(){
        
    }


}