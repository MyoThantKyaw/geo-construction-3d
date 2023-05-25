import AnimationController from "./animation/AnimationController";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
// import TWEEN from '@tweenjs/tween.js';

import Ruler from "./instruments/Ruler";
import ModeManager from "./managers/ModeManager";
import SelectionManager from "./managers/SelectionManager"
import CameraControls from 'camera-controls';
import TWEEN from '@tweenjs/tween.js';

import * as geoUtil from "./helper/geoUtil";


import Collisions from 'collisions';

import {
    Plane,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    DirectionalLight,
    WebGLRenderer,
    Scene as THREEScene,
    PerspectiveCamera,
    Clock,
    Mesh,
    AmbientLight,
    MOUSE,
    MeshStandardMaterial,
    PointLight,
    TextureLoader,
    EquirectangularReflectionMapping,
    PlaneGeometry,
} from 'three';
import Geometry from "./geometries/abstract/Geometry";
import Pencil from "./instruments/Pencil";
import Compass from "./instruments/Compass";
import Protractor from "./instruments/Protractor";
import Paper from "./Paper";
import Command from "./commands/abstract/Command";
import { markRaw,  reactive, } from "vue";
import ConstructionAnimator from "./animation/ConstructionAnimator";
import CommandGroup from "./commands/CommandGroup";
import ConstructionStep from "./animation/ConstructionStep";
import ConstructionStepManager from "./animation/ConstructionStepManager";
import Instrument from "./instruments/abstract/Instrument";
import CmdReplacePointWithOtherPoint from "./commands/point/CmdReplacePointWithOtherPoint";
import GeometryDrawer from "./animation/GeometryDrawer";
import ConstructorWithInstruments from "./geometryConstructors/ConstructorWithInstruments";


import SetSquare45 from "./instruments/SetSquare45";

const subsetOfTHREE = {
    Vector2: Vector2,
    Vector3: Vector3,
    Vector4: Vector4,
    Quaternion: Quaternion,
    Matrix4: Matrix4,
    Spherical: Spherical,
    Box3: Box3,
    Sphere: Sphere,
    Raycaster: Raycaster,
    MathUtils: {
        DEG2RAD: MathUtils.DEG2RAD,
        clamp: MathUtils.clamp,
    },
    MOUSE: {
        LEFT: MOUSE.LEFT,
        MIDDLE: MOUSE.MIDDLE,
        RIGHT: MOUSE.RIGHT,
    }
};

CameraControls.install({ THREE: subsetOfTHREE });

import Point from "./geometries/Point";
import Segment from "./geometries/Segment";
import Arc from "./geometries/Arc";
import Circle from "./geometries/Circle";

import Label from "./graphics/Label";
import Polygon from "./geometries/Polygon";

import DefPointFree from "./definitions/points/DefPointFree"
import DefPointOnIntersection from "./definitions/points/DefPointOnIntersection"
import DefPointOnInvisibleCircle from "./definitions/points/DefPointOnInvisibleCircle"
import DefPointOnParallelSegment from "./definitions/points/DefPointOnParallelSegment"
import DefPointOnSegment from "./definitions/points/DefPointOnSegment"
import DefPointWithAngleAndLenFromALine from "./definitions/points/DefPointWithAngleAndLenFromALine"
import DefPointWithAngleFromALine from "./definitions/points/DefPointWithAngleFromALine"
import DefSegment2Points from "./definitions/segments/DefSegment2Points"
import DefArcOnSegment from "./definitions/arc/DefArcOnSegment"
import DefArcWithCenterPointRadiusStartEndAngle from "./definitions/arc/DefArcWithCenterPointRadiusStartEndAngle"
import DefAngleThreePoints from "./definitions/symbols/angles/DefAngleThreePoints"
import DefAngleThreeStaticPoints from "./definitions/symbols/angles/DefAngleThreeStaticPoints"

import DefCircleWithFixedRadius from "./definitions/circles/DefCircleWithFixedRadius";
import DefCircleWithCenterAndPointOnBoundary from "./definitions/circles/DefCircleWithCenterAndPointOnBoundary";

import DefPolygonWithPoints from "./definitions/polygons/DefPolygonWithPoints";

import DefLabelBetween2Points from "./definitions/labels/DefLabelBetween2Points";
import DefLabelBetween2StaticPoints from "./definitions/labels/DefLabelBetween2StaticPoints";
import DefLabelForPoint from "./definitions/labels/DefLabelForPoint";
import DefLabelStaticPt from "./definitions/labels/DefLabelStaticPt";

import CmdCreateGeometry from "./commands/CmdCreateGeometry";
import CmdRemoveGeometry from "./commands/CmdRemoveGeometry";

import CmdMovePoint from "./commands/point/CmdMovePoint"

import CmdMoveLabel from "./commands/label/CmdMoveLabel"
import CmdFlipSideOfLabel from "./commands/label/CmdFlipSideOfLabel"

import CmdMoveSegment from "./commands/segment/CmdMoveSegment"
import CmdChangeDefOfFreePointToOtherDef from "./commands/point/CmdChangeDefOfFreePointToOtherDef"

import CmdChangeProperty from "./commands/CmdChangeProperty"
import CmdSetProperty from "./commands/CmdSetProperty"

import Angle from "./graphics/symbols/Angle";

const classToImport = {
    Point,
    Segment,
    Arc,
    Circle,
    Angle,
    Label,
    Polygon,

    DefPointFree,
    DefPointOnSegment,
    DefPointOnIntersection,
    DefPointOnInvisibleCircle,
    DefPointOnParallelSegment,
    DefPointOnSegment,
    DefPointWithAngleAndLenFromALine,
    DefPointWithAngleFromALine,

    DefSegment2Points,

    DefPolygonWithPoints,

    DefArcOnSegment,
    DefArcWithCenterPointRadiusStartEndAngle,

    DefAngleThreePoints,
    DefAngleThreeStaticPoints,

    DefLabelBetween2Points,
    DefLabelBetween2StaticPoints,
    DefLabelForPoint,
    DefLabelStaticPt,

    DefCircleWithFixedRadius,
    DefCircleWithCenterAndPointOnBoundary,

    CmdCreateGeometry,
    CmdRemoveGeometry,
    CmdChangeDefOfFreePointToOtherDef,
    CmdReplacePointWithOtherPoint,

    CmdMovePoint,
    CmdMoveLabel,

    CmdMoveSegment,

    CmdChangeProperty,
    CmdSetProperty,

    CmdFlipSideOfLabel,

    Vector2,

}

