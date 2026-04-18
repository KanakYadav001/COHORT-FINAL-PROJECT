 const amqplib = require('amqplib');

 let connection, channel;


 async function connect() {
    if (connection) return connection;

    try {
        connection = await amqplib.connect(process.env.RABBIT_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
 }

 async function publishToQueue(queueName, data ={}) {
    if(!channel || !connection) await connect();
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
 }


 async function subcribeToQueue(queueName, callback) {
    if(!channel || !connection) await connect();
    await channel.assertQueue(queueName, { durable: true });

    channel.consume(queueName, async(msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
           await callback(data);
            channel.ack(msg);
        }
    });

 }

 module.exports = {
    connect,
    channel,
    connection,
    publishToQueue,
    subcribeToQueue
}