import { markRaw, reactive, warn } from "vue";
import CommandGroup from "../commands/CommandGroup";
import Scene from "../Scene";
import ConstructionStep from "./ConstructionStep";

import TWEEN from '@tweenjs/tween.js';
import CmdReplacePointWithOtherPoint from "../commands/point/CmdReplacePointWithOtherPoint";
import Command from "../commands/abstract/Command";

export default class ConstructionStepManager {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {


        this.scene = scene;
        this.sceneStates = scene.states;

        this.states = reactive({

            animatingStepIndex: undefined,
            animatingGroupIndex: undefined,
            currentStepIndex: undefined,
            currentGroupIndex: undefined,
            playMode: undefined,
            playing: false,
            descEditingStepIndex: undefined,
            descEditingGroupIndex: undefined,

        })

        this.sceneStates.constructionSteps.push(new ConstructionStep(scene, this));

        /**
         * @type {Array<ConstructionStep>}
         */
        this.steps = this.sceneStates.constructionSteps;
        this.validSteps = reactive([]);

        this.animationCommandsStack = this.sceneStates.animationCommandsStack;

        this.updateGroupStatus()
    }

    clearAll(){

        this.exitPlayMode();
        this.validSteps.length = 0;
        this.states.animatingStepIndex = undefined;
        this.states.animatingGroupIndex = undefined
        this.states.currentStepIndex = undefined;
        this.states.currentGroupIndex = undefined;
        this.states.playMode = undefined;
        this.states.playing = false;
        this.states.descEditingStepIndex = undefined;
        this.states.descEditingGroupIndex = undefined;

        
    }
    
    /**
     * 
     * @param {CommandGroup} newCommandGroup 
     */
    newCommandGroupAdded(newCommandGroup) {

        // append of
        let lastStep = this.steps[this.steps.length - 1];

        if (lastStep === undefined) {

            const newStep = new ConstructionStep(this.scene, this);
            this.sceneStates.constructionSteps.push((newStep));
            lastStep = newStep;
        }

        lastStep.addCommandGroupName({
            name : newCommandGroup.name,
            isValid : true,
        });

    }

    removeDeletedGroups(){

        const stepsCopy = this.steps.slice();

        for(let step of stepsCopy){

            const namesInfoCopy = step.commandGroupNames.slice();

            for(let groupNameInfo of namesInfoCopy){
                
                if(!this.sceneStates.allCommandStack.find(ele => ele.name === groupNameInfo.name)){
                    const idx = step.commandGroupNames.findIndex(ele => ele.name === groupNameInfo.name)
                    step.commandGroupNames.splice(idx, 1);
                }
            }

            if(!step.isValid){
                const idx = this.steps.findIndex(ele => ele === step);
                this.steps.splice(idx, 1);
            }

        }
    }

    constructionRemoved(removeIndexStart) {

    }

    addNewStep() {

        const lastStep = this.steps[this.steps.length - 1];
        // lastStep.setEndGroupIndex(this.sceneStates.animationCommandsStack.length - 1);

        if (!lastStep || (lastStep && lastStep.commandGroupNames.length !== 0)) {
            const newStep = new ConstructionStep(this.scene, this);
            this.sceneStates.constructionSteps.push(newStep);
        }

        this.updateGroupStatus();

        this.scene.constructionStepView.scrollToStep(this.validSteps.length - 1, {
            waitToUpdate: true,
            align: "bottom",
            duration: Math.max(this.validSteps.length * 300, 1000)
        });

    }

    removeStep(step) {

        const index = this.sceneStates.constructionSteps.findIndex(ele => ele === step);
        this.sceneStates.constructionSteps.splice(index, 1);

        this.updateGroupStatus();
        
    }

    drawSingleGroup(stepIndex, groupIndexInStep, e) {

        e.stopPropagation();

        this.scene.setMode('play');

        this.states.playMode = "group";

        this.hideGeosToDraw(stepIndex, groupIndexInStep);
        this.highlightGeometries(-1, -1);
        this.scene.requestRender();

        this.states.animatingStepIndex = stepIndex;
        this.states.animatingGroupIndex = groupIndexInStep;

        this.states.currentStepIndex = stepIndex;
        this.states.currentGroupIndex = groupIndexInStep;

        this.states.currentStepIndex = stepIndex;

        this.validSteps[stepIndex].draw(groupIndexInStep, {

            stepIndex: stepIndex,
            singleGroup: true,
            onFinish: () => {

                this.states.animatingStepIndex = undefined;
                this.states.animatingGroupIndex = undefined;

                this.highlightGeometries(stepIndex, groupIndexInStep);

                // if (options.onFinish) options.onFinish();

            },
            onStop: () => {

                this.states.animatingStepIndex = undefined;
                this.states.animatingGroupIndex = undefined;

                // if (options.onStop) options.onStop();
            }
        })

    }

    playFinished() {

        if (this.states.playMode === 'all') {

            this.clearIndices();

        }
        else if (this.states.playMode === 'step') {

            this.hideGeosToDraw(this.states.currentStepIndex + 1, undefined);
            this.highlightGeometries(this.states.currentStepIndex, undefined);

            this.states.animatingStepIndex = this.states.animatingGroupIndex = this.states.currentGroupIndex = undefined;

        }

        this.states.playMode = undefined;

    }

