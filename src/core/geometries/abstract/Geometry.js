import Scene from "../../Scene";

import * as util from "../../helper/util"

import TWEEN from '@tweenjs/tween.js';
import { Vector2 } from "three";
import { markRaw, reactive, watch, ref } from "vue";
import { v4 as uuidv4 } from 'uuid';

export default class Geometry {

    constructor(definition, options = {}) {

        this.isGeometry = true;
        this.isHovered = false;
        this.draggable = true;
        this.isFree = false;

        this.isHoverable = true;
        this.isInteractable = true;
        this.lineIntersectable = false;
        this.definition = definition;

        this.label = undefined;

        this.isValid = ref(false);
        this.visible = false;
        this.constraintFuncs = [];
        this.isSelected = ref(false);

        this.color = Geometry.DEFAULT_COLOR;

        Object.assign(this, options);

        this.isInPathInfo = {};

        this.onDependeeUpdate = undefined;

        this.outlineFactorX = 1;
        this.outlineFactorY = 1;

        this.inScene = false;

        this.dependents = [];
        this.dependees = [];

        this.outlineTween = new TWEEN.Tween();
        this.valueChangeListeners = {};

        this.tmpPt = new Vector2();

        this.constraintFunc = (...args) => {

            for (let func of this.constraintFuncs) {

                if (!func(...args)) {
                    return false;
                }
            }
            return true;
        };

        watch(this.isValid, (newVal, oldVal) => {

            if (newVal) this.tempShow();
            else this.tempHide();
            this.informUpdateToDependents();

        })



    }

    /**
    * 
    * @param {Scene} scene 
    */
    setContext(scene) {

        this.scene = scene;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = scene.ctxGeo;
        this.aniCtrl = scene.animationController;

        this.inScene = true;

        this.setDefinition(this.definition, true);

    
    }

    updateGraphics(){}

    drawWithInstrument(options = {}) {

    }

    stopDrawing() {
    }

    /**
     * 
     * @param {Geometry} item 
     */
    addDependent(item) {

        this.dependents.push(item);
        item.dependees.push(this);

    }

    removeDependent(item) {

        let index = this.dependents.findIndex(ele => ele === item);
        if (index > -1)
            this.dependents.splice(index, 1);

        index = item.dependees.findIndex(ele => ele === this);
        if (index > -1)
            item.dependees.splice(index, 1)

    }

    dependeeUpdated() {

        this.definition.calculateGeoInfo();
        this.informUpdateToDependents();

        if (this.onDependeeUpdate) this.onDependeeUpdate();

    }

    informUpdateToDependents() {

        for (let item of this.dependents) {
            item.dependeeUpdated();
        }

    }

    addConstraintFunc(func) {
        this.constraintFuncs.push(func);
    }

    setColor(color) {
        
    }

    onDragStart(e) { }

    onDrag(e) { }

