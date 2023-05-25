import { Vector2 } from "three";
import Definition from "../../../abstract/Definition";


export default class DefAngle extends Definition {

    constructor(inReverseOrder){

        super();

        this.inReverseOrder = inReverseOrder;

        this.pt1 = new Vector2();
        this.pt2 = new Vector2();
        this.pt3 = new Vector2();

    }

    setOrder(inReverseOrder){
        this.inReverseOrder = inReverseOrder;
        this.item.dependeeUpdated();
    }
    
}