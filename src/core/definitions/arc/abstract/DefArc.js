import { Vector2 } from "three";
import Definition from "../../abstract/Definition";


export default class DefArc extends Definition{

    constructor(){

        super();

        this.itemCenter = new Vector2();
        this.itemRadius = 0;
        this.itemArcAngle = 0;
        this.itemArcRotationAngle = 0;

        this.withSpecificRadius = false;

    }
}