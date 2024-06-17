#!/usr/bin/env node

const amqp = require('amqplib/callback_api');

if (process.argv.length !== 4) {
  console.log('Usage: node chatReceiver.js <username> <middleware_endpoint>');
  process.exit(1);
}

const username = process.argv[2];
const middlewareEndpoint = process.argv[3];

amqp.connect(`amqp://${middlewareEndpoint}`, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const queue = 'room';

    channel.assertQueue(queue, { durable: false });

    console.log(`[${username}] Waiting for messages. To exit press CTRL+C`);

    channel.consume(queue, (msg) => {
      console.log(msg.content.toString());
    }, { noAck: true });
  });
});
