import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import request from 'request';
import Error from './interfaces/error'
import IHistoryItem from './interfaces/historyItem';

let history: IHistoryItem[] = [];
const app = express();
app.use(bodyParser.json())
app.use(cors());

app.get('/history', function (req, res) {
    request('http://localhost:7000/history', function (error, response, body) {
        if (error) {
            res.status(500).send();
        }
        history = body as IHistoryItem[];
        res.status(200).send(history);
    });
});

app.post('/history', function (req, res) {
    request.post({ url: 'http://localhost:7000/history', json: req.body }, function (error, response, body) {
        if (error) {
            res.status(500).send();
        }
        res.status(200).send();
    });
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