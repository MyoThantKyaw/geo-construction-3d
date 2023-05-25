

import Geometry from "./abstract/Geometry"
import * as util from "../helper/util";
import * as geoUtil from "../helper/geoUtil";
import {
    Mesh, CylinderGeometry, MeshBasicMaterial, Vector2, MeshLambertMaterial, SphereGeometry
} from "three";
import DefPointOnIntersection from "../definitions/points/DefPointOnIntersection";
import CmdMovePoint from "../commands/point/CmdMovePoint";
import CmdReplacePointWithOtherPoint from "../commands/point/CmdReplacePointWithOtherPoint";
import CmdChangeDefOfFreePointToOtherDef from "../commands/point/CmdChangeDefOfFreePointToOtherDef";
import DefPointOnSegment from "../definitions/points/DefPointOnSegment";
import { markRaw, } from "vue";


export default class Point extends Geometry {

    constructor(definition, options = {}) {

        super(definition, options);

        this.r = Point.DEFAULT_RADIUS;
        this.defaultR = this.r;
                
        this.isConstructionPoint = false;
        this.outlineFactor = 3.5;

        this.label = "";

        Object.assign(this, options);

        this.defaultOutlineFactor = this.outlineFactor;

        this.outlineFactorX = this.outlineFactorY = 1;
        this.defaultOutlineFactorX = this.defaultOutlineFactorY = 3;

        this.outlineFactor = 0;
        this.selectionTolerance = this.defaultR * 4.2;

        this.isPoint = true;

        const geometry = new CylinderGeometry(this.r, this.r, .012, 20).rotateX(util.PI_BY_2);
        const material = new MeshBasicMaterial({ color: this.color });
        this.pointMesh = markRaw(new Mesh(geometry, material));

        this.parentMesh = markRaw(new Mesh(new CylinderGeometry(this.r * 3, this.r * 3, .012, 20).rotateX(util.PI_BY_2), new MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0})));
        this.parentMesh.position.z = .003;
        this.parentMesh.add(this.pointMesh);

        this.position = this.parentMesh.position;

        // this.parentMesh.material.opacity = 0;
        this.parentMesh.geometry.translate(0, 0, -.001);
        this.parentMesh.material.depthTest = false;

        this.indicatorMesh = markRaw(new Mesh(new CylinderGeometry(this.r, this.r, .012, 20).rotateX(util.PI_BY_2), new MeshBasicMaterial({ color: this.color, transparent: true, opacity: .23 })));
        this.indicatorMesh.material.depthTest = false;
        this.parentMesh.add(this.indicatorMesh);

        this.snappableIntersectionPts = [];

        this.prevPt = new Vector2();
        
        if(!this.name) this.name = "Point - " + this.getUUID();
        if(!this.desc) this.desc= "Point";

        
    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene);

        if (this.isFixed) {
            this.color = "#5f5c5c";
            this.pointMesh.material.color.set(this.color);
            this.indicatorMesh.material.color.set(this.color);
        }

        // this.testPoint = markRaw(new Mesh(new SphereGeometry(.1, 3, 4), new MeshBasicMaterial({ color : 0xf8333f})));
        // scene.add(this.testPoint);

    }

    show() {

        this.parentMesh.visible = this.visible = true;

        return this;
    }

    hide() {

        super.hide();

        this.parentMesh.visible = false;
        return this;
    }

    onDragStart(pt) {

        if (this.isFixed) return;

        this.pointerOffsetFromPosX = this.position.x - pt.x;
        this.pointerOffsetFromPosY = this.position.y - pt.y;

        this.prevPt.copy(this.position);

    }

    onDrag(pt) {

        if (this.isFixed) return;

        this.snappedItemInfo = undefined;

        if (this.isFree && (this.scene.pressedKey === 'd' || this.scene.pressedKey === 'D')) {

            if (this.snappableIntersectionPts.length === 0) {
                geoUtil.getIntersectionPoint(this.scene, this, this.snappableIntersectionPts);
            }

            let minDist = 0.25;

            for (let i = 0; i < this.snappableIntersectionPts.length; i++) {

                const snapItemOrPoint = this.snappableIntersectionPts[i];

                const dist = Math.sqrt(

                    ((snapItemOrPoint.position.x - pt.x) ** 2) +
                    ((snapItemOrPoint.position.y - pt.y) ** 2)
                )
                
                if (dist < minDist) {
                    minDist = dist;
                    this.snappedItemInfo = {
                        snappedItem : snapItemOrPoint,
                        snappedX : snapItemOrPoint.position.x, 
                        snappedY : snapItemOrPoint.position.y 
                    };
                }
            }

            // console.log(this.snappedItemInfo);

            if (this.snappedItemInfo) {
                pt.set(this.snappedItemInfo.snappedX, this.snappedItemInfo.snappedY);
            }
            else {
                // find in points, segments, arc

                if (this.snappedItemInfo = this.findItemToSnap(pt)) {

                    pt.set(this.snappedItemInfo.snappedX, this.snappedItemInfo.snappedY);
                }
                else {
                    pt.set(pt.x + this.pointerOffsetFromPosX, pt.y + this.pointerOffsetFromPosY);
                }

                
            }
        }
        else {

            pt.set(pt.x + this.pointerOffsetFromPosX, pt.y + this.pointerOffsetFromPosY);

        }

        this.constraintFunc(pt);
        this.definition.update(pt);
        this.definition.calculateGeoInfo();
        this.informUpdateToDependents();

        // inform dependents

    }

    updateGeometry(x, y) {

        // do not trigger any events
        this.position.set(x, y, this.position.z);

    }

    setPosition(pos) {

        this.parentMesh.position.set(pos.x, pos.y, this.position.z);
        for (let i = 0; i < this.dependents.length; i++) {
            this.dependents[i].dependeeUpdated();
        }
    }

    onDragEnd(pt) {

        if (this.snappedItemInfo) {
            this.changePointDefinition(this.snappedItemInfo);
        }
        else {
            this.command = new CmdMovePoint(this.name, this.position, this.prevPt);
            this.command.execute(this.scene, { alreayExecuted: true });
            this.scene.addCommand(this.command);
        }

    }

    changePointDefinition(newItemToChangeInfo) {

        let cmd;
        if (newItemToChangeInfo.snappedItem.isGeometry) {

            if (newItemToChangeInfo.snappedItem.isPoint) {
                cmd = new CmdReplacePointWithOtherPoint(this.name, newItemToChangeInfo.snappedItem.name, this.prevPt);
            }
            else if (newItemToChangeInfo.snappedItem.isSegment) {

                const relativePos = util.getDistance({ x: newItemToChangeInfo.snappedX, y: newItemToChangeInfo.snappedY }, newItemToChangeInfo.snappedItem.pt1) / newItemToChangeInfo.snappedItem.getLength()

                cmd = new CmdChangeDefOfFreePointToOtherDef(
                    this.name, this.prevPt,
                    DefPointOnSegment,
                    undefined,
                    newItemToChangeInfo.snappedItem.name, relativePos);
            }

        }
        else if(newItemToChangeInfo.snappedItem.type === "IntersectionPoint"){

            cmd = new CmdChangeDefOfFreePointToOtherDef(
                this.name, this.prevPt,
                DefPointOnIntersection,
                undefined,
                newItemToChangeInfo.snappedItem.item1.name, newItemToChangeInfo.snappedItem.item2.name, newItemToChangeInfo.snappedItem.ptIndex);

        }

        cmd.execute(this.scene);
        this.scene.addCommand(cmd);
        this.scene.requestRender();
    }

    isInPath(pointerPos) {

    
        this.isInPathInfo.distance = Math.sqrt(((this.position.x - pointerPos.x) ** 2) + ((this.position.y - pointerPos.y) ** 2));

        this.isInPathInfo.result = this.isInPathInfo.distance <= .28;

        return this.isInPathInfo;

    }

    findItemToSnap(pt) {

        let minDist = 9999;
        let itemFoundInfo;

        for (let i = this.scene.points.length - 1; i >= 0; i--) {

            const item = this.scene.points[i];

            if (item !== this && item.visible && !this.hasItemInDependencyChain(item)) {
                const pointerCheckInfo = item.isInPath(pt);
                if (pointerCheckInfo.result && pointerCheckInfo.distance < minDist) {

                    itemFoundInfo = {
                        snappedItem : item, 
                        snappedX : item.position.x,
                        snappedY : item.position.y
                    }
                    minDist = pointerCheckInfo.distance;

            
                }
            }
        }

        if (!itemFoundInfo) {

            minDist = 9999;

            for (let i = this.scene.straightLines.length - 1; i >= 0; i--) {

                const item = this.scene.straightLines[i];

                if (item !== this && item.visible && !this.hasItemInDependencyChain(item)) {

                    const pointerCheckInfo = item.isInPath(pt);

                    if (pointerCheckInfo.result && pointerCheckInfo.distance < minDist) {

                        minDist = pointerCheckInfo.distance;
                        itemFoundInfo = {
                            snappedItem : item, 
                            snappedX : pointerCheckInfo.x,
                            snappedY : pointerCheckInfo.y
                        }
    
                    }
                }
            }

        }

        return itemFoundInfo;
    }
    
    setColor(color, isTempUpdate = false){
        
        if (color === undefined) {
            color = this.color;
        }

        if(!isTempUpdate){
            this.color = color;
        }

        this.pointMesh.material.color.set(color);
        this.parentMesh.material.color.set(color);
        this.indicatorMesh.material.color.set(color);

        
    }

    setScale(scaleX, scaleY, scaleZ = 1) {
        this.pointMesh.scale.set(scaleX, scaleY, scaleZ);
    }

    getDataToExport(){

        return {
            className : this.constructor.name,
            defClassName : this.definition.constructor.name,
            options : {
                color : this.color,
                r : this.r,
                name : this.name,
            },
            definitionData : this.definition.getDataToExport(),
        }

    }

}


Point.DEFAULT_RADIUS = .07;