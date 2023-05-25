import Scene from "../../../Scene";


export default class ConstructionAnimator{

    
    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene){
        this.scene = scene;
    }

    hideInstruments(exceptInstrument){

        for(let instrument of this.scene.instruments){

            if(instrument !== exceptInstrument && instrument.visible){
                
                instrument.hide( { toGoToRestingPosition : true});
            }

        }

      
    }

}