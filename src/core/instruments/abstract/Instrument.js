


import TWEEN from '@tweenjs/tween.js';
import { Vector2 } from "three"
import Scene from '../../Scene';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import AnimationController from '../../animation/AnimationController';

import * as util from '../../helper/util'

import {ref} from "vue";

export default class Instrument {

    constructor(options = {}) {

        this.tmpPt = new Vector2();

        this.isHovered = false;
        this.draggable = true;
        this.isInstrument = true;
        this.visible = false;
        this.isSelected = ref(false);
        this.helperVisible = false;
        this.isInteractable = true;
        this.isShowingHelper = false;
        this.type = 0;
        this.movementLocked = false;

        this.isDrawingGeoWithInstrument = false;
        this.optAniFalse = { animate: false };

        this.loader = new GLTFLoader();

        this.onReady = () => { }
        this.listeners = {};

        this.valueChangeListeners = {};
        this.pointer = new Vector2();

        this.selectableMeshes = [];

        this.tempVect2_1 = new Vector2();
        this.tempVect2_2 = new Vector2();
        this.tempVect2_3 = new Vector2();
        this.helperPt = new Vector2();

        this.lineWidth = .06;
        this.halfLineWidth = this.lineWidth / 2;
        this.offsetLineWidth = this.lineWidth - 0.015;

        this.moveTween = new TWEEN.Tween();
        this.opacityTween = new TWEEN.Tween();

    }

    /**
     * 
     * @param {Scene} scene 
     */
    setContext(scene) {

        this.scene = scene;
        /**
         * @type {AnimationController}
         */
        this.aniCtrl = scene.animationController;

        // this.testPoint = new Mesh(new SphereGeometry(.05, 10, 10), new MeshBasicMaterial({ color: 0xdd0000 }));
        // scene.add(this.testPoint);

        // this.testPoint1 = new Mesh(new SphereGeometry(.05, 10, 10), new MeshBasicMaterial({ color: 0x00cc00 }));
        // scene.add(this.testPoint1);
        
        // this.testPoint2 = new Mesh(new SphereGeometry(.05, 10, 10), new MeshBasicMaterial({ color: 0x0000aa }));
        // scene.add(this.testPoint2);

        // this.testPoint.visible = this.testPoint1.visible = this.testPoint2.visible = false;


    }

    onDragStart(e) { }

    onDrag(e) { }

    onDragEnd(e) { }

    render() { }

    updateCursor(e, dragMode) { }

    onTap(e) {

        this.setSelection(!this.isSelected.value);

    }

    setSelection(select) {

        if (this.isSelected.value === select) return;
        this.isSelected.value = select;

        if(select){
            // if(!this.isHovered)

            // this.animateHighlight(true);
                
        }
        else{
            // if(this.isHovered)
            //     this.onPointerOut();
            // else
            // this.animateHighlight(false);
        }

    }