    onTap(e) {

        this.setSelection(!this.isSelected.value);

    }

    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if (select) {
            this.animateHighlight(true);
        }
        else {
            this.animateHighlight(false);
        }

    }

    isInPath() {
        return false;
    }

    show() {
        this.visible = true;
    }

    hide() {

        this.visible = false;

        if (this.isSelected.value) {
            this.setSelection(false);
            this.scene.selectionManager.updateSelectedItems();
        }

    }

    tempShow() {

        if (!this.visible && !this.isTempHidden) return;
        this.show({ animate: false });
        this.isTempHidden = false;
        return this;
    }

    tempHide() {

        if (!this.visible) return;

        this.hide({ animate: false });
        this.isTempHidden = true;

        return this;
    }

    onPointerEnter() {

        if (this.isHovered) return;

        this.isHovered = true;

        if (!this.isSelected.value) this.animateHighlight(true);

    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;

        if (!this.isSelected.value) this.animateHighlight(false);

    }

    animateHighlight(highlighted) {

        if (!this.indicatorMesh) return;

        if (highlighted) {

            this.outlineTween = this.animate(
                this.outlineTween,
                { factorX: this.indicatorMesh.scale.x, factorY: this.indicatorMesh.scale.y },
                { factorX: this.defaultOutlineFactorX, factorY: this.defaultOutlineFactorY },
                100,
                util.easingSmooth,
                (value) => {
                    this.indicatorMesh.scale.set(value.factorX, value.factorY, 1);
                });
        }
        else {

            this.outlineTween = this.animate(this.outlineTween, { factorX: this.indicatorMesh.scale.x, factorY: this.indicatorMesh.scale.y }, { factorX: 1, factorY: 1 }, 100, util.easingSmooth,
                (value) => {
                    this.indicatorMesh.scale.set(value.factorX, value.factorY, 1);
                });
        }

    }

    onPointerUp() { }

    onDragStart() { }
    onDrag() { }
    onDragEnd() { }

    onPointerMove() { }

    /**
    * 
    * @param {Definition} definition 
    */
    setDefinition(definition, firstTime) {

        if (this.definition && firstTime !== true) {

            this.definition.remove();
        }

        definition.setup(this, this.scene);

        this.definition = definition;
        this.isFree = definition.isFree;
        this.isFixed = definition.isFixed;
        this.isAngleFree = definition.isAngleFree;

        this.definition.calculateGeoInfo();
        this.informUpdateToDependents();

    }

    indicate(options = {}) {

        this.outlineTween = this.animate(this.outlineTween,
            { factor: this.indicatorMesh.scale.x },
            { factor: this.defaultOutlineFactor }, 200, util.easingSmooth,
            (value) => { this.indicatorMesh.scale.set(value.factor, value.factor, 1); }, undefined, () => {
                this.outlineTween = this.animate(this.outlineTween,
                    { factor: this.defaultOutlineFactor },
                    { factor: 1 }, 210, util.easingSmooth,
                    (value) => {
                        this.indicatorMesh.scale.set(value.factor, value.factor, 1);
                    });
            });

        return this;
    }

    animate(tween, from, to, duration, easing, onUpdate, onStart = () => { }, onComplete = () => { }, onStop = () => { }) {

        this.stopTween(tween);

        tween = new TWEEN.Tween(from)
            .to(to, duration)
            .easing(easing)
            .onStart(() => { onStart(); })
            .onUpdate(value => { onUpdate(value); })
            .onComplete(() => {
                onComplete();
                this.scene.animationController.removeAnimation(tween.getId());
            })
            .onStop(() => {
                onStop();
                this.scene.animationController.removeAnimation(tween.getId());
            });

        this.scene.animationController.addAnimation(tween.getId());
        tween.start();

        return tween;

    }

    stopTween(tween) {

        if (this.scene.animationController.isAnimationPlaying(tween.getId())) {

            tween.stop();
        }
    }


    onChange(fieldName, listener) {

        if (!this.valueChangeListeners[fieldName]) this.valueChangeListeners[fieldName] = [];
        this.valueChangeListeners[fieldName].push(listener);
    }


    fireChangeEvent(fieldName, value, oldVal) {

        const listeners = this.valueChangeListeners[fieldName];

        for (let i = 0; i < listeners.length; i++) {
            listeners[i](value, oldVal);
        }
    }


    /**
     * 
     * @param {Geometry} itemToCheck 
     * @param {Geometry} item 
     */
    hasItemInDependencyChain(itemToCheck, item = this) {

        if (item.dependents && item.dependents.length > 0) {

            let childRes = false;
            for (let child of item.dependents) {
                childRes = childRes || this.hasItemInDependencyChain(itemToCheck, child);
            }

            return item.name === itemToCheck.name || childRes;
        }
        else {
            return item.name === itemToCheck.name;
        }
    }

    delete() {

        this.hide();

        this.definition.remove();
        this.scene.remove(this.name);
        this.inScene = false;

    }

    saveState() {
        this.definition.saveState();
    }

    restoreState() {
        this.definition.restoreState();
    }

    getDefinitionDataToExport() {

        // let recoveredObj = JSON.parse(jsonData);

        // const dd = Object.assign;
        // console.log("recoveredObj ", recoveredObj);

        return this.definition.clone();
    }

    getDataToExport() {

        return {}

    }


    getUUID(){
        
        return uuidv4() + "-" + Date.now();
    }

}

Geometry.idCounter = 0;
Geometry.DEFAULT_COLOR = "#111111";
Geometry.HIGHLIGHT_COLOR = "#ff0000";
Geometry.DEFAULT_LINE_WIDTH = 0.06;