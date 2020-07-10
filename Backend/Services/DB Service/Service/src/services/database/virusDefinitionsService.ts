import { DbService } from "../dbService";
import IVirusDefinition from "../../interfaces/virusDefinitions";
import VirusDefinitionModel from "../../models/database/definitionModel";

export class VirusDefinitionsService extends DbService {
    constructor() {
        super();
    }

    public async getDefinitions(): Promise<VirusDefinitionModel[]> {
        const definitions = await this.listAll(VirusDefinitionModel);
        return definitions;
    }

    public async writeDefinitions(definitions: IVirusDefinition[]): Promise<VirusDefinitionModel[]> {
        return await this.createElements(VirusDefinitionModel, definitions);
    }

    public async getDefinitionsByIds(ids: string[]): Promise<VirusDefinitionModel[]> {
        const definitions = await this.getDocumentsByIds(VirusDefinitionModel, ids);
        return definitions;
    }
}