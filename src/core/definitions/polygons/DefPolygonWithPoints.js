

import DefPolygon from "./abstract/DefPolygon";
import Polygon from "../../geometries/Polygon";
import Scene from "../../Scene";

export default class DefPolygonWithPoints extends DefPolygon {

    /**
     * 
     * @param {Array<String>} pointNames 
     * @param {Array<String>} segmentNames 
     */
    constructor(pointNames, segmentNames) {

        super();

        this.pointNames = pointNames.slice();
        this.segmentNames = segmentNames.slice();

        this.points = [];

    }

    /**
     * 
     * @param {Polygon} item 
     * @param {Scene} scene 
     */
    setup(item, scene) {

        super.setup(item, scene);

        this.points.length = 0;
        this.item.pts.length = 0;

        for(let ptName of this.pointNames){
            const point = scene.getItemByName(ptName);
            this.points.push(point);
            point.addDependent(item);
            this.item.pts.push([]);
        }

        for(let segName of this.segmentNames){
            const segment = scene.getItemByName(segName);
            
            segment.addDependent(item);

        }

        this.panOffsets = [];

    }

    calculateGeoInfo() {

        for(let i = 0; i < this.points.length; i++){
            this.item.pts[i][0] = this.points[i].position.x;
            this.item.pts[i][1] = this.points[i].position.y;
        }
        
        this.item.updateGraphics();

        this.item.isValid = true;

        // this.item.isValid = this.point1.isValid && this.point2.isValid;

    }

    /**
     * 
     * @param {*} itemToChange e.g [ {from : existingItemName, to : newItemName }, {}, ..]
     */
    changeItems(itemsToChange) {

        const newDefItems = super.changeItems(itemsToChange);
        const newDef = new DefPolygonWithPoints(newDefItems.pointNames, newDefItems.segmentNames)
        this.item.setDefinition(newDef);

    }

    onDragStart(pt) {

        for(let i = 0; i < this.points.length; i++){
            this.panOffsets[i] = [ pt.x - this.points[i].position.x, pt.y - this.points[i].position.y ]
        }
    }

    onDrag(pt) {
        
        for(let i = 0; i < this.points.length; i++){
            if (this.points[i].definition.isFree)
              this.points[i].definition.updateXY(pt.x - this.panOffsets[i][0], pt.y - this.panOffsets[i][1]);
        }
    }

    clone() {
        return new DefPolygonWithPoints(this.pointNames, this.segmentNames);
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [this.pointNames, this.segmentNames],
        }
    }
}
