
import { BufferGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, TorusGeometry, Vector2 } from "three";
import Geometry from "./abstract/Geometry";
import Definition from "../definitions/abstract/Definition";
import { markRaw } from "vue";
import * as util from "../helper/util"

export default class Arc extends Geometry {

    /**
     * 
     * @param {Definition} definition 
     * @param {*} options 
     */
    constructor(definition, options = {}) {

        super(definition, options);

        this.lineWidth = 0.06;
        this.phase = 1;

        this.isArc = true;
        this.isLine = true;
        this.isCircularCurve = true;
        this.lineIntersectable = true;

        this.arcAngle = 1;
        this.radius = 1;
        this.arcRotationAngle = 0;
        this.centerPt = new Vector2();

        this.radius = this.arcRotationAngle = 0;

        this.material = new MeshBasicMaterial({
            color: this.color,
        });

        this.parentMesh =  markRaw(new Mesh(
            new TorusGeometry(4, .1, 16, 100),
            this.material
        ));

        this.indicatorMesh = markRaw(new Mesh(
            new BufferGeometry(),
            new MeshBasicMaterial({
                color : this.color,
                transparent : true,
                opacity : .2,
            })
        ))

        this.indicatorMesh.visible = false;

        this.parentMesh.add(this.indicatorMesh);

        if(!this.name) this.name = "Arc - " + this.getUUID();
        if(!this.desc) this.desc= "Arc";

    }

    onPointerEnter() {

        if (this.isHovered) return;

        this.isHovered = true;

        if (!this.isSelected.value) {
            this.indicatorMesh.visible = true;
        }
    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;

        if (!this.isSelected.value){
            this.indicatorMesh.visible = false;
        }
    }

    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if (select) {
            this.indicatorMesh.visible = true;
        }
        else {
            this.indicatorMesh.visible = false;

        }

    }

    show() {

        super.show();

        this.parentMesh.visible = this.visible = true;
        return this;
    }

    hide() {

        super.hide();
        
        this.parentMesh.visible = this.visible = false;
        return this;
    }

    updateGeometry(center, radius, arcAngle, arcRotationAngle) {

        if (this.radius !== radius || this.arcAngle !== arcAngle || this.arcRotationAngle !== arcRotationAngle) {

            this.arcAngle = arcAngle;
            this.radius = radius;
            this.arcRotationAngle = arcRotationAngle;

            this.parentMesh.geometry = new TorusGeometry(radius, this.lineWidth / 2, 2, parseInt(arcAngle * 33) + 1, arcAngle)
            this.parentMesh.rotation.z = arcRotationAngle;

            this.indicatorMesh.geometry = new TorusGeometry(radius, (this.lineWidth * 1.5) +( this.lineWidth / 2), 2, parseInt(arcAngle * 33) + 1, arcAngle);

        }

        this.centerPt.copy(center);
        this.parentMesh.position.set(center.x, center.y, 0.008);

    }

    setColor(color, isTempUpdate = false){
        
        if (color === undefined) {
            color = this.color;
        }

        if(!isTempUpdate){
            this.color = color;
        }

        this.material.color.set(color);
        this.indicatorMesh.material.color.set(color);

    }

    isPtOnArc(pt){

        const ptAngle = util.getAngle2Pts(this.centerPt, pt);
        
        return util.getAngleDifference(this.arcRotationAngle, ptAngle) <= this.arcAngle;

    }

    isInPath(pt){

        const angleDiff = util.getAngleDifference(
            this.arcRotationAngle, 
            util.getAngle2Pts(this.centerPt, pt)
        )

        this.isInPathInfo.distance = Math.abs(util.getDistance(this.centerPt, pt) - this.radius)
        this.isInPathInfo.result = this.arcAngle >= angleDiff && this.isInPathInfo.distance < .3;
            
        return this.isInPathInfo;
    }

}

