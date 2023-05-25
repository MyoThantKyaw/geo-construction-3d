import DefSegment2Points from "../../definitions/segments/DefSegment2Points";
import Geometry from "../../geometries/abstract/Geometry";
import Point from "../../geometries/Point";
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from "three";
import Scene from "../../Scene";
import DefPointFree from "../../definitions/points/DefPointFree";
import CmdCreateGeometry from "../../commands/CmdCreateGeometry";
import * as util from "../../helper/util"

export default class Constructor {

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        this.scene = scene;

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = scene.ctxGeo;

        this.commands = [];

        this.constructionColor = 0xff0000;

        this.active = false;

        /**
         * @type {Geometry}
         */
        this.hoveredItem = undefined;
        this.pointerCoor = new Vector2();
        this.pointerPx = new Vector2();

        this.color = 0xff1505;

        this.tempVect = new Vector2();

        this.mode = "draw";

        this.inputContainer = document.createElement('div');
        this.inputContainer.className = "constructor-input-panel";
        // this.scene.statusBar.inputContainer.appendChild(this.inputContainer);

        this.contextMenuHandler = evt => {

            evt.preventDefault();

        }

 
        this.valueChangeListeners = {};
        this.selectableItemsTypes = [];
        this.availableInstruments = [];

        this.scene.on(" :down", () => {

            if (this.active && this.isValid) {
                if (this.helperMesh) this.helperMesh.visible = false;
                scene.render();

            }

        })

        this.scene.on(" :up", () => {
            if (this.active && this.isValid) {
                if (this.helperMesh) this.helperMesh.visible = true;
                scene.render()
            }
        })



        this.testPoint = new Mesh(new SphereGeometry(.1, 10, 10), new MeshBasicMaterial({ color: 0x933f23 }));
        scene.add(this.testPoint);
        this.testPoint.visible = false;


        return new Proxy(this, {

            set(object, key, value) {

                if (object[key] === value) return true;

                const oldVal = object[key];

                object[key] = value;

                if (object.valueChangeListeners[key] !== undefined) {
                    object['fireChangeEvent'](key, value, oldVal);
                }

                return true;
            }
        });


    }


    onPointerMove(e) {
        console.log("move mov");
    }

    onPointerDown(e) {

    }

    clearData() {

    }

    createAndShowPoint(def, options = {}) {

        const addToScene = options.addToScene || false;

        if (typeof def.x === "number") {
            def = new DefPointFree(def.x, def.y);
        }

        const command = new CmdCreateGeometry(Point, def, {
            // name : Point.getNextName(),
        });

        this.commands.push(command);
        const item = command.execute(this.scene);

        if(options.highlightColor){
            item.setColor(Geometry.HIGHLIGHT_COLOR);
        }

        if(addToScene)
            this.scene.addCommand(command)
        

        return item.name;
        
    }

    isCtrlKeyPressed() {
        return this.scene.keyEventData && this.scene.keyEventData.ctrlKey;
    }

    updateInputDimensionValues(){
        
    }

    activate() {

        if(this.active) return;

        this.active = true;

        this.scene.container.addEventListener("contextmenu", this.contextMenuHandler);

        this.updateInputDimensionValues();
    }

    deactivate() {

        this.active = false;
     
        this.scene.container.removeEventListener("contextmenu", this.contextMenuHandler);

        this.clearData();
    }

    updatePxPos() {

        this.pointerPx.x = this.scene.halfWidth + (this.pointerCoor.x - this.scene.center.x) * this.scene.scale;
        this.pointerPx.y = this.scene.halfHeight - (this.pointerCoor.y - this.scene.center.y) * this.scene.scale;

    }

    setMode() {

    }

    enterPressHandler(e) {
    }

    showPreview() { }

    resetPreview() {

        // if (this.point2 && this.point2.isTemporaryUpdated) {
        //     this.point2.restoreState();
        // }

        // if (this.hoveredItem && this.hoveredItem.isTemporaryUpdated) {
        //     this.hoveredItem.restoreState();
        // }
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {*} classNames 
     */
    addClass(element, classNames) {

        if (typeof classNames === 'string') {

            if (element.state === classNames) return;

            if (classNames === 'visible')
                element.setAttribute("tabindex", "-1");
            else
                element.removeAttribute("tabindex");


            for (let className of element.classList) {

                if (className === classNames) continue;

                if (className.indexOf("constru-input") !== -1) {
                    element.classList.remove(className);
                }
            }

            element.classList.add("constru-input-" + classNames);
            element.state = classNames;

        }
        else if (classNames.length > 0) {

            for (let className of element.classList) {

                let inNewClass = false;
                for (let newClass of classNames) {

                    if (className === newClass) {
                        inNewClass = true;
                        break;
                    }
                }

                if (!inNewClass && className.indexOf("constru-input") !== -1) {
                    element.classList.remove(className);
                }
            }

            classNames.forEach(className => {
                element.classList.add("constru-input-" + className);
            });
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

    doesSegmentAlreadyExist(point1, point2) {

        for (let i = 0; i < this.scene.segments.length; i++) {
            const def = this.scene.segments[i].definition;
            if (def.constructor === DefSegment2Points) {
                if ((def.point1 === point1 && def.point2 === point2) || (def.point1 === point2 && def.point2 === point1)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 
     * @param {*} item 
     * @param {Array<>} list 
     */
    isItemInList(item, list) {
        return list.find(ele => ele === item);
    }

    /**
     * 
     * @param {Geometry} item 
     */
    isItemSelectable(item) {

        for (let i = 0; i < this.selectableItemsTypes.length; i++) {
            if (item.constructor === this.selectableItemsTypes[i]) {
                return true;
            }
        }

        return false;
    }

    enterInputMode(){

    }
    
    exitInputMode(){}

    setConstructorToolbar(toolbar){

        this.UIInitiated = true;

    }

    checkFreePointerMove(e) {

        this.activeInstrument = undefined;

        for (let i = 0; i < this.scene.instruments.length; i++) {

            if (this.scene.instruments[i].visible && this.scene.instruments[i].isUsableWithCurrentConstr()) {

                if (!this.activeInstrument && this.scene.instruments[i].updateHelper(e)) {
                    this.activeInstrument = this.scene.instruments[i];
                    this.activeInstrument.helperMesh.visible = true;
                }
                else {
                    this.scene.instruments[i].helperMesh.visible = false;
                }
            }
        }

        // this.isValid = false;
    }

    setDrawingMethod(){

    }

    getPencilInclinationAngle(lineVector, directionFactor) {

        return util.getAngle(lineVector.x, lineVector.y) - (-directionFactor * .9);

    }



}