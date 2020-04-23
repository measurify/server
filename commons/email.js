const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const transporter = nodemailer.createTransport({
   sendmail: true,
   newline: 'unix',
   path: '/usr/sbin/sendmail'
});

exports.send = async function(message) {
   const options = {
      from: process.env.EMAIL,
      to: message.to,
      subject: process.env.EMAIL_TAG + ' ' + message.subject,
      text: message.text,
      html: message.html
   };

   let email;
   if(process.env.ENV === 'test') email = { from: process.env.EMAIL, to: message.to, messageId: "test" };
   else email = await transporter.sendMail(options);
   return email;
};
