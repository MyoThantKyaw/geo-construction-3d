import Scene from "../Scene";
import TWEEN from '@tweenjs/tween.js';

import { reactive } from "vue";
import ConstructionStepManager from "./ConstructionStepManager";
import GeometryDrawer from "./GeometryDrawer";
const mmNums = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

export default class ConstructionStep {

    /**
     * 
     * @param {Scene} scene 
     * @param {ConstructionStepManager} stepManager 
     */
    constructor(scene, stepManager) {

        this.scene = scene;
        this.stepManager = stepManager;
        // this.sceneStates.commandsStack = this.sceneStates.commandsStack;

        this.sceneStates = this.scene.states;

        this.isValid = false;

        // this.description = "အဆင့် (၁) " + Math.random().toFixed();

        this.animatingDrawing = false;
        this.description = ""

        this.commandGroupNames = reactive([]);
        this.validCommandGroupNames = reactive([]);

        this.id = "ConstructionStep-" + ConstructionStep.idCounter++;

    }

    addCommandGroupName(name) {

        if (this.commandGroupNames.find(ele => ele.name === name.name)) return;

        this.commandGroupNames.push(name);
        this.updateValidityStatus();

    }

    insertCommandGroupName(index, commandGroupName) {

        this.commandGroupNames.splice(index, 0, commandGroupName);
        this.isValid = this.commandGroupNames.length !== 0;

        console.warn("this.commandGroupNames ", this.commandGroupNames);

    }

    getCommandGroupsToDraw() {

        const groups = [];

        this.commandGroupNames.forEach(nameInfo => {
            const group = this.sceneStates.animationCommandsStack.find(ele => ele.name === nameInfo.name);

            if (group) {
                groups.push(group);
            }

        });

        return groups;

    }

    removeCommandGroupName(group) {

        const index = this.commandGroupNames.findIndex(ele => ele.name === group.name);
        this.commandGroupNames.splice(index, 1);

        if (this.commandGroupNames.length === 0) {
            this.stepManager.removeStep(this);
        }

        this.isValid = this.commandGroupNames.length !== 0;

    }

    draw(groupIndexInStep = 0, options = {}) {

        this.animatingDrawing = true;

        /**
         * @type {[GeometryDrawer, ]}
         */
        const [drawer, indexInAniStack] = this.getCommandGroupInAniStack(groupIndexInStep);

        const animate = () => {

            const [nextCommandGroupInAniStack, _] = this.getCommandGroupInAniStack(groupIndexInStep + 1);

            drawer.animate({
                nextGroup: options.singleGroup ? undefined : nextCommandGroupInAniStack,
                nextStep: options.singleGroup ? undefined : options.nextStep,
                onFinish: () => {

                    // this.scene.goToCommandHistory(indexInAniStack);

                    if (!drawer.geoToDraw.hiddenInitially)
                        drawer.geoToDraw.show();

                    drawer.geosToShow.forEach(geo => {
                        if (!geo.hiddenInitially) geo.show();
                    })

                    if (!options.singleGroup && nextCommandGroupInAniStack) {
                        this.draw(groupIndexInStep + 1, options);
                    }
                    else {
                        this.animatingDrawing = false;

                        // if(groupIndexInStep === this.validCommandGroupNames.length - 1){
                        //     this.wait(1000, {
                        //         onFinish : () => {
                        //             if (options.onFinish) options.onFinish();
                        //         },
                        //         onStop : options.onStop,
                                
                        //     })
                        // }
                        // else{
                            if (options.onFinish) options.onFinish();
                        // }

                        
                    }

                    

                },
                onStop: options.onStop
            });
        }

        if (groupIndexInStep === 0 && !options.singleGroup) {

            this.stepManager.states.animatingGroupIndex = undefined;

            this.wait(((this.stepManager.states.playMode === 'all' &&  this.getStepNumber() === 1) || this.stepManager.states.playMode === 'step') ? 0 : 1100, {
                
                onFinish: () => {
                    this.scene.splashScreen.show('အဆင့် ( ' + mmNums[this.getStepNumber()] + ' )');
                    
                    this.wait(1100, {

                        onFinish: () => {
                            this.stepManager.states.currentGroupIndex = this.stepManager.states.animatingGroupIndex = groupIndexInStep;
                            animate();
                        },
                        onStop: options.onStop,
        
                    })
                },
                onStop: options.onStop,

            })

           

        }
        else {
            this.scene.constructionStepView.scrollToGroup(this.getStepNumber() - 1, groupIndexInStep);
            this.stepManager.states.currentGroupIndex = this.stepManager.states.animatingGroupIndex = groupIndexInStep;
            animate();
        }
    }

