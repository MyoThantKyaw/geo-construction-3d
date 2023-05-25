
import AngleConstructor from "../geometryConstructors/AngleConstructor";
import ArcConstructor from "../geometryConstructors/ArcConstructor";
import CircleWithCenterAndPointOnCircumConstructor from "../geometryConstructors/CircleWithCenterAndPointOnCircumConstructor";
import ConstructorWithInstruments from "../geometryConstructors/ConstructorWithInstruments";
import PointConstructor from "../geometryConstructors/PointConstructor";
import PolygonConstructor from "../geometryConstructors/PolygonConstructor";
import SegmentConstructor from "../geometryConstructors/SegmentConstructor";
import Select from "../geometryConstructors/Select";
import Scene from "../Scene";

export default class ModeManager {

    /**
     * 
     * @param {Scene} scene 
     * @param {*} mode 
     */
    constructor(scene, mode) {

        this.scene = scene;
        this.sceneStates = scene.states;

        // create construtors

        this.selectMode = new Select(this.scene);
        this.pointConstructor = new PointConstructor(this.scene);
        this.segmentConstructor = new SegmentConstructor(this.scene);
        this.angleConstructor = new AngleConstructor(this.scene);
        this.polygonConstructor = new PolygonConstructor(this.scene);
        this.arcConstructor = new ArcConstructor(this.scene);
        this.constructorWithInstruments = new ConstructorWithInstruments(this.scene);
        this.circleWithCenterAndPointOnCircumConstructor = new CircleWithCenterAndPointOnCircumConstructor(scene);

    }

    setMode(mode) {

        
        if(mode === this.scene.states.mode) return;

        const lastMode = this.scene.states.mode;

        let constructor;

        if (mode === "select") constructor = this.selectMode;
        else if (mode === "pointConstructor") constructor = this.pointConstructor;
        else if (mode === "segmentConstructor") constructor = this.segmentConstructor;
        else if (mode === "angleConstructor") constructor=  this.angleConstructor;
        else if (mode === "polygonConstructor") constructor = this.polygonConstructor;
        else if (mode === "arcConstructor") constructor = this.arcConstructor;
        else if (mode === "constructorWithInstruments") constructor = this.constructorWithInstruments;
        else if (mode === "circleWithCenterAndPointOnCircumConstructor") constructor = this.circleWithCenterAndPointOnCircumConstructor;
      
        this.scene.states.mode = mode;
        
        if (constructor) {
            this.scene.setGeoConstructor(constructor);
        }
        else{
            this.scene.setGeoConstructor(undefined);
        }

        if(mode === 'play'){
            if(lastMode !== 'play')
                this.initPlayMode();
        }
        else if(lastMode === 'play'){
            this.quitPlayMode();
        }

        if(mode === "constructorWithInstruments")
            this.sceneStates.constructionMethod =  "tools";
        else if(mode === "play")
            this.sceneStates.constructionMethod =  undefined;
        else
            this.sceneStates.constructionMethod =  "pointer";

        if(mode === 'constructorWithInstruments')
            this.sceneStates.modeType = 'constructionWithInstruments';
        else if(mode === 'play'){
            this.sceneStates.modeType = 'play';
            this.scene.goToHome();
        }
        else
            this.sceneStates.modeType = 'constructionWithPointer';
        
        this.scene.dispatchEvent('modeChange');

        this.scene.requestRender();

    }

    initPlayMode(){

        // this.scene.commitUndo();
        
        this.scene.pencil.stopMoveTween();
        this.scene.ruler.stopMoveTween();
        this.scene.waitTween.stop();

        this.sceneStates.isPlaying = true;
        this.scene.constructionStepManager.enterPlayMode();
    }

    quitPlayMode(){

        this.scene.waitTween.stop();
        this.scene.constructionStepManager.stopPlaying();

        this.sceneStates.isPlaying = false;
        this.scene.constructionStepManager.exitPlayMode();

    }


}