    drawParticularStep(stepIndex, e) {

        e.stopPropagation();

        this.scene.setMode('play');
        this.stopPlaying();

        this.lastConstructionStep = stepIndex;
        this.hideGeosToDraw(stepIndex, 0);

        this.states.playMode = "step";
        this.highlightGeometries(-1, -1);

        this.scene.requestRender();

        this.drawStep(stepIndex, {

            onFinish: () => {

                this.playFinished();

            },
            onStop: () => {
                // this.clearIndices();
            }
        });
    }

    drawAllSteps() {
        
        this.scene.setMode('play');

        this.stopPlaying();

        this.lastConstructionStep = this.validSteps.length - 1;

        this.states.playMode = "all";
        this.highlightGeometries(-1, -1);
        this.hideGeosToDraw();

        this.scene.requestRender();

        this.drawStep(0, {

            onFinish: () => {
                this.playFinished();
            },
            onStop: () => {
                this.clearIndices();
            }
        });

    }

    goToCommandGroupInStep(stepIndex, groupIndex, e) {


        e.stopPropagation();

        this.scene.setMode('play');

        this.stopPlaying();

        this.states.animatingStepIndex = undefined;
        this.states.animatingGroupIndex = undefined;

        this.states.currentStepIndex = stepIndex;
        this.states.currentGroupIndex = groupIndex;

        this.hideGeosToDraw(stepIndex, groupIndex + 1);
        this.highlightGeometries(stepIndex, groupIndex);

        this.scene.requestRender();

    }

    goToParticularStep(stepIndex) {

        this.scene.constructionStepView.scrollToStep(stepIndex,  {
            align: "bottom",
        });

        this.scene.setMode('play');

        this.stopPlaying();

        this.states.animatingStepIndex = undefined;
        this.states.animatingGroupIndex = undefined;

        this.states.currentStepIndex = stepIndex;
        this.states.currentGroupIndex = undefined;

        this.hideGeosToDraw(stepIndex + 1, undefined);
        this.highlightGeometries(stepIndex, undefined);

        this.scene.requestRender();

    }

    showCompleteSteps() {

        this.scene.setMode('play');
        this.stopPlaying();

        this.clearIndices();
        this.hideGeosToDraw(this.validSteps.length);
        this.highlightGeometries(-1, -1);

        this.scene.requestRender();
    }

    stopPlaying() {

        if (this.states.playMode === undefined) return;

        if (this.states.playMode === 'all') {

            this.clearIndices();
            this.highlightGeometries(-1, -1);
            this.hideGeosToDraw(99999);

        }
        else if (this.states.playMode === 'step') {

            this.states.animatingStepIndex = this.states.animatingGroupIndex = undefined;

            this.highlightGeometries(this.states.currentStepIndex, undefined, true);
            this.hideGeosToDraw(this.states.currentStepIndex + 1,);

            this.states.currentGroupIndex = undefined;

            // this.clearIndices();
        }

        this.scene.waitTween.stop();
        this.scene.pencil.stopMoveTween();
        this.scene.ruler.stopMoveTween();
        this.scene.compass.stopMoveTween();
        this.scene.setSquare45.stopMoveTween();


        this.states.playMode = undefined;

        if (this.scene.pencil.visible) this.scene.pencil.hide({ toGoToRestingPosition: true });
        if (this.scene.ruler.visible) this.scene.ruler.hide({ toGoToRestingPosition: true });
        if (this.scene.compass.visible) this.scene.compass.hide({ toGoToRestingPosition: true });
        if (this.scene.protractor.visible) this.scene.protractor.hide({ toGoToRestingPosition: true });
        if (this.scene.setSquare45.visible) this.scene.setSquare45.hide({ toGoToRestingPosition: true });


    }

    clearIndices() {

        this.states.animatingStepIndex = undefined;
        this.states.animatingGroupIndex = undefined;

        this.states.currentStepIndex = undefined;
        this.states.currentGroupIndex = undefined;

    }

    // removeAllDeletedCommands() {

    //     this.steps.forEach(step => {
    //         step.removeDeletedCommandNames();
    //     });

    //     const stepsCopy = this.steps.slice();

    //     for (let step of stepsCopy) {

    //         if (!step.isValid) {

    //             const index = this.steps.findIndex(ele => ele.id === step.id);

    //             if (index > -1) {
    //                 this.steps.splice(index, 1);
    //             }

    //         }

    //     }

    //     if (this.steps.length === 0) {
    //         this.addNewStep();
    //     }

    // }

    enterPlayMode() {

        // console.log("enterPlayMode ");

        this.scene.items.forEach(item => {
            // console.log('item.visible ', item.visible, item);
            item.hiddenInitially = !item.visible || item.isTempHidden;
            // console.log('item.hiddenInitially  ', item.hiddenInitially );
        });

        this.clearIndices();

    }

    exitPlayMode() {

        this.clearIndices();
        this.highlightGeometries(-1, -1);
        this.hideGeosToDraw(99999);


    }

    drawStep(index, options = {}) {

        if (!this.validSteps[index].isValid) {
            return options.onFinish();
        }

        this.states.animatingStepIndex = index;
        this.states.currentStepIndex = index;

        this.scene.constructionStepView.scrollToStep(index, {
            duration: 2000,
            align: "bottom",
        });

        this.validSteps[index].draw(0, {
            stepIndex: index,
            nextStep: (index + 1) <= this.lastConstructionStep ? this.validSteps[index + 1] : undefined,
            onFinish: () => {

                if (index < this.lastConstructionStep) {
                    this.drawStep(index + 1, options);
                }
                else {
                    if (options.onFinish) options.onFinish();
                }

            },
            onStop: options.onStop,

        })
    }

    highlightGeometries(stepIndex, rowIndex, geosAreHidden = false) {

        for (let i = this.validSteps.length - 1; i >= 0; i--) {

            for (let j = this.validSteps[i].commandGroupNames.length - 1; j >= 0; j--) {

                const geoDrawer = this.sceneStates.animationCommandsStack.find(ele => ele.name === this.validSteps[i].commandGroupNames[j].name);

                if (!geoDrawer) continue;

                if ((rowIndex === undefined && i === stepIndex) || (i === stepIndex && j === rowIndex)) {

                    geoDrawer.geoToDraw.setColor(0xff0000, true);

                    geoDrawer.geosToShow.forEach(geo => {
                        if (!geo.visible && !geosAreHidden) {
                            geo.setColor(undefined, true);
                        }
                        else {
                            geo.setColor(0xff0000, true);
                        }
                    });

                }
                else {

                    geoDrawer.geoToDraw.setColor(undefined, true);
                    geoDrawer.geosToShow.forEach(geo => {
                        geo.setColor(undefined, true);

                    });

                }

            }
        }

    }

    hideGeosToDraw(stepIndex = 0, rowIndex = undefined) {

        for (let i = this.validSteps.length - 1; i >= 0; i--) {

            for (let j = this.validSteps[i].commandGroupNames.length - 1; j >= 0; j--) {

                const geoDrawer = this.sceneStates.animationCommandsStack.find(ele => ele.name === this.validSteps[i].commandGroupNames[j].name);

                if (!geoDrawer) continue;

                if (rowIndex !== undefined) {

                    if (i < stepIndex) {

                        if (!geoDrawer.geoToDraw.hiddenInitially)
                            geoDrawer.geoToDraw.show();

                        geoDrawer.geosToShow.forEach(geo => {
                            
                            if (!geo.hiddenInitially) {
                                geo.show();
                            }
                        });

                    }
                    else if (i > stepIndex) {

                        if(!geoDrawer.isTempHidden)
                            geoDrawer.geoToDraw.hide();

                        geoDrawer.geosToShow.forEach(geo => {
                            if(!geo.isTempHidden)
                                geo.hide();
                        });

                    }
                    else {

                        if (j < rowIndex) {

                            if (!geoDrawer.geoToDraw.hiddenInitially)
                                geoDrawer.geoToDraw.show();

                            geoDrawer.geosToShow.forEach(geo => {
                                
                                if (!geo.hiddenInitially) {
                                    geo.show()
                                }
                            });

                        }
                        else {

                            if(!geoDrawer.isTempHidden)
                                geoDrawer.geoToDraw.hide();

                            geoDrawer.geosToShow.forEach(geo => {
                                if(!geo.isTempHidden)
                                    geo.hide();
                            });

                        }
                    }


                }
                else {

                    if (i < stepIndex) {

                        if (!geoDrawer.geoToDraw.hiddenInitially)
                            geoDrawer.geoToDraw.show();

                        geoDrawer.geosToShow.forEach(geo => {
                            if (!geo.hiddenInitially) geo.show();
                        });

                    }
                    else {

                        if(!geoDrawer.geoToDraw.isTempHidden)
                            geoDrawer.geoToDraw.hide();

                        geoDrawer.geosToShow.forEach(geo => {
                            if(!geo.isTempHidden)
                                geo.hide();
                        });

                    }
                }

            }

        }
    }

    updateGroupStatus() {

        this.validSteps.length = 0;

        for(let i = 0; i < this.steps.length; i++){

            const step = this.steps[i];

            step.updateValidityStatus();
            if(step.isValid || (i === this.steps.length - 1 && step.commandGroupNames.length === 0)) this.validSteps.push(step);

        }

    }

    // wait(duration = 200, options = {}) {

    //     this.waitTween = new TWEEN.Tween({ t: 0 })
    //         .to({ t: 1 }, duration)
    //         .onComplete(() => {
    //             this.scene.animationController.removeAnimation(this.waitTween.getId());
    //             options.onFinish();

    //         })
    //         .onStop(() => {
    //             this.scene.animationController.removeAnimation(this.waitTween.getId());
    //             if (options.onStop) options.onStop();
    //         })

    //     this.scene.animationController.addAnimation(this.waitTween.getId());
    //     this.waitTween.start();

    // }
}