export default class Scene extends THREEScene {

    /**
     * 
     * @param {HTMLDivElement} container 
     * @param {*} options 
     */
    constructor(container, options = {}) {

        super();

        Object.assign(this, options);

        this.container = container;

        this.containerRect = container.getBoundingClientRect();

        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(this.containerRect.width, this.containerRect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.physicallyCorrectLights = true;
        // this.renderer.toneMapping = ACESFilmicToneMapping;

        // this.renderer.gammaFactor = 2.2;
        // this.renderer.gammaOutput = true;
        // /        this.renderer.toneMapping = THREE.LinearToneMapping;
        // this.renderer.toneMapping = THREE.CustomToneMapping;
        // this.renderer.outputEncoding = THREE.sRGBEncoding;

        // this.renderer.debug = false;

        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        let perspective_camera = new PerspectiveCamera(15, this.containerRect.width / this.containerRect.height, 1, 1010);
        // const camera = new OrthographicCamera( this.containerRect.width / - 2, this.containerRect.width / 2, this.containerRect.height / 2, this.containerRect.height / - 2, .1, 1000 );
        // camera.zoom = 20;

        // camera.updateMatrix()

        this.camera = perspective_camera;
        this.camera.up = new Vector3(0, 0, 1);

        // this.camera.position.set(0, 0, 1);
        // this.camera.position.set(0, -20 * 1.65, 54 * 1.65);
        this.camera.position.set(0, 0, 54 * 1.65);

        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
        this.cameraControls.maxPolarAngle = Math.PI / 2;
        this.cameraControls.smoothTime = 0.05;
        this.cameraControls.dollySpeed = .3;
        this.cameraControls.polarRotateSpeed = 0.6;
        this.cameraControls.azimuthRotateSpeed = 0.6;

        this.cameraControls.addEventListener('control', () => {
            this.dispatchEvent("control", {});
        })

        this.cameraControls.addEventListener('controlend', () => {
            this.dispatchEvent("controlend", {});
        })

        this.container.addEventListener("wheel", () => {
            this.dispatchEvent("wheel", {});
        })

        this.animationController = new AnimationController(this, this.cameraControls, new Clock());

        this.pointer = new Vector2();

        this.pointerLocAtPoiterDown = new Vector2();
        this.currentPointerLoc = new Vector2();

        this.pointerDownEvent = undefined;

        this.raycastedPtOnPlane = new Vector2();

        // this.add(new AxesHelper(20));

        this.states = reactive({

            inEditMode: true,
            modeType: 'constructionWithPointer', // 'constructionWithInstruments', 'play', 'constructionWithPointer
            mode: 'select',
            currentCommandIndex: -1,
            // constructionMethod: "pointer",
            selectedItem: reactive({}),
            selectedItems: [],

            /**
            * @type {Array<CommandGroup>}
            */
            /**
            * @type {Array<CommandGroup>}
            */
            commandsStack: markRaw([]),
            allCommandStack: [],
            /**
            * @type {Array<GeometryDrawer>}
            */
            animationCommandsStack: [],
            /**
             * @type {Array<ConstructionStep>}
             */
            constructionSteps: [],
            isPlaying: false,

            importedData: undefined,

            rulerVisible: false,
            compassVisible: false,
            protractorVisible: false,
            setSquare45Visible: false,
            setSquare30Visible: false,
            items: [],
            userCreatedGeometries: [],
        });

        this.states.commandsStack = this.states.allCommandStack;

        // this.oldStepDescs = [];

        this.points = [];
        this.segments = [];
        this.arcs = [];
        this.labels = [];
        this.shapes = [];

        this.straightLines = []; // lines and segments
        this.lines = [];

        this.intersectionPts = [];

        this.addLights();

        // this.instrumentNames = ["setSquare45", "ruler", "protractor"];
        this.instrumentNames = ["ruler", "pencil", "compass", "protractor", "setSquare45"];
        // this.instrumentNames = ["ruler", "pencil", "compass"]
        /**
         * @type {Array<Instrument>}
         */
        this.instruments = [];
        this.visibleInstrumentMeshes = [];

        this.objectsToDrag = [];

        /**
       * @type {Constructor}
       */
        this.defaultGeoConstructor = {
            active: false,
            isItemSelectable(item) {
                return true;
            },

            states: {}
        }

        this.waitTween = new TWEEN.Tween({})
        this.items = this.states.items;
        this.userCreatedGeometries = this.states.userCreatedGeometries;

        this.geoConstructor = this.defaultGeoConstructor;

        this.listeners = {}

        window.addEventListener("keydown", (e) => {

            if (e.key === ' ') {
                this.enableCameraControls();
            }
            this.pressedKey = e.key;


            if ((e.key === 'z' || e.key === 'Z' || e.key === "ဖ") && e.ctrlKey) {
                this.dispatchEvent("Ctrl+z:down");
            }
            else if ((e.key === 'y' || e.key === 'Y' || e.key === "ပ") && e.ctrlKey) {
                this.dispatchEvent("Ctrl+y:down");
            }
            else {
                this.dispatchEvent(e.key + ":down");
            }
        })

        window.addEventListener("keyup", (e) => {

            if (this.geoConstructor.active && this.pressedKey === ' ') {
                this.disableCameraControls();
            }

            this.dispatchEvent(e.key + ":up");
            this.dispatchEvent("keyup", e);

            this.pressedKey = undefined;

        })


        this.render();
        this.cameraControls.update(0);
        // this.createPreviewIntersectionPoint();

        this.loadResources();
        this.setupDragControl();

        this.resizeWatcher = new ResizeObserver(() => {

            this.containerRect = container.getBoundingClientRect();

            this.camera.aspect = this.containerRect.width / this.containerRect.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.containerRect.width, this.containerRect.height);

            this.animationController.requestRender();

        });

        this.resizeWatcher.observe(this.container);
        this.disableCameraControls();

        this.collisionSystem = new Collisions();
        this.collisionResult = this.collisionSystem.createResult();

        this.on("Alt:down", () => {
            if (!this.cameraRotateEnabled) {
                this.enableCameraRotate();
            }
        })

        window.addEventListener("blur", () => {

            if (this.cameraRotateEnabled) {
                this.disableCameraRotate();
            }
        })


        this.on("keyup", () => {

            if (this.cameraRotateEnabled) {
                this.disableCameraRotate();
            }
        })

     
  


    }

