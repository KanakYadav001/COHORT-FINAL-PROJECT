const express = require('express');
const app = express();
const {connect} = require('./broker/broker');
const listenToQueue = require('./broker/listener');

connect().then(() => {
    listenToQueue();
})


app.use(express.json());

const sendEmail = require('./mail');



app.get('/', (req, res) => {
    res.send('Notification Service is running');
});




module.exports = app;

