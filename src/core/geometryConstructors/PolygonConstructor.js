import Point from "../geometries/Point";
import Scene from "../Scene";
import Constructor from "./abstract/Constructor";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import Segment from "../geometries/Segment";
import DefPointWithAngleFromALine from "../definitions/points/DefPointWithAngleFromALine";
import { BoxGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from "three";
import CmdCreateGeometry from "../commands/CmdCreateGeometry";
import ConstructionPoint from "./materials/ConstructionPoint";
import DefPointFree from "../definitions/points/DefPointFree";
import { markRaw, reactive } from "vue";
import Geometry from "../geometries/abstract/Geometry";
import DefSegment2Points from "../definitions/segments/DefSegment2Points";
import Polygon from "../geometries/Polygon";
import DefPolygonWithPoints from "../definitions/polygons/DefPolygonWithPoints";

import * as util from "../helper/util"

export default class PolygonConstructor extends Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        super(scene);
        this.selectableItemsTypes = [Segment];
        this.availableInstruments = [2, 1];

        this.states = reactive({
            inputPanelEnabled: false,
            point1: new ConstructionPoint(),
            isValid: false,
        })
                
        this.vertices = [];
        this.edges = [];
        
        this.lastEdge = this.createEdge({x : 0, y : 0}, { x : 1, y : 1});
        this.lastEdge.visible = false;

        this.previewPolygon = markRaw(new Mesh(new ShapeGeometry(new Shape(), 10),  new MeshBasicMaterial({
            color :this.constructionColor,
            opacity : .1,
            transparent : true
        })));

        this.previewPolygon.position.z = 0.01;
        this.previewPolygon.visible = false;
        scene.add(this.previewPolygon);


        scene.on("Escape:up", () => {

            if (this.active) {

                if (this.states.inputPanelEnabled) {
                    this.exitInputMode();
                }

                this.clearData();
                this.scene.requestRender();

            }
        })

        this.contextMenuHandler = evt => {

            evt.preventDefault();

            this.enterInputMode();

        }

        // const pts = [
        //     [0, 0],
        //     [0, 1],
        //     [2, 3],
        //     [2, 0]
        // ]

        // const ptNames = [];
        // const segNames = [];

        // for(let pt of pts){
        //     const point = new Point(new DefPointFree(pt[0], pt[1]),)
        //     scene.add(point);
        //     point.show()

        //     ptNames.push(point.name);
        // }


        // for(let i = 0; i < ptNames.length; i++){
        //     const segment = new Segment(new DefSegment2Points(
        //         ptNames[i], ptNames[(i + 1) % ptNames.length]
        //     ))

        //     scene.add(segment);
        //     segment.show();

        //     segNames.push(segment.name);
        // }

        // const p = new Polygon(new DefPolygonWithPoints(ptNames, segNames));
        // scene.add(p);
        // p.show();

    }

    enterInputMode() {

        this.states.inputPanelEnabled = true;

        this.inputX.focus();
        this.inputX.select();

        this.scene.requestRender();

    }

    exitInputMode() {

        this.states.inputPanelEnabled = false;

        this.inputX.blur();
        this.inputY.blur();
    }

    onPointerDown(e) {

        // if (this.states.inputPanelEnabled) {

        //     point1.copy(e);
        //     this.exitInputMode();
        //     return;
        // };

        if (e.selectedItem) {

            if (e.selectedItem.isSegment) {

            }
            else if(e.selectedItem.isPoint){

                if(this.vertices[0] && this.vertices[0].name === e.selectedItem.name){
                    // close loop
                    this.createPolygon();
                }
                else{
                    this.createVtxPoint(e.selectedItem.position);        
                }
            }
        }
        else {

            this.createVtxPoint(e);
            
        }


        if(this.vertices.length > 0){
            
            this.previewPolygon.visible = this.lastEdge.visible = true;

            this.updateLastPreviewEdge(e);
            
        }

        this.scene.requestRender();

    }

    onPointerMove(e) {

        // if (this.states.inputPanelEnabled) return;

        // this.hoveredItem = e.hoveredItem;

        if (e.hoveredItem) {

            if(e.hoveredItem.isPoint){
                e.x = e.hoveredItem.position.x;
                e.y = e.hoveredItem.position.y;
            }

        }
        else {
            //
            //            
        }

        if(this.vertices.length > 0){
            this.updateLastPreviewEdge(e);
        }

        // this.states.isValid = true;
        // point1.copy(e);
        // this.updateInputDimensionValues();

    }

    updateLastPreviewEdge(lastPt){

        const shape = new Shape();
        shape.moveTo(this.vertices[0].position.x, this.vertices[0].position.y);

        for(let i = 1; i < this.vertices.length; i++){
            shape.lineTo(this.vertices[i].position.x, this.vertices[i].position.y);
        }

        shape.lineTo(lastPt.x, lastPt.y);

        this.previewPolygon.geometry = new ShapeGeometry(shape);

        const point1 = this.vertices[this.vertices.length - 1].position;
        const point2 = lastPt;

        this.lastEdge.scale.x = util.getDistance(point1, point2);
        this.lastEdge.rotation.z = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        this.lastEdge.position.set(point1.x + Math.cos(this.lastEdge.rotation.z) * (this.lastEdge.scale.x / 2), point1.y + Math.sin(this.lastEdge.rotation.z) * (this.lastEdge.scale.x / 2), 0);

    }

    createVtxPoint(pos) {

        const point = new Point(new DefPointFree(pos.x, pos.y), {
            color: this.constructionColor,
        })

        this.scene.add(point);
        point.show();

        this.vertices.push(point);

        point.isHelperPoint = true;

        if(this.vertices.length >= 2){
            this.edges.push(this.createEdge(this.vertices[this.vertices.length - 2].position, this.vertices[this.vertices.length - 1].position));
        }

        return point;

    }

    createEdge(point1, point2){
        
        const segment = markRaw(new Mesh(
            new BoxGeometry(1, 0.06, 0.013),
            new MeshBasicMaterial({ color: this.constructionColor})
        ));

        segment.scale.x = util.getDistance(point1, point2);
        segment.rotation.z = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        segment.position.set(point1.x + Math.cos(segment.rotation.z) * (segment.scale.x / 2), point1.y + Math.sin(segment.rotation.z) * (segment.scale.x / 2), 0);

        this.scene.add(segment);


        return segment;

    }

    setConstructorToolbar(toolbar) {
        this.inputX = toolbar.$refs.inputOriginX;
        this.inputY = toolbar.$refs.inputOriginY;
    }

    updateInputDimensionValues() {

        // if (this.states.isValid) {
        //     this.inputX.value = point1.x.toFixed(2);
        //     this.inputY.value = point1.y.toFixed(2);
        // }
        // else {
        //     this.inputX.value = "-";
        //     this.inputY.value = "-";;
        // }
    }

    isItemSelectable(item) {
        return item.isPoint;
    }

    createPolygon(){
        
        const cmds = [];

        const pointNames = [];
        const segmentNames = [];

        for(let point of this.vertices){
            if(point.isHelperPoint){
                const cmd = new CmdCreateGeometry(Point, new DefPointFree(point.position.x, point.position.y), {  
                });
                cmds.push(cmd);
                const newPoint = cmd.execute(this.scene);
                pointNames.push(newPoint.name);
            }
        }

        for(let i = 0; i < pointNames.length; i++){
            
            const cmd = new CmdCreateGeometry(Segment, new DefSegment2Points( pointNames[i], pointNames[(i + 1) % this.vertices.length] ),  { });
            cmds.push(cmd);
            const newSeg = cmd.execute(this.scene);
            segmentNames.push(newSeg.name);
        }

        const cmd = new CmdCreateGeometry(Polygon, new DefPolygonWithPoints( pointNames, segmentNames ), { })

        cmd.execute(this.scene);
        cmds.push(cmd);

        this.scene.addCommand(cmds);
        
        this.clearData();
    }

    clearData() {


        for(let vtx of this.vertices){
            vtx.delete();
        }

        for(let edge of this.edges){
           this.scene.remove(edge);
           edge.visible = false;
        }

        this.previewPolygon.visible = this.lastEdge.visible = false;
        this.vertices.length = this.edges.length = 0;

        // this.states.isValid = false; 
        // this.updateInputDimensionValues();

    }


    activate() {

        super.activate();

    }

    deactivate() {

        super.deactivate();

    }

}