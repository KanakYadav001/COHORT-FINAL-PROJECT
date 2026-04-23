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


    subcribeToQueue("payment_success_notification.user",async (data) => {
      const structureEmail  = `
      <h1>Payment Successful</h1>
      <p>Your payment of ${data.price.amount} ${data.price.currency} has been processed successfully.</p>
      <p>Thank you for your purchase!</p>
      <p> Your order ID is ${data.rozopayOrderId} and payment ID is ${data.rozopayPaymentId}.</p>
      <p>Best regards,<br>Easy Shop</p>
    })`

    subcribeToQueue("payment_failed_notification.user",async (data) => {
      const structureEmail  = `
      <h1>Payment Failed of ${data.rozopayOrderId}</h1>
      <p>We're sorry, but your payment of ${data.price.currency} ${data.price.amount} failed.</p>
      <p>Please try again or contact our support team for assistance.</p>
      <p>Best regards,<br>Easy Shop</p>`

        await sendEmail(data.email, "Payment Failed", "Payment Unsuccessful", structureEmail);
    });
  });
};