    animate(tween, from, to, duration, easing, onUpdate, onStart = () => { }, onComplete = () => { }, onStop = () => { }) {

        this.stopTween(tween);


        tween = new TWEEN.Tween(from)
            .to(to, duration)
            .easing(easing || TWEEN.Easing.Linear.None)
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

    indicate() { }

    show() {

        this.visible = true;

        if (this.instrumentType !== 'Pencil') {

            this.selectableMeshes.forEach(mesh => {
                this.scene.visibleInstrumentMeshes.push(mesh);
            });
        }

    }

    hide() {

        this.visible = false;

        this.selectableMeshes.forEach(mesh => {

            const index = this.scene.visibleInstrumentMeshes.findIndex(ele => ele === mesh);

            // console.warn(this.constructor.name, index);

            if (index > -1) {
                this.scene.visibleInstrumentMeshes.splice(index, 1);
            }
        });

        if(this.isSelected.value){
            this.setSelection(false);
            this.scene.selectionManager.updateSelectedItems();
        }
    }


    on(eventType, listener) {

        if (this.listeners[eventType] === undefined) {
            this.listeners[eventType] = [];
        }

        this.listeners[eventType].push(listener);

    }

    dispatchEvent(eventType) {

        let listeners = this.listeners[eventType];

        if (listeners) {
            listeners.forEach(listener => {
                listener();
            });
        }

    }

    setGeometry(geoInfo) {

    }

    onPointerEnter(e) {

        this.isHovered = true;
        if (!this.isDrawingGeoWithInstrument)
            this.updateCursor(e);
    }

    onPointerOut() {

        this.isHovered = false;
        this.scene.setCursor("auto");
        this.dragMode = undefined;
    }

    onPointerUp() { }

    onPointerMove(e) {
        if (!this.isDrawingGeoWithInstrument)
            this.updateCursor(e);
    }

    onDragStart(ptCoor) { }
    onDrag(ptCoor) { }
    onDragEnd(ptCoor) {
        this.isPanning = false;
        // this.showHelper(ptCoor)
    }

    isInPath(pxX, pxY) {
        return false;
    }

    updatePxPos() { }

    projectPtToInstrument(ptCoor) {
        return undefined;
    }

    isPtOnInstrument(pt) {
        return undefined;
    }

    isFreeToClick(pxX, pxY) {
        return false;
    }

    delete() {
        this.scene.remove(this);
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

    isUsableWithCurrentConstr() {
        return this.scene.geoConstructor.availableInstruments.find(type => type === this.type);
    }

    updateHelper(pt) {
        return false;
    }

    showHelper() {

        this.helperVisible = true;

        if (this.helperMesh)
            this.helperMesh.visible = true;
    }

    hideHelper() {

        this.helperVisible = false;

        if (this.helperMesh)
            this.helperMesh.visible = false;
    }

    stopMoveTween() {

        if (this.aniCtrl.isAnimationPlaying(this.moveTween.getId())) {

            this.moveTween.stop();
        }
    }

    stopTween(tween) {

        if (this.aniCtrl.isAnimationPlaying(tween.getId())) {

            tween.stop();
        }
    }

    stopOpacityTween() {

        if (this.aniCtrl.isAnimationPlaying(this.opacityTween.getId())) {

            this.opacityTween.stop();
        }
    }

    getCursor() {

        return "cell";

    }

    getNearestPointBetweenTwoInstruments(boundaryPts1, boundaryPts2) {

        let minDist = Infinity;
        let minDistPoint = undefined;

        const pts1Length = boundaryPts1.length /2 ;
        const pts2Length = boundaryPts2.length /2 ;

        for (let j = 0; j < boundaryPts1.length; j += 2) {

            let vertex = { x: boundaryPts1[j], y: boundaryPts1[j + 1] };

            for (let i = 0; i < pts2Length; i++) {

                let pt1 = boundaryPts2[(i * 2) ];
                let pt2 = boundaryPts2[(((i + 1) % pts2Length) * 2)];

                pt1 = { x: boundaryPts2[(i * 2) ], y: boundaryPts2[(i * 2) + 1] };
                pt2 = { x: boundaryPts2[(((i + 1) % pts2Length) * 2)], y: boundaryPts2[(((i + 1) % pts2Length) * 2) + 1] };

                const res = util.getDistFromPtToSegment(vertex, pt1, pt2);

                if (res < minDist) {

                    minDist = res;
                    minDistPoint = vertex;

                }
                else if (res === minDist && res <= 0.01) {
                    // return 'parallel';
                }

            }
        }

        for (let j = 0; j < boundaryPts2.length; j += 2) {

            let vertex = { x: boundaryPts2[j], y: boundaryPts2[j + 1] };

            for (let i = 0; i < pts2Length; i++) {

                let pt1 = boundaryPts1[(i * 2) ];
                let pt2 = boundaryPts1[(((i + 1) % pts1Length) * 2)];

                pt1 = { x: boundaryPts1[(i * 2) ], y: boundaryPts1[(i * 2) + 1] };
                pt2 = { x: boundaryPts1[(((i + 1) % pts1Length) * 2)], y: boundaryPts1[(((i + 1) % pts1Length) * 2) + 1] };

                const res = util.getDistFromPtToSegment(vertex, pt1, pt2);

                if (res < minDist) {

                    minDist = res;
                    minDistPoint = vertex;
                    
                    minDistPoint.otherInstrumentVertex = { x : vertex.x, y : vertex.y}

                }
                else if (res === minDist && res <= 0.01) {
                    // return 'parallel';
                }

            }
        }

        return minDistPoint;

    }

}