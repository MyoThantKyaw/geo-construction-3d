import {  CylinderGeometry, Mesh, MeshBasicMaterial, Vector2 } from "three";
import Scene from "../../Scene";
import Point from "../../geometries/Point";
import Geometry from "../../geometries/abstract/Geometry";

import { v4 as uuidv4 } from 'uuid';
import {ref} from "vue";
import { watch } from "vue";

export default class IntersectionPoint {

    /**
     * 
     * @param {Scene} scene 
     * @param {*} x 
     * @param {*} y 
     * @param {*} item1 
     * @param {*} item2 
     * @param {*} ptIndex 
     */
    constructor(scene, x, y, item1, item2, ptIndex = 0) {

        this.scene = scene;
        this.position = new Vector2(x, y);

        this.item1 = item1;
        this.item2 = item2;
        this.ptIndex = ptIndex;

        this.isInPathInfo = { distance: 0, result: false };

        this.isHovered = false;
        this.isIntersectionPt = true;
        this.isValid = true;
        this.visible = true;
        this.isFixed = true;
        this.isSelected = ref(false);
        this.color = "#005ebc";

        this.dependents = [];
        this.dependees = [];

        this.name = "Intersection-Point-" + uuidv4();
        this.type = "IntersectionPoint";

        this.mesh = new Mesh(new CylinderGeometry(Point.DEFAULT_RADIUS * 1.02, Point.DEFAULT_RADIUS * 1.02, .015, 20).rotateX(Math.PI / 2), new MeshBasicMaterial({ color: this.color }));
        this.mesh.position.set(x, y, 0);
        this.mesh.visible = false;

        
    

    }

    onPointerEnter() {

        if (this.isHovered) return;
        this.isHovered = true;

        this.mesh.visible = true;

    }

    onTap(){
        this.setSelection(!this.isSelected.value);
    }

    setSelection(select){

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        this.mesh.material.color.set( this.isSelected.value ? Geometry.HIGHLIGHT_COLOR : 0x49f922)
        
        if(!this.isSelected.value && !this.isHovered){
            this.mesh.visible = false;
        }
        else if(this.isSelected.value){
            this.mesh.visible = true;
        }
    }

    onPointerMove(){}

    onPointerOut() {

        if (!this.isHovered) return;
        this.isHovered = false;
        
        if(!this.isSelected.value)
        this.mesh.visible = false;
        
    }

    isInPath(pointerPos) {

        this.isInPathInfo.distance = Math.sqrt(((this.position.x - pointerPos.x) ** 2) + ((this.position.y - pointerPos.y) ** 2));
        this.isInPathInfo.result = this.isInPathInfo.distance <= .3;
        return this.isInPathInfo;
    }

    indicate(){
        
    }

    delete(){

        this.mesh.visible = false;
        this.isSelected.value = false;        
        this.scene.remove(this.mesh);
        
    }
}