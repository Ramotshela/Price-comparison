const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.email.user, pass: config.email.pass },
});

async function sendPriceMatchEmail(to, totalPrice) {
  await transporter.sendMail({
    from: config.email.user,
    to,
    subject: 'Price Match Notification',
    text: `The total price of the products matches your entered total of $${totalPrice}.`,
  });
}

module.exports = { sendPriceMatchEmail };