    requestRender() {
        this.animationController.requestRender();
    }

    render() {

        this.renderer.render(this, this.camera);
    }

    setGeoConstructor(geoConstructor) {

        if (this.geoConstructor.active) {
            this.geoConstructor.deactivate();
        }

        if (geoConstructor) {

            this.geoConstructor = geoConstructor;
            this.geoConstructor.activate();


            this.disableCameraControls();

            // this.container.style.cursor = "cross"
        }
        else {
            this.geoConstructor = this.defaultGeoConstructor;
            this.enableCameraControls();
        }

    }

    add(item, addToCurrentSelectableObj = true) {

        if (item.isGeometry || item.isInstrument || item.isGraphicItem) {

            if (item.name && this.getItemByName(item.name)) {

                return;
            }

            super.add(item.parentMesh);

            item.setContext(this);

            item.parentMesh.traverse(child => {
                if (child.isObject3D) {
                    if (!child.isSelectable) {
                        child.userData.notMovable = true;
                    }
                }
            })

            item.parentMesh.renderOrder = Geometry.idCounter;

            if (item.parentMesh.isSelectable) {

                // this.dragControl.addObject(item.parentMesh, addToCurrentSelectableObj);

                const plane = new Plane(new Vector3(0, 0, 1), 0);

                item.parentMesh.refPlaneToMove = plane;
                item.parentMesh.parentGeo = item;

            }

            if (item.isPoint) {
                this.points.push(item);
            }
            else if (item.isSegment) {

                this.lines.push(item);
                this.straightLines.push(item);
                this.segments.push(item);

            }
            else if (item.isArc || item.isCircle) {
                this.lines.push(item);
                // this.arcs.push(item);
            }
            else if (item.isGraphicItem) {
                this.labels.push(item);
            }
            else if (item.isShape) {
                this.shapes.push(item);
            }

            if (item.userCreated) {
                this.userCreatedGeometries.push(item);
            }

            this.items.push(markRaw(item));

        }
        else {
            super.add(item);
        }

        return item;
    }

    pointerMoveHandler(ev) {

    }

    setupDragControl() {

        this.plane = new Mesh(new PlaneGeometry(1000, 1000),
            new MeshStandardMaterial({ color: 0xf2f1ed, visible: true, emissive: 0xf2f1ed, emissiveIntensity: .3, }));
        this.plane.receiveShadow = true;

        this.raycaster = new Raycaster();

        this.container.addEventListener("pointerdown", (e) => {

            this.pointerDownEvent = {
                clientX: e.clientX, clientY: e.clientY
            }

            if (!this.getPointerCoordinateOnPlane(e, this.pointerLocAtPoiterDown, this.plane)) return;

            this.pointerDownedButton = e.button;
            this.pointerDowned = true;

            if (e.button === 0) {

                this.timeAtPanDown = performance.now();

                if (e.button !== 0 || this.freezed || e.target !== this.renderer.domElement) return;

                if (this.hoveredItem)
                    this.pointerDownedItem = this.hoveredItem;

                else
                    this.pointerDownedItem = this.findSelectedItem(this.pointerLocAtPoiterDown);

                if (this.geoConstructor.active) {

                    this.geoConstructor.onPointerDown({
                        x: this.pointerLocAtPoiterDown.x, y: this.pointerLocAtPoiterDown.y,
                        selectedItem: this.pointerDownedItem,
                        selectedMesh: 3,
                    })
                }

                if (this.pointerDownedItem && this.pointerDownedItem.draggable) {

                    this.disableCameraControls();
                }
                else {

                    if (this.geoConstructor.active) return;
                }

            }
            else {

                this.selectionManager.onPointerDown(this.pointerLocAtPoiterDown);
                this.disableCameraControls();
            }


            this.requestRender();

        })

        this.container.addEventListener("pointermove", (e) => {

            if (!this.getPointerCoordinateOnPlane(e, this.currentPointerLoc, this.plane) || e.target !== this.renderer.domElement) return;

            if (this.pointerDownedButton === 2) {

                this.selectionManager.onPointerMove(this.currentPointerLoc);
            }
            else {

                if (this.pointerDowned && ((this.states.mode === 'constructorWithInstruments' && !this.geoConstructor.states.drawingGeometry) || this.states.mode === 'select' || (this.pointerDownedItem && this.pointerDownedItem.isInstrument))) {

                    if (this.pointerDownedItem && this.states.mode !== 'play' && this.pointerDownedItem.draggable) {

                        if (!this.dragStarted) {

                            this.pointerDownedItem.onDragStart(this.pointerLocAtPoiterDown);
                            this.dragStarted = true;

                            if (this.pointerDownedItem.isGeometry) this.removeIntersectionPts();
                        }

                        this.pointerDownedItem.onDrag(this.currentPointerLoc);
                    }
                    else {
                        // pan view port
                    }
                }
                else {

                    if (this.geoConstructor.active) {
                        this.geoConstructor.checkFreePointerMove({
                            x: this.currentPointerLoc.x, y: this.currentPointerLoc.y
                        })
                    }

                    // check for hover ...
                    const hoveredItem = this.findSelectedItem(this.currentPointerLoc);


                    if (this.geoConstructor.active) {

                        this.currentPointerLoc.hoveredItem = hoveredItem;
                        this.geoConstructor.onPointerMove(this.currentPointerLoc)

                    }

                    if (this.hoveredItem) {

                        if (this.hoveredItem !== hoveredItem) {
                            this.hoveredItem.onPointerOut();
                        }

                    }

                    if (hoveredItem) {

                        if (!hoveredItem.isHovered) {

                            this.setCursor("pointer");
                            hoveredItem.onPointerEnter(this.currentPointerLoc);

                        }
                        else {
                            hoveredItem.onPointerMove(this.currentPointerLoc);
                        }
                    }
                    else {
                        if (this.geoConstructor.active && this.states.mode !== 'constructorWithInstruments') {
                            this.setCursor("crosshair");

                        }
                        else {
                            this.setCursor("auto");
                        }
                    }

                    this.hoveredItem = hoveredItem;

                }


            }


            this.animationController.requestRender();

        });

        const handlePointerUp = (e) => {

            if (!this.pointerDowned) return;

            if (this.pointerDownedButton === 0) {

                if (this.states.mode !== 'play' && this.dragStarted && this.pointerDownedItem) {

                    const isGeometry = this.pointerDownedItem.isGeometry;

                    this.pointerDownedItem.onDragEnd(this.currentPointerLoc);

                    if (isGeometry) this.updateIntersectionPts();

                }

                let tappedItem;

                const mouseShift = Math.sqrt(((e.clientX - this.pointerDownEvent.clientX) ** 2) + ((e.clientY - this.pointerDownEvent.clientY) ** 2));

                if ((performance.now() - this.timeAtPanDown < 500) && mouseShift < 4) {

                    if (this.pointerDownedItem) {

                        handleTap({
                            tappedItem: this.pointerDownedItem,
                            clientX: e.clientX,
                            clientY: e.clientY,
                            DOMEvent: e,
                        });

                        tappedItem = this.pointerDownedItem;

                    }

                    this.selectionManager.onPointerUp({
                        x: this.pointerLocAtPoiterDown.x,
                        y: this.pointerLocAtPoiterDown.y,
                        tappedItem
                    });

                }



                if (!this.geoConstructor.active) {
                    this.enableCameraControls();
                }

                this.dragStarted = false;

            }
            else if (this.selectionManager.multiSelectable()) {

                this.enableCameraControls();
                this.selectionManager.onPointerUp({
                    x: this.pointerLocAtPoiterDown.x,
                    y: this.pointerLocAtPoiterDown.y,
                });
                // this.selectionManager.onPointerUp(this.pointerLocAtPoiterDown);
            }



            this.pointerDowned = false;
            this.pointerDownedButton = undefined;
            this.requestRender();

        }

        const handleTap = (e) => {

            let selectionChanged = false;

            if (this.pressedKey === 'Control') {
            }
            else {
                selectionChanged = selectionChanged || this.removeSelections(e.tappedItem);
            }

            if (e.tappedItem) {

                if (this.states.selectedItems.length > 0 && ((this.states.selectedItems[0].isInstrument && e.tappedItem.isGeometry) ||
                    (this.states.selectedItems[0].isGeometry && e.tappedItem.isInstrument)
                )) {
                    selectionChanged = selectionChanged || this.removeSelections(e.tappedItem);
                }

                if (!this.geoConstructor.active || this.geoConstructor.constructor === ConstructorWithInstruments) {
                    e.tappedItem.onTap();
                    selectionChanged = true;
                }
            }

            if (selectionChanged) {
                this.selectionManager.updateSelectedItems();
            }

            this.dispatchEvent("tap", e);

        }

        this.container.addEventListener("pointercancel", handlePointerUp);
        this.container.addEventListener("pointerup", handlePointerUp);
        this.container.addEventListener("pointerleave", handlePointerUp);
        this.container.addEventListener("pointerout", handlePointerUp);

        this.on("ArrowDown:down", () => {
            if (this.commandHistroyPanel === document.activeElement && this.states.currentCommandIndex < this.states.commandsStack.length - 1) {
                this.redo();
            }
        })

        this.on("ArrowUp:down", () => {
            if (this.commandHistroyPanel === document.activeElement && this.states.currentCommandIndex > -1) {
                this.undo();
            }
        })

    }

