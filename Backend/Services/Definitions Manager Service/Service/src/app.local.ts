import amqp from 'amqplib/callback_api';
import randomstring from 'randomstring';
import request from 'request';
import IVirusDefinition from './interfaces/virusDefinition';

const exchange = 'defs_update_notifier';

amqp.connect('amqp://localhost', function (error1, connection) {
    if (error1) {
        return;
    }
    connection.createChannel(function (error2, channel) {
        if (error2) {
            return;
        }
        channel.assertExchange(exchange, 'fanout', { durable: false });
        generateNewDefinitions(channel, 0);
    });
});

const generateNewDefinitions = (notificationChannel: amqp.Channel, timeout = 300000) => {
    setTimeout(async () => {
        const newDefinitions: IVirusDefinition[] = [{ hash: randomstring.generate(32) }, { hash: randomstring.generate(32) }];
        console.log("New Definitions Generated", newDefinitions);
        request.post({ url: 'http://localhost:7000/definitions', json: newDefinitions }, function (error, response, body) {
            if (error) {
                console.log('Cannot Update Definitions');
            }
            console.log("New Definitions Sent");
            const newDefinitionsIds: string[] = response.body as Array<string>;
            notificationChannel.publish(exchange, '', Buffer.from(JSON.stringify(newDefinitionsIds)));
            generateNewDefinitions(notificationChannel);
        });
    }, timeout);
}