
import { v4 as uuidv4 } from 'uuid';

export default class Command {

    constructor() {

        this.name = "Command"
        this.type = "none";
    }

    execute() {

    }

    undo() {

    }

    clone() {
        return this;
    }

    getDataToExport() {
        return {}
    }

    getUUID() {
        return uuidv4();
    }

}