    getPointerCoordinateOnPlane(e, ptOut, planeMesh) {

        const rect = this.container.getBoundingClientRect();

        this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, - (((e.clientY) - rect.top) / rect.height) * 2 + 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersect = this.raycaster.intersectObject(planeMesh);

        if (intersect.length > 0) {

            ptOut.set(intersect[0].point.x, intersect[0].point.y);
            ptOut.clientX = e.clientX;
            ptOut.clientY = e.clientY;
            return true;

        }
        return false;
    }


    findSelectedItem(pointerPos) {

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.visibleInstrumentMeshes, false);

        if (intersects.length > 0) {

            intersects[0].object.parentGeo.intersect = intersects[0];
            return intersects[0].object.parentGeo;
        }

        if (this.geoConstructor.constructor === ConstructorWithInstruments) {
            if (this.geoConstructor.checkFreePointerMove({ x: pointerPos.x, y: pointerPos.y })) {
                return undefined;
            }
        }

        let minDist = 9999;
        let itemFound = undefined;

        for (let i = this.points.length - 1; i >= 0; i--) {

            const item = this.points[i];

            if (item.isInteractable && item.visible && item.isValid && this.geoConstructor.isItemSelectable(item)) {

                this.pointerCheckInfo = item.isInPath(pointerPos);

                if (this.pointerCheckInfo.result && this.pointerCheckInfo.distance < minDist) {
                    itemFound = item;
                    minDist = this.pointerCheckInfo.distance;
                }
            }
        }

        if (!itemFound) {

            for (let i = this.intersectionPts.length - 1; i >= 0; i--) {

                const item = this.intersectionPts[i];

                if (this.geoConstructor.isItemSelectable(item)) {

                    this.pointerCheckInfo = item.isInPath(pointerPos);

                    if (this.pointerCheckInfo.result && this.pointerCheckInfo.distance < minDist) {
                        itemFound = item;
                        minDist = this.pointerCheckInfo.distance;
                    }
                }

            }
        }

        if (!itemFound) {

            for (let i = this.labels.length - 1; i >= 0; i--) {

                const item = this.labels[i];

                if (item.isInteractable && item.visible && item.isValid && this.geoConstructor.isItemSelectable(item)) {

                    this.pointerCheckInfo = item.isInPath(pointerPos);

                    if (this.pointerCheckInfo.result) {
                        itemFound = item;
                        break;
                    }
                }
            }
        }

       

        // if (!this.itemFound) {
        //     for (let i = this.points.length - 1; i >= 0; i--) {

        //         const item = this.points[i];

        //         if (item.isInteractable && item.visible && !item.isFixed && item.isValid && this.geoConstructor.isItemSelectable(item)) {
        //             this.pointerCheckInfo = item.isInPath(this.currentPointerPxX, this.currentPointerPxY);
        //             if (this.pointerCheckInfo.result && this.pointerCheckInfo.distance < minDist) {
        //                 this.itemFound = item;
        //                 minDist = this.pointerCheckInfo.distance;
        //             }
        //         }
        //     }
        // }

