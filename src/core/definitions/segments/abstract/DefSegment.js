
import Scene from "../../../Scene";
import Point from "../../../geometries/Point";
import Definition from "../../abstract/Definition";

export default class DefSegment extends Definition {

    /**
     * 
     * @param {Point} point1 
     * @param {Point} point2 
     */
    constructor(point1Name, point2Name) {

        super();

        this.point1Name = point1Name;
        this.point2Name = point2Name;

        this.geometryType = "Segment";
    }

    /**
     * 
     * @param {Scene} scene 
     */
    setup(item, scene) {

        super.setup(item, scene);

        this.point1 = scene.getItemByName(this.point1Name);
        this.point2 = scene.getItemByName(this.point2Name);


    }


    isLengthVariable() {

        if (this.point1.isFree && this.point2.isFixed) return true;

        return true;
    }

    
}