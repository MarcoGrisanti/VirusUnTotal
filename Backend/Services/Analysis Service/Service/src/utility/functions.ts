import { UploadedFile } from "express-fileupload";
import IVirusDefinition from "../interfaces/virusDefinition";
import md5 from 'md5';

export function port_between(min: number, max: number) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

export function checkForMenaces(file: UploadedFile, definitions: IVirusDefinition[]): boolean {
    if (definitions.some(def => def.hash === md5(file.data))) {
        return true;
    }
    return false;
}