import * as bodyParser from 'body-parser';
import express from 'express';
import Error from './interfaces/error'
import IHistoryItem from './interfaces/historyItem';
import IVirusDefinition from './interfaces/virusDefinitions';
import { HistoryService } from './services/database/historyService';
import { VirusDefinitionsService } from './services/database/virusDefinitionsService';
import VirusDefinitionModel from './models/database/definitionModel';

const app = express();
app.use(bodyParser.json());
const historyService = new HistoryService();
const virusDefinitionsService = new VirusDefinitionsService();

app.get('/history', async function (req, res) {
    const history = await historyService.getHistory();
    res.status(200).json(history);
});

app.post('/history', function (req, res) {
    const historyItems: IHistoryItem[] = req.body as IHistoryItem[];
    historyService.writeHistory(historyItems).then(() => res.status(200).send()).catch(() => res.status(500).send());
});

app.get('/definitions', async function (req, res) {
    let definitions: VirusDefinitionModel[];
    if (req.body && typeof Array.isArray(req.body) && req.body.length) {
        definitions = [];
        const definitionsIds = (req.body as string[]);
        definitions = (await virusDefinitionsService.getDefinitionsByIds(definitionsIds));
    }
    else {
        definitions = await virusDefinitionsService.getDefinitions();
    }
    console.log("Retrieved Definitions", definitions);
    res.status(200).json(definitions);
});

app.post('/definitions', async function (req, res) {
    const definitions: IVirusDefinition[] = req.body as IVirusDefinition[];
    const newDefinitionsIds: string[] = [];
    const newDefinitions = await virusDefinitionsService.writeDefinitions(definitions);
    if (newDefinitions) {
        newDefinitions.forEach(definition => newDefinitionsIds.push(definition.id || ''));
        res.status(200).json(newDefinitionsIds);
    }
    else {
        res.status(500).send();
    }
});

app.use(function (req, res, next) {
    const err: Error = { message: 'Not Found' };
    err.status = 404;
    next(err);
});

app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(err.status || 500);
    res.json({ message: err.message });
});

export default app;