import Arc from "../geometries/Arc";
import Point from "../geometries/Point";
import Segment from "../geometries/Segment";
import Pencil from "../instruments/Pencil";
import Scene from "../Scene";
import Command from "./abstract/Command";

export default class CommandGroup {

    /**
     * @param {Scene} scene
     * @param {Array<Command>} commands 
     */
    constructor(scene, commands) {

        this.scene = scene;
        this.commands = commands.slice();

        this.type = this.getType();

        /**
         * @type {Pencil}
         */
        this.pencil = this.scene.pencil;
        this.name = "Command-Group-" + this.commands[this.commands.length - 1].name;
        this.description = "Create " + this.commands[this.commands.length - 1].geoName;

    }

    execute(options = {}) {

        for (let i = 0; i < this.commands.length; i++) {
         
            this.commands[i].execute(this.scene);
        }
    }

    // b animating...
    undo(options = {}) {

        // for (let i = 0; i < this.commands.length; i++) {
        
        //     this.commands[i].undo(this.scene);

        // }
    
        for (let i = this.commands.length - 1; i >= 0; i--) {
        
            this.commands[i].undo(this.scene);

        }
    }

    redo(options = {}) {

     
        for (let i = 0; i < this.commands.length; i++) {

            this.commands[i].execute(this.scene, options);
        }
    }

    getType() {

        for (let cmd of this.commands) {

            if (cmd.type === 'Create') {
                return 'Create';
            }
        }

        return 'None';
    }


    clone() {

        return new CommandGroup(this.commands);

    }

    getIndex() {
        for (let i = 0; i < this.scene.states.commandsStack.length; i++) {

            console.warn(this.scene.states.commandsStack[i], this);
            if (this.scene.states.commandsStack[i] === this)
                return i;
        }

        return undefined;
    }


}