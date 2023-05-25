import Scene from "../Scene";


export default class Select{

    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene){

        this.scene = scene;

        this.contextMenuHandler = evt => {
            evt.preventDefault();
        }

        this.active = false

    }

    activate(){


        this.scene.container.addEventListener("contextmenu", this.contextMenuHandler);

    }

    deactivate(){

        // this.active = false;
        this.scene.container.removeEventListener("contextmenu", this.contextMenuHandler);


    }

    isItemSelectable(){
        return true;
    }


}