    getCommandGroupInAniStack(commandIndexInStep) {

        let counter = -1;

        for (let nameInfo of this.commandGroupNames) {

            for (let i = 0; i < this.sceneStates.animationCommandsStack.length; i++) {

                const groupInAni = this.sceneStates.animationCommandsStack[i];

                if (groupInAni.name === nameInfo.name) {
                    counter++;

                    if (counter === commandIndexInStep) {
                        return [groupInAni, i]
                    }
                }
            }

        }

        return [];


    }


    stop() {

    }

    needPencilOnFirstCommandGroup() {

        if (this.isValid) {

            const [drawer, _] = this.getCommandGroupInAniStack(0);
            return drawer.needPencil();
        }

    }


    needRulerOnFirstCommandGroup() {
        if (this.isValid) {

            const [drawer, _] = this.getCommandGroupInAniStack(0);
            return drawer.needRuler();
        }

    }

    removeDeletedCommandNames() {

        const newNames = [];

        for (let nameInfo of this.commandGroupNames) {

            const group = this.sceneStates.animationCommandsStack.find(ele => ele.name === nameInfo.name);

            if (group) {
                newNames.push(nameInfo);
            }
        }

        this.commandGroupNames = newNames;

        this.isValid = this.commandGroupNames.length !== 0;

    }

    updateValidityStatus() {

        let isAtleastOneGroupValid = false;

        this.validCommandGroupNames.length = 0;

        for (let nameInfo of this.commandGroupNames) {

            const drawer = this.sceneStates.animationCommandsStack.find(ele => ele.name === nameInfo.name);
            let isValid = false;

            // console.log(nameInfo);

            if (drawer) {

                // if(this.stepManager.states.currentGroupIndex !== undefined)
                //     isValid = isValid || !drawer.geoToDraw.hiddenInitially;
                // else
                    isValid = drawer.geoToDraw.isValid && drawer.geoToDraw.visible;

                    // console.log(drawer.geoToDraw);
                    // console.warn('isValid ', isValid);
                
                for (let geo of drawer.geosToShow) {
                    isValid = isValid || geo.visible;
                }
            }

            nameInfo.isValid = isValid;
            isAtleastOneGroupValid = isAtleastOneGroupValid || isValid;

            if(isValid){
                this.validCommandGroupNames.push(drawer);
            }

        }

        // console.warn(this.validCommandGroupNames);

        this.isValid = this.commandGroupNames.length !== 0 && isAtleastOneGroupValid;

    }

    needCompassOnFirstCommandGroup() {

        if (this.isValid) {
            const [drawer, _] = this.getCommandGroupInAniStack(0);
            return drawer.needCompass();
        }

    }

    needProtractorOnFirstCommandGroup() {

        if (this.isValid) {
            const [drawer, _] = this.getCommandGroupInAniStack(0);
            return drawer.needProtractor();
        }

    }

    needSetSquare45OnFirstCommandGroup() {
        if (this.isValid) {
            const [drawer, _] = this.getCommandGroupInAniStack(0);
            return drawer.needSetSquare45();
        }
    }

    wait(duration = 200, options = {}) {

        if(duration === 0){
            options.onFinish();
            return;
        }

        this.scene.waitTween = new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, duration)
            .onComplete(() => {
                this.scene.animationController.removeAnimation(this.scene.waitTween.getId());
                options.onFinish();

            })
            .onStop(() => {
                this.scene.animationController.removeAnimation(this.scene.waitTween.getId());
                if (options.onStop) options.onStop();
            })

        this.scene.animationController.addAnimation(this.scene.waitTween.getId());
        this.scene.waitTween.start();

    }

    getStepNumber() {

        for (let i = 0; i < this.stepManager.validSteps.length; i++) {
            if (this.stepManager.validSteps[i].id === this.id) {
                return i + 1;
            }
        }

    }


}

ConstructionStep.idCounter = 0;