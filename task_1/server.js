const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const amqp = require('amqplib/callback_api');
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(express.json());

const middlewareEndpoint = 'localhost';
const queue = 'room';

amqp.connect(`amqp://${middlewareEndpoint}`, function (error0, connection) {
    if (error0) {
        console.error('Failed to connect to RabbitMQ', error0);
        process.exit(1);
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            console.error('Failed to create RabbitMQ channel', error1);
            process.exit(1);
        }

        channel.assertQueue(queue, { durable: true });

        app.post('/send', (req, res) => {
            const { username, message } = req.body;
            if (!username || !message) {
                return res.status(400).json({ error: 'Username and message are required' });
            }
            
            channel.sendToQueue(queue, Buffer.from(message), { replyTo: username, persistent: true });
            res.json({ status: 'Message sent', username: username, message: message });
        });

        channel.consume(queue, function (msg) {
            const chatMessage = `[${msg.properties.replyTo}] ${msg.content.toString()}`;
            console.log(chatMessage);

            // Broadcast the message to all WebSocket clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(chatMessage);
                }
            });

            // Acknowledge the message to remove it from the queue
            channel.ack(msg); // Ensure this line is uncommented if you want to acknowledge messages
        }, { noAck: false }); // Ensure noAck is set to false for manual acknowledgment
    });
});

wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    ws.on('error', (error) => {
        console.error('WebSocket error', error);
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
