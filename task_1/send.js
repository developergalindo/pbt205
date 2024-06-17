#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    
    const amqp = require('amqplib/callback_api');
const readline = require('readline');

if (process.argv.length !== 4) {
  console.log('Usage: node chatSender.js <username> <middleware_endpoint>');
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

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`Welcome to the chat room, ${username}! Type your messages below:`);

    rl.on('line', (input) => {
      const message = `[${username}] ${input}`;
      channel.sendToQueue(queue, Buffer.from(message));
    });
  });
});


  });

});