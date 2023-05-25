import {Vector2} from "three";
import Scene from "../../Scene";

export default class ConstructionPoint  extends Vector2 {

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Scene} scene 
     */
    constructor(x, y) {

        super(x, y)

        this.active = false;
        this.name = undefined;
    }
   
}
