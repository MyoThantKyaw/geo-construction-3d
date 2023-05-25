import Scene from "../Scene";
import Command from "./abstract/Command";

export default class CmdCreateGeometry extends Command {

    /**
     * 
     * @param {Function} geoClass 
     * @param {Object} def 
     * @param {Object} params 
     */
    constructor(geoClass, def, params = {}, name){

        super();

        this.geoClass = geoClass;
        this.def = def;
        this.params = params;


        this.type = "Create";

        this.executed = false;

        this.name = name ? name : this.getUUID();
        this.backupDef = def.clone();


    }

    /**
     * 
     * @param {Scene} scene 
     * @returns 
     */
    execute(scene, options = {}){

        this.geo = new this.geoClass(this.def.clone(), this.params);
        this.geo.userCreated = true;
        
        scene.add(this.geo);

        this.params.name = this.geo.name;

        this.geo.isInteractable = false;
        setTimeout(() => {
            this.geo.isInteractable = true;
        }, 200);

        if(!this.description)
            this.description = "Created " + this.geo.name.substring(0, 15);

        return this.geo.show({duration: 150});

    }


    /**
     * 
     * @param {Scene} scene 
     */
    undo(scene){

        this.geo.delete();

    }

    restoreDefault(){
        this.def = this.backupDef.clone();
    }

    clone(){
        return new CmdCreateGeometry(
            this.geoClass, this.geo.definition.clone(), this.params, this.name
        )
    }

    getDataToExport(){
        return {
            className : this.constructor.name,
            data : [
                {
                    className : this.geoClass.name,
                }, 
                this.def.getDataToExport(), this.params, this.name
            ]
        }
    }

}
