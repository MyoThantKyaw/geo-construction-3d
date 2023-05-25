import { ref, watch } from "vue";
import Definition from "../../definitions/abstract/Definition";
import Scene from "../../Scene";
import TWEEN from '@tweenjs/tween.js';
import { v4 as uuidv4 } from 'uuid';

export default class GraphicItem {

    /**
     * 
     * @param {Definition} definition 
     */
    constructor(definition) {

        this.definition = definition;
        this.isGraphicItem = true;
        this.color = "#000000";
        this.isInteractable = true;
        this.label = undefined;

        this.isValid = ref(false);
        this.isSelected = ref(false);

        this.inScene = false;
        this.visible = false;

        this.dependees = [];

        this.isHovered = false;
        
        this.isInPathInfo = {};

        this.opacityTween = new TWEEN.Tween();

        watch(this.isValid, (newVal, oldVal) => {

            if (newVal) this.tempShow();
            else this.tempHide();
        })

    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        this.scene = scene;

        this.setDefinition(this.definition, true);
        this.aniCtrl = scene.animationController;
        this.inScene = true;

    }

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
        this.definition.calculateGeoInfo();

    }

    
    onPointerEnter() {

        if (this.isHovered) return;
        this.isHovered = true;

    }

    onPointerOut() {

        if (!this.isHovered) return;

        this.isHovered = false;


    }

    onPointerUp() { }

    onDragStart() { }
    onDrag() { }
    onDragEnd() { }

    onPointerMove() { }

    onTap(e) {

        this.setSelection(!this.isSelected.value);

    }

    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if(select){
            
            if(this.indicatorMesh){
                this.indicatorMesh.visible = true;
            }
            else{
                this.material.color.set("#ff0000")
            }
        }
        else{   
            if(this.indicatorMesh){
                this.indicatorMesh.visible = false;
            }
            else{
                this.material.color.set(this.color)
            }
        }
    }

    show(){}

    hide(){

        this.visible = this.isTempHidden = false;

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

    setColor(){

    }

    tempHide() {

        if (!this.visible) return;
        
        this.hide({ animate: false });
        this.visible = true;
        this.isTempHidden = true;

        return this;
    }


    dependeeUpdated() {}

    delete() {


        this.hide();

        this.definition.remove();
        this.scene.remove(this.name);
        this.inScene = false;
    }

    animate(tween, from, to, duration, easing, onUpdate, onStart = () => { }, onComplete = () => { }, onStop = () => { }) {

        tween = new TWEEN.Tween(from)
            .to(to, duration)
            .easing(easing)
            .onStart(() => {
                onStart();
            })
            .onUpdate(value => {
                onUpdate(value);
            })
            .onComplete(() => {
                onComplete();
                this.aniCtrl.removeAnimation(tween.getId());
            })
            .onStop(() => {
                onStop();
                this.aniCtrl.removeAnimation(tween.getId());
            });

        this.aniCtrl.addAnimation(tween.getId());
        tween.start();

        return tween;

    }

    stopOpacityTween(){

        if (this.aniCtrl.isAnimationPlaying(this.opacityTween.getId())) {
            this.opacityTween.stop();
        }
    }

    isInPath(pt){
        return this.isInPathInfo;
    }

    getUUID(){
        return uuidv4() + Date.now();
    }


}

GraphicItem.DEFAULT_COLOR = "#303030";