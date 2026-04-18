const { subcribeToQueue } = require("./broker");
const {sendEmail} = require('../mail');
module.exports = function listernToQueue() {
  subcribeToQueue("user_registered_notification.user",async (data) => {
     const structureEmail  = `
     <h1>Welcome to our service, ${data.fullName.firstName + " " + data.fullName.lastName || "" }</h1>
     <p>Thank you for registering with us. We're excited to have you on board.</p>
     <p>Best regards,<br>Easy Shop</p>`;

     await sendEmail(data.email, "Welcome to Our Service", "Congratulations!", structureEmail);

    });
};