        if (!itemFound) {

            minDist = 9999;

            for (let i = this.lines.length - 1; i >= 0; i--) {

                const item = this.lines[i];

                if (item.isInteractable && item.visible && this.geoConstructor.isItemSelectable(item)) {

                    this.pointerCheckInfo = item.isInPath(pointerPos);

                    if (this.pointerCheckInfo.result && this.pointerCheckInfo.distance < minDist) {
                        itemFound = item;
                        minDist = this.pointerCheckInfo.distance;
                    }
                }
            }
        }

        if (!itemFound) {

            for (let i = this.shapes.length - 1; i >= 0; i--) {

                const item = this.shapes[i];

                if (item.isInteractable && item.visible && this.geoConstructor.isItemSelectable(item)) {

                    if (item.isInPath(pointerPos)) {
                        itemFound = item;
                    }
                }
            }
        }

        return itemFound;
    }



    setMode(mode) {

        this.modeManager.setMode(mode);

    }

    removeHover() { }

    loadResources() {

        this.loadedCount = 0;
        this.resourceCount = 2;

        this.fontLoader = new FontLoader();

        this.fontLoader.load('v2GeoConst3D/styles/font/CMU_Serif_Bold.json', font => {

            Scene.resources.font = font;

            this.loadedCount++;

            if (this.loadedCount === this.resourceCount) this.completeResourceLoading();

        }, undefined, err => {
            console.error(err)
        });


        let textureLoader = new TextureLoader();
        textureLoader.load("v2GeoConst3D/textures/Spark212_1.jpg", (texture) => {

            // texture.rotation = Math.PI;
            texture.mapping = EquirectangularReflectionMapping;
            Scene.resources.envMap = texture;

            this.loadedCount++;

            if (this.loadedCount === this.resourceCount) this.completeResourceLoading();

        })

    }

    completeResourceLoading() {

        this.loadInstruments();

    }


    loadInstruments() {

        this.paper = new Paper(this);
        this.paper.show();

        this.noOfInstruments = this.instrumentNames.length;
        this.loadedInstruments = 0;

        this.instrumentNames.forEach(instrumentName => {

            instrumentName = instrumentName.toLowerCase();

            if (instrumentName === "ruler") {
                this.ruler = new Ruler({
                    onReady: () => {

                        this.instrumentReadyCallback();
                        // this.ruler.show();
                        this.ruler.setOriginAndAngle({ x: -3, y: -15 }, 0);
                    }
                });
                this.add(this.ruler);
                this.instruments.push(this.ruler);

            }
            else if (instrumentName === "pencil") {
                this.pencil = new Pencil({
                    onReady: () => {

                        this.add(this.pencil);
                        this.instruments.push(this.pencil);
                        this.instrumentReadyCallback();

                    }
                })

            }
            else if (instrumentName === "compass") {
                this.compass = new Compass({
                    onReady: () => {
                        this.add(this.compass);
                        this.instruments.push(this.compass);

                        this.instrumentReadyCallback();

                    }
                })
            }
            else if (instrumentName === "protractor") {
                this.protractor = new Protractor({
                    onReady: () => {

                        this.add(this.protractor);
                        this.instruments.push(this.protractor);

                        this.instrumentReadyCallback();
                        // this.protractor.show();
                        this.protractor.setOriginAndAngle({ x: -3, y: 15 }, 0);
                    }
                })
            }
            else if (instrumentName === "setsquare45") {

                this.setSquare45 = new SetSquare45({
                    onReady: () => {

                        this.add(this.setSquare45);
                        this.instruments.push(this.setSquare45);

                        this.instrumentReadyCallback();
                        // this.protractor.show();

                    }
                })
            }

        })

        this.render();
    }

    updateIntersectionPts() {

        this.intersectionPts.length = 0;

        geoUtil.getAllIntersectionPoints(this, this.intersectionPts);

        const ptsCopy = this.intersectionPts.slice();
        this.intersectionPts.length = 0;

        for (let pt of ptsCopy) {

            pt.scene = this;

            let existingIntersectionPoint = undefined;

            for (let point of this.points) {

                const def = point.definition;
                if (def.constructor === DefPointOnIntersection && pt.item1.name === def.itemToIntersect1Name && pt.item2.name === def.itemToIntersect2Name && pt.ptIndex === def.intersectPointIndex) {
                    existingIntersectionPoint = point;
                    break;
                }
            }

            if (!existingIntersectionPoint)
                this.intersectionPts.push(markRaw(pt));
        }

        for (let pt of this.intersectionPts) {
            this.add(pt.mesh);
        }

        // console.warn("this.intersectionPts ");
        // console.log(this.intersectionPts);

    }

    removeIntersectionPts() {

        for (let pt of this.intersectionPts) {
            pt.delete();
        }

        this.intersectionPts.length = 0;

    }

    instrumentReadyCallback() {

        this.loadedInstruments++;

        if (this.loadedInstruments === this.noOfInstruments) {

            this.instruments.forEach(instrument => {
                instrument.selectableMeshes.forEach(mesh => {
                    // this.visibleInstrumentMeshes.push(mesh);
                    mesh.parentGeo = instrument;
                });

            });

            this.instruments = [this.setSquare45, this.ruler, this.protractor, this.compass, this.pencil];

            this.states.ready = true;
            this.modeManager = new ModeManager(this);

            this.constructionAnimator = new ConstructionAnimator(this);
            this.constructionStepManager = new ConstructionStepManager(this);
            this.selectionManager = new SelectionManager(this);

            // this.protractor.collisionPotentials = this.protractor.collisionPolygon.potentials();
            // this.ruler.collisionPotentials = this.ruler.collisionPolygon.potentials();
            // this.setSquare45.collisionPotentials = this.setSquare45.collisionPolygon.potentials();

            this.protractor.collisionPotentials = [this.ruler.collisionPolygon, this.setSquare45.collisionPolygon];
            this.ruler.collisionPotentials = [this.protractor.collisionPolygon, this.setSquare45.collisionPolygon];
            this.setSquare45.collisionPotentials = [this.protractor.collisionPolygon, this.ruler.collisionPolygon];

            this.onReady();
            this.onReady.called = true;

            this.render();
            setTimeout(() => {
                // this.setMode('select');
                this.setMode('constructorWithInstruments');
                // this.setMode('polygonWithInstruments');
            }, 200);
        }
    }

    addLights() {

        const directionalLightShadow = new DirectionalLight(0xffffff, .25,);
        // directionalLightShadow.decay = 0;

        directionalLightShadow.position.set(3.6, -8.95, 13.45);
        // this.add(new DirectionalLightHelper(directionalLightShadow))

        directionalLightShadow.castShadow = true; // default false
        directionalLightShadow.shadow.mapSize.width = 900;
        directionalLightShadow.shadow.mapSize.height = 900;

        const d = 10.2;
        directionalLightShadow.shadow.camera.left = -d;
        directionalLightShadow.shadow.camera.right = d;
        directionalLightShadow.shadow.camera.top = d;
        directionalLightShadow.shadow.camera.bottom = -d;

        this.add(directionalLightShadow);

        const directionalLight1 = new DirectionalLight(0xffffff, 0.1);
        directionalLight1.position.set(-5.35,
            -6.65,
            10);
        this.add(directionalLight1);
        // this.add(new DirectionalLightHelper(directionalLight1))

        const directionalLight2 = new DirectionalLight(0xffffff, 0.03);
        directionalLight2.position.set(
            2.3,
            -1.1,
            -10);
        this.add(directionalLight2);
        // let h = new DirectionalLightHelper(directionalLight2);
        // this.add(h)

        const directionalLight3 = new PointLight(0xffffff, 0.1, 100, 0);
        directionalLight3.position.set(-0.5, -4, 1.75);
        this.add(directionalLight3);

        // this.add(new DirectionalLightHelper(directionalLight3))
        // let light = directionalLightShadow;

        // document.querySelector("#range1").value = light.position.x;
        // document.querySelector("#range2").value = light.position.y;
        // document.querySelector("#range3").value = light.position.z;

        // document.querySelector("#range1").oninput = e => {
        //     light.position.x = parseFloat(e.target.value);
        //     this.requestRender()
        // }

        // document.querySelector("#range2").oninput = e => {
        //     light.position.y = parseFloat(e.target.value);
        //     this.requestRender()
        // }

        // document.querySelector("#range3").oninput = e => {
        //     light.position.z = parseFloat(e.target.value);
        //     this.requestRender()
        // }

        const ambientLight = new AmbientLight(0xffffff, .5); // soft white light
        this.add(ambientLight);

    }

    enableCameraRotate() {
        this.cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE;
        this.cameraRotateEnabled = true;
    }

    disableCameraRotate() {
        this.cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.cameraRotateEnabled = false;
    }

    enableCameraControls() {

        this.cameraControls.mouseButtons.left = this.cameraRotateEnabled ? CameraControls.ACTION.ROTATE : CameraControls.ACTION.TRUCK;

        this.cameraControls.touches.one = CameraControls.ACTION.TRUCK;
        this.cameraControls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
        this.cameraControlEnabled = true;
    }

    disableCameraControls() {

        this.cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;

        this.cameraControls.touches.one = CameraControls.ACTION.NONE;
        this.cameraControls.touches.two = CameraControls.ACTION.NONE;
        this.cameraControlEnabled = false;
    }

    on(eventType, listener) {

        if (this.listeners[eventType] === undefined) {
            this.listeners[eventType] = [];
        }

        this.listeners[eventType].push(listener);

    }

    remove(itemOrName) {


        if (typeof itemOrName === "string") {

            const item = this.getItemByName(itemOrName);

            if (item === undefined) {
                console.warn(itemOrName + " does not exist.");
                return;
            }

            if (item.isGeometry || item.isInstrument || item.isGraphicItem) {


                this.removeItemFromList(this.points, item.name);
                this.removeItemFromList(this.segments, item.name);
                this.removeItemFromList(this.arcs, item.name);
                this.removeItemFromList(this.labels, item.name);
                this.removeItemFromList(this.shapes, item.name);

                this.removeItemFromList(this.straightLines, item.name);
                this.removeItemFromList(this.lines, item.name);

                this.removeItemFromList(this.items, item.name);

                this.removeItemFromList(this.userCreatedGeometries, item.name);

                super.remove(item.parentMesh);

                if (this.pointerDownedItem && this.pointerDownedItem.name === item.name) this.pointerDownedItem = undefined;
                if (this.hoveredItem && this.hoveredItem.name === item.name) this.hoveredItem = undefined;

                if (item.isSelected.value) this.selectionManager.removeSelection(item);

            }
        }
        else {

            super.remove(itemOrName);

        }
    }

    /**
     * 
     * @param {Array<*>} list 
     * @param {String} itemName 
     */
    removeItemFromList(list, itemName) {

        const index = list.findIndex(ele => ele.name === itemName);
        if (index > -1) list.splice(index, 1);
        else {
            // console.error("remove failed from list ", itemName);
        }

    }

    off(eventType, listener) {

        let listeners = [];

        let index = listeners.findIndex(ele => ele === listener);
        listeners.splice(index, 1);

    }

    dispatchEvent(eventType, e) {

        let listeners = this.listeners[eventType];

        if (listeners) {
            listeners.forEach(listener => {
                listener(e);
            });
        }
    }

    /**
     * 
     * @param {String} name 
     * @returns {Geometry}
     */
    getItemByName(name) {
        return this.items.find(item => item.name === name);
    }

    /**
     * 
     * @param {Command} command 
     */
    addCommand(command, alreayExecuted) {

        const commitedUndo = this.commitUndo();

        const commandList = command.length ? command : [command];
        this.states.allCommandStack.push(markRaw(new CommandGroup(this, commandList)));

        this.states.currentCommandIndex = this.states.allCommandStack.length - 1;

        this.filterAnimationCommands();

        if (commandList[commandList.length - 1].type === 'Create') {
            this.scrollStepToView();
        }

        this.updateIntersectionPts();

    }

    removeCommand(command) {
        const index = this.states.allCommandStack.findIndex(ele => {
            for (let cmd of ele) {
                if (cmd.name === command.name) {
                    return true;
                }
            }

            return false;
        })

        if (index > -1) {

            this.states.allCommandStack.splice(index, 1);
            this.states.currentCommandIndex = this.states.allCommandStack.length - 1;
            this.filterAnimationCommands();
            this.updateIntersectionPts();

        }

    }

    commitUndo() {

        // console.warn("commitUndo");

        if (this.states.currentCommandIndex < this.states.allCommandStack.length - 1) {

            this.states.allCommandStack.splice(this.states.currentCommandIndex + 1, this.states.commandsStack.length - this.states.currentCommandIndex - 1);
            return true;
        }

        return false;

    }

    filterAnimationCommands() {

        const animationCommandsStack = this.states.animationCommandsStack;
        const lastAnimationCommandsStackLen = animationCommandsStack.length;

        animationCommandsStack.length = 0;

        const isItemAlreadyExistInPrevGeoDrawers = (item) => {
            for(let drawer of animationCommandsStack){
                
                if(drawer.geoToDraw.name === item.name) return true;

                for(let geoToShow of drawer.geosToShow){
                    if(geoToShow.name === item.name) return true;
                }
            }

            return false;
        }

        const getLabels = (startIndex) => {

            const labels = [];
            let lastIndex = undefined;

            // go to next single command groups.
            for (let i = startIndex; i < this.states.allCommandStack.length; i++) {

                const group = this.states.allCommandStack[i];
                if (group.getType() !== "Create") continue;

                const lastCmd = group.commands[group.commands.length - 1]

                if (lastCmd.geoClass === Label || (lastCmd.geoClass == Point && lastCmd.geo.definition.constructor === DefPointOnIntersection)) {

                    for (let cmd of group.commands) {
                        if(cmd.geo && !isItemAlreadyExistInPrevGeoDrawers(cmd.geo) ){
                            labels.push(cmd.geo);
                        }
                        
                    }

                    // console.error('addede.');
                    lastIndex = i;
                }
                else {
                    break;
                }

            }

            return { labels, lastIndex };
        }

        for (let i = 0; i < this.states.allCommandStack.length; i++) {

            const group = this.states.allCommandStack[i];

            if (group.getType() !== "Create") continue;

            const lastGeoInCmdGroup = group.commands[group.commands.length - 1].geo;

            if (!lastGeoInCmdGroup) {
                continue;
            }

            const aniGroup = new GeometryDrawer(group.name, lastGeoInCmdGroup, this);

            for (let j = group.commands.length - 2; j >= 0; j--) {

                if (group.commands[j].type !== "Create") continue;

                aniGroup.addGeoToShow(group.commands[j].geo);

            }

            // get labels and other undrawable items from next steps and remove that steps.
            const labels = getLabels(i + 1);

            if (labels.labels.length > 0) {
                for (let lb of labels.labels) {
                    aniGroup.addGeoToShow(lb);
                }
                i = labels.lastIndex;
            }


            if (aniGroup.isValid()){
                animationCommandsStack.push(aniGroup);
                // console.warn(aniGroup);
                // console.warn(aniGroup.geosToShow);
            }
                

        }

        let newGroup = undefined;

        for (let group of animationCommandsStack) {

            let groupInSteps = undefined;

            for (let step of this.constructionStepManager.steps) {

                if (step.commandGroupNames.find(ele => ele.name === group.name)) {

                    groupInSteps = group;
                    break;
                }
            }

            if (!groupInSteps) {
                newGroup = group;
                break;
            }

        }


        if (newGroup) {
            this.constructionStepManager.newCommandGroupAdded(newGroup);
        }
        else if (lastAnimationCommandsStackLen > animationCommandsStack.length) {
            // this.constructionStepManager.removeAllDeletedCommands();
        }

        this.constructionStepManager.updateGroupStatus();



    }

    undo() {

        if (this.states.currentCommandIndex < 0) {
            return;
        }

        this.states.commandsStack[this.states.currentCommandIndex--].undo(this);
        
        
        this.updateIntersectionPts();
        this.filterAnimationCommands();
        setTimeout(() => {
            this.requestRender();
        }, 0);

    }

    setCommandGroupStack(commandGroupList) {

        this.goToCommandHistory(-1)

        this.states.commandsStack = commandGroupList;
        this.goToCommandHistory(commandGroupList.length - 1)
    }

    redo() {

        if (this.states.currentCommandIndex > this.states.commandsStack.length - 2) {
            return;
        }

        this.states.commandsStack[++this.states.currentCommandIndex].redo(this);

        this.updateIntersectionPts();
        this.filterAnimationCommands()
        
        setTimeout(() => {
            this.requestRender();
        }, 0);

    }

    saveCommandIndex() {

        this.savedCurrentCommandIndex = this.states.currentCommandIndex;
    }

    restoreCommandIndex() {

        if (this.savedCurrentCommandIndex === undefined) return;

        if (this.savedCurrentCommandIndex < this.states.commandsStack.length) {

            for (let i = this.states.commandsStack.length - 1; i > this.savedCurrentCommandIndex; i--) {

                const commandGroup = this.states.commandsStack[i];

                for (let j = commandGroup.commands.length - 1; j >= 0; j--) {
                    commandGroup.commands[j].undo(this);

                }

            }

            this.states.commandsStack.splice(this.savedCurrentCommandIndex + 1, this.states.commandsStack.length - this.savedCurrentCommandIndex - 1)
            this.states.currentCommandIndex = this.savedCurrentCommandIndex;
        }

        this.filterAnimationCommands();

    }

    goToCommandHistory(index, options = {}) {

        if (index < this.states.currentCommandIndex) {

            for (let i = this.states.currentCommandIndex; i > index; i--) {

                this.states.commandsStack[i].undo(options)
                this.filterAnimationCommands();

            }
        }
        else if (index > this.states.currentCommandIndex) {

            for (let i = this.states.currentCommandIndex + 1; i <= index; i++) {

                this.states.commandsStack[i].redo(options);
                this.filterAnimationCommands();

            }
        }
        else {
            console.warn("same same");
        }

        this.states.currentCommandIndex = index;
        this.requestRender();

    }

    restoreCommandStack() {

        for (let group of this.states.commandsStack) {

            for (let cmd of group.commands) {
                if (cmd.type === 'Create') {
                    cmd.restoreDefault();
                }
            }
        }
    }

    animateCommandGroup(index) {

        for (let ins of this.instruments) {
            ins.stopMoveTween()
        }

        this.states.commandsStack[index].animate({
            onFinish: () => {
                // console.log("finish");
            }
        });

    }

    removeSelections(exceptedItem) {

        let selectionRemoved = false;

        for (let item of this.items) {
            if (item.isSelected.value && (!exceptedItem || exceptedItem.name !== item.name)) {
                item.setSelection(false)
                selectionRemoved = true;
            }
        }

        return selectionRemoved;
    }

    setSelection(selectedItems) {

        const itemsToSelect = selectedItems.length ? selectedItems : [selectedItems];

        for (let item of this.items) {

            if (itemsToSelect.find(ele => ele.name === item.name)) {
                item.setSelection(true);
            }
            else {
                if (item.isSelected.value) {
                    item.setSelection(false);
                }
            }
        }

        this.selectionManager.updateSelectedItems();

    }

    scrollStepToView() {
        if (this.constructionStepView && this.constructionStepManager.steps.length > 0)
            this.constructionStepView.scrollToStep(this.constructionStepManager.steps.length - 1, {
                waitToUpdate: true,
                align: "bottom",
            });
    }

    importConstructionSteps(data) {

        this.setMode("select");
        this.clearAllData();
        this.states.importedData = markRaw(data);

        const processParameter = (param) => {

            if (param.className) {

                if (param.data) {

                    const className = param.className;
                    const data = param.data;

                    const processedData = [];

                    for (let i = 0; i < data.length; i++) {

                        if (data[i] && data[i].className) {

                            processedData.push(processParameter(data[i]));
                        }
                        else {
                            processedData.push(data[i]);
                        }
                    }

                    // console.warn(className);
                    return new classToImport[className](...processedData);

                }
                else {
                    // console.log("");
                    // console.warn(param.className);
                    return classToImport[param.className]
                }
            }
            else {
                return param;
            }
        }

        const cmdCreateIndices = [];
        const geoIndices = [];

        for (let commandGroup of data.commandsGroups) {

            const cmds = [];

            for (let cmdInfo of commandGroup.commands) {

                const processedData = []

                for (let datum of cmdInfo.data) {
                    processedData.push(processParameter(datum))
                }

                // console.log(cmdInfo.className);

                const command = new classToImport[cmdInfo.className](
                    ...processedData
                )

                cmds.push(command);

                const geo = command.execute(this);

                if (geo && (geo.isGeometry || geo.isGraphicItem)) {

                    const chunks = geo.name.split(" ");
                    const idx = parseInt(chunks[chunks.length - 1]);
                    if (!isNaN(idx)) {
                        geo.constructor.idCounter = idx + 1;
                    }

                }

                if (classToImport[cmdInfo.className] === CmdCreateGeometry) {

                    const chunks = command.name.split(" ");
                    const idx = parseInt(chunks[chunks.length - 1]);
                    if (!isNaN(idx)) cmdCreateIndices.push(idx);

                }

            }

            this.addCommand(cmds);

            // console.error(commandGroup);

        }

        if (cmdCreateIndices.length > 0)
            CmdCreateGeometry.idCounter = Math.max(...cmdCreateIndices) + 1;

        this.states.constructionSteps.length = 0;

        if (data.steps.length === 0) {
            const constructionStep = new ConstructionStep(this, this.constructionStepManager);
            this.states.constructionSteps.push(constructionStep);
        }

        for (let step of data.steps) {

            const constructionStep = new ConstructionStep(this, this.constructionStepManager);

            for (let cmdGroupName of step.commandGroupNames) {
                constructionStep.addCommandGroupName(cmdGroupName);
            }

            constructionStep.description = step.description;
            this.states.constructionSteps.push(constructionStep);

        }

        this.constructionStepManager.updateGroupStatus();

        setTimeout(() => {
            for (let textarea of this.constructionStepView.$el.querySelectorAll(".step-desc")) {
                textarea.dispatchEvent(new Event('input'));
            }
        }, 0);

        this.requestRender();

        this.constructionStepView.scrollToStep(0, {
            waitToUpdate: true,
            align: "top",
        });

    }

    exportConstructionSteps() {

        this.commitUndo();
        this.constructionStepManager.removeDeletedGroups();

        const dataToExport = {};

        const commandsGroupsToExport = [];

        for (let group of this.states.allCommandStack) {

            const commandGroupData = { commands: [] }

            for (let command of group.commands) {
                commandGroupData.commands.push(command.getDataToExport())
            }

            commandsGroupsToExport.push(commandGroupData);

        }

        dataToExport.commandsGroups = commandsGroupsToExport;

        // console.warn(dataToExport.commandsGroups);


        const steps = [];

        for (let step of this.states.constructionSteps) {

            if (step.commandGroupNames.length > 0) {
                const stepData = {
                    commandGroupNames: step.commandGroupNames,
                    description: step.description,
                };

                steps.push(stepData);
            }
        }

        dataToExport.steps = steps;

        this.saveAsFile("steps.json", dataToExport);

    }

    clearAllData() {

        const geosToDelete = [];

        this.states.items.forEach(item => {
            if (item.userCreated) geosToDelete.push(item);
        });

        for (let item of geosToDelete) {
            if (item.userCreated) {
                item.delete();
            }
        }

        this.states.commandsStack.length = 0;
        this.states.allCommandStack.length = 0;
        this.states.animationCommandsStack.length = 0;
        this.states.constructionSteps.length = 0;

        this.states.currentCommandIndex = -1;
        this.states.selectedItem = undefined;

        this.selectionManager.updateSelectedItems();

        this.constructionStepManager.clearAll();

    }

    saveAsFile(filename, dataObjToWrite) {

        const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
        const link = document.createElement("a");

        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove();

    }

    /**
     * 
     * @param {Vector3} pos 
     */
    getScreenCoordinate(pos) {

        pos = pos.clone();

        pos.project(this.camera);

        const widthHalf = this.containerRect.width / 2;
        const heightHalf = this.containerRect.height / 2;

        pos.x = (pos.x * widthHalf) + widthHalf;
        pos.y = - (pos.y * heightHalf) + heightHalf;
        pos.z = 0;

        return pos;

    }

    setCursor(cursorName) {

        for (let className of this.container.classList) {
            const subStrs = className.split("-");
            if (subStrs[0] === "cursor") {
                this.container.classList.remove(className);
            }
        }

        this.container.classList.add("cursor-" + cursorName);

    }

    goToHome() {

    }

}

Scene.resources = {};