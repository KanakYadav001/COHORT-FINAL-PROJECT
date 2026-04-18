const express = require('express');
const app = express();
app.use(express.json());

const sendEmail = require('./mail');

// Example usage
sendEmail(
  'devkanakyadav@gmail.com',
  'Test Email Subject',
  'This is a test email sent with Nodemailer using OAuth2.',
  '<p>This is a test email sent with <b>Nodemailer</b> using OAuth2.</p>'
);





module.exports = app;

