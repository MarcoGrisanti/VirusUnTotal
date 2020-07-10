import amqp from 'amqplib/callback_api';
import cors from 'cors';
import express from 'express';
import request from 'request';
import fileUpload from 'express-fileupload';
import { UploadedFile } from 'express-fileupload';

import Error from './interfaces/error';
import IAnalysisResult from './interfaces/analysisResults';
import IVirusDefinition from './interfaces/virusDefinition';
import IAppPromiseResolve from './interfaces/appPromiseResolve';
import S3Service from './services/s3Service';
import { checkForMenaces } from './utility/functions';

const defs_update_exchange = 'defs_update_notifier';
const port = 3000;
const s3Service = new S3Service();

let definitions: IVirusDefinition[] = [];

const app = express();

app.use(cors());

app.use(fileUpload({
    preserveExtension: 10,
    safeFileNames: true,
    abortOnLimit: true,
    responseOnLimit: 'File Limit Reached',
    limits: { fileSize: 50 * 1024 * 1024, files: 5 },
    limitHandler: function (req: express.Request, res: express.Response, next: express.NextFunction) {
        return res.status(400).send('No File Provided');
    },
    debug: true
}));

app.post('/analyze', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No File Provided');
    }
    const results: IAnalysisResult[] = [];
    Object.keys(req.files).map(file => {
        const result = checkForMenaces((req.files[file] as UploadedFile), definitions);
        s3Service.uploadFile((req.files[file] as UploadedFile));
        results.push({ filename: (req.files[file] as UploadedFile).name, result, hash: (req.files[file] as UploadedFile).md5 });
    });
    request.post({ url: 'http://localhost:6500/history', json: results }, function (error, response, body) {
        res.status(200);
        res.json(results);
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

const appPromise = new Promise<IAppPromiseResolve>(function (resolve, reject) {
    setTimeout(function () {
        request('http://localhost:7000/definitions', function (error, response, body: string) {
            const appPromiseResolve: IAppPromiseResolve = { app, body: [] };
            if (error) {

            }
            else {
                const parsedBody: IVirusDefinition[] = JSON.parse(body) as IVirusDefinition[];
                appPromiseResolve.body = parsedBody;
            }
            resolve(appPromiseResolve);
        });
    }, 10000);
});

appPromise.then(function (appPromiseResolve: IAppPromiseResolve) {
    definitions = appPromiseResolve.body;
    console.info('First Definitions Update: ', definitions);
    if (definitions.length > 0) {
        console.info('Successfully Retrieved Virus Definitions');
    }
    else {
        console.warn('Empty Definitions');
    }
    appPromiseResolve.app.listen(port, () => console.info(`Server Is Listening On Port ${port}`));
    amqp.connect('amqp://localhost', function (error1, connection) {
        if (error1) {
            console.log("Cannot Connect To Queue");
            return;
        }
        connection.createChannel(function (error2, channel) {
            if (error2) {
                console.log("Cannot Create Channel");
                return;
            }
            channel.assertExchange(defs_update_exchange, 'fanout', {
                durable: false
            });
            channel.assertQueue('', {
                exclusive: true
            }, function (error3, q) {
                if (error3) {
                    console.log("Cannot Assert Queue");
                    return;
                }
                console.log("Waiting For Messages In Queue");
                channel.bindQueue(q.queue, defs_update_exchange, '');
                channel.consume(q.queue, function (msg) {
                    if (msg.content) {
                        const newDefinitionsIds: string[] = JSON.parse(msg.content.toString());
                        request.get({ url: 'http://localhost:7000/definitions', json: newDefinitionsIds }, function (error, response, body) {
                            const newDefinitions = body as IVirusDefinition[];
                            if (newDefinitions) {
                                console.log("New Definitions:", newDefinitions);
                                newDefinitions.forEach(definition => definitions.push(definition));
                            }
                        });
                    }
                }, { noAck: true });
            });
        });
    });
}).catch(function () {
    console.warn('Error');
    process.exit();
});