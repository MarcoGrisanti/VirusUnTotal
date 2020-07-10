import { DbService } from "../dbService";
import IHistoryItem from "../../interfaces/historyItem";
import HistoryModel from "../../models/database/historyModel";

export class HistoryService extends DbService {
    constructor() {
        super();
    }

    public async getHistory(): Promise<HistoryModel[]> {
        const history = await this.listAll(HistoryModel);
        return history;
    }

    public async writeHistory(historyItems: IHistoryItem[]): Promise<HistoryModel[]> {
        return await this.createElements(HistoryModel, historyItems);
    }
}