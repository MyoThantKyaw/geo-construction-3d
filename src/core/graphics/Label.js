import Definition from "../definitions/abstract/Definition";
import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, ShapeGeometry, Vector2 } from "three";
import Scene from "../Scene";
import GraphicItem from "./abstract/GraphicItem";
import CmdMoveLabel from "../commands/label/CmdMoveLabel";
import { markRaw, warn } from "vue";
import * as util from "../helper/util";
import * as classifyPoint from "robust-point-in-polygon"

export default class Label extends GraphicItem {

    /**
     * 
     * @param {*} content 
     * @param {Definition} definition 
     * @param {*} options 
     */
    constructor(definition, options = {}) {

        super(definition);

        this.text = "";
        this.fontSize = .29;
        this.color = "#222222";

        this.depthTest = true;

        this.isDynamicValue = undefined;
        this.userClasses = "";

        this.hAlign = Label.H_ALIGN_CENTER;
        this.vAlign = Label.H_ALIGN_CENTER;

        this.hOffset = 0;
        this.vOffset = .15;
        Object.assign(this, options);
        
        this.prevPt = new Vector2();

        this.offset3Pt = 13;
        this.angle = 0;
        this.z = .013;
        

        this.material = new MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 1,
            depthTest: this.depthTest,

        });

        this.parentMesh = markRaw(new Mesh(new BufferGeometry(), this.material));
        this.parentMesh.visible = this.visible;

        this.position = this.parentMesh.position;

        this.indicatorMesh  = new Mesh(new BufferGeometry(), new MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: .13,
            depthTest: this.depthTest,
        }));
        this.indicatorMesh.visible = false;
        this.parentMesh.add(this.indicatorMesh);

        this.isLabel = true;
        this.halfWidth = 0;
        this.halfHeight = 0;

        if(!this.name) this.name = "Label - " + this.getUUID();
        if(!this.desc) this.desc=  "Label";

        this.bboxCornorPts = [];

       

    }

    /**
     *  
     * @param {Scene} scene 
     */
    setContext(scene) {

        super.setContext(scene)
        const text = this.text;
        this.text = ""
        this.setText(text);

    }

    updateGeometry(x, y, angle = 0) {

        this.angle = angle;

        this.parentMesh.position.x = x;
        this.parentMesh.position.y = y;
        this.parentMesh.position.z = this.z;
        this.parentMesh.rotation.z = this.angle;

        this.updateBBoxPts();

    }

    onDragStart(e){
        this.definition.onDragStart(e);
        
        this.prevPt.copy(this.position);
    }

    onDrag(e){

        this.definition.onDrag(e);
    }

    onDragEnd(e){

        this.definition.onDragEnd(e);

        this.command = new CmdMoveLabel(this.name, this.position, this.prevPt);
        this.command.execute(this.scene, { alreayExecuted: true });
        this.scene.addCommand(this.command);

    }

    setText(text, forceToUpdate = false) {

        if(this.text === text && !forceToUpdate) return;

        const newGeometry = new ShapeGeometry(Scene.resources.font.generateShapes(text, this.fontSize), 1.9);
        newGeometry.computeBoundingBox();

        this.halfWidth = (newGeometry.boundingBox.max.x - newGeometry.boundingBox.min.x) / 2;
        this.halfHeight = (newGeometry.boundingBox.max.y - newGeometry.boundingBox.min.y) / 2;

        newGeometry.translate(-this.halfWidth, -this.halfHeight, 0);

        this.parentMesh.geometry = newGeometry;
        this.text = text;

        this.indicatorMesh.geometry = new PlaneGeometry(.2 + this.halfWidth * 2, .2 +this.halfHeight * 2);    

        this.definition.calculateGeoInfo(false);

        this.updateBBoxPts();

    }

    setFontSize(fontSize){
        
        this.fontSize = fontSize;
        
        this.setText(this.text, true);
    }

    setHOffset(hOffset){
        
        this.hOffset = hOffset;
        this.dependeeUpdated();
    }

    setVOffset(vOffset){

        this.vOffset = vOffset;
        this.dependeeUpdated();
    }

    setHAlign(hAlign){
        this.hAlign = hAlign;
        this.dependeeUpdated();
    }

    setVAlign(vAlign){
        this.vAlign = vAlign;
        this.dependeeUpdated();
    }

    setIsDynamicValue(isDynamicValue){

        this.isDynamicValue = isDynamicValue;
        this.dependeeUpdated();
    }

    onPointerEnter() {

        if (this.isHovered) return;

        this.isHovered = true;

        if(!this.isSelected.value) {
            this.indicatorMesh.visible = true;
        }

    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;

        if(!this.isSelected.value) {
            this.indicatorMesh.visible = false;
        }

    }

    show(options = {}) {

        if (this.visible && !this.isTempHidden) return;

        if (options.animate) {

            this.parentMesh.visible = this.visible = true;
            this.opacityTween = this.animate(this.opacityTween, { opacity: this.material.opacity }, { opacity: 1 }, 500, util.easingSmooth, (value) => {
                this.material.opacity = value.opacity;
            }, undefined, options.onFinish, options.onStop);

        }
        else {
            this.stopOpacityTween();

            this.parentMesh.visible = this.visible = true;
            this.material.opacity = 1;

        }

        this.isTempHidden = false;
        if (!this.isValid) this.tempHide();

        return this;
    }

    hide(options = {}) {

        if (!this.visible) return;

        super.hide();

        if (options.animate) {

            this.opacityTween = this.animate(this.opacityTween, { opacity: this.material.opacity }, { opacity: 0 }, options.duration || 500, util.easingSmooth, (value) => {
                this.material.opacity = value.opacity;
            }, undefined, options.onFinish, options.onStop);

        }
        else {
            this.stopOpacityTween();
            this.parentMesh.visible = false;
        }


        return this;
    }

    dependeeUpdated() {

        this.definition.calculateGeoInfo();
    }

    indicate() { }

    setColor(color, isTempUpdate =  false) {

        if (color === undefined) {
            color = this.color;
        }

        if(!isTempUpdate){
            this.color = color;
        }

        this.material.color.set(color);
        this.indicatorMesh.material.color.set(color);

    }

    updateBBoxPts() {

        this.bboxCornorPts.length = 0;

        const w = this.halfWidth + 0.1;
        const h = this.halfHeight + 0.1;

        this.bboxCornorPts.push(
            [- w, - h],
            [- w, h],
            [w, h],
            [w, - h]
        );

        for(let pt of this.bboxCornorPts){
            util.rotateVectorArr_(pt, this.angle);
            pt[0] += this.position.x;
            pt[1] += this.position.y;
        }

    }

    isInPath(pt) {

        const res = classifyPoint(this.bboxCornorPts, [pt.x, pt.y]);

        this.isInPathInfo.result = res === -1;

        return this.isInPathInfo


    }
}

Label.H_ALIGN_LEFT = 1;
Label.H_ALIGN_CENTER = 0;
Label.H_ALIGN_RIGHT = -1;

Label.V_ALIGN_TOP = 1;
Label.V_ALIGN_CENTER = 0;
Label.V_ALIGN_BOTTOM = -1;


Label.idCounter = 0;
Label.getNextName = function () {

    return "Label-" + Label.idCounter++;
}