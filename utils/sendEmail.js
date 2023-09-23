const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // const transporter = nodeMailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: true,
  //   service: process.env.SMTP_SERVICE,

  //   auth: {
  //     //SMTP : Simple Mail Transfer Protocol
  //     //type: "OAuth2",
  //     // user: process.env.SMTP_MAIL,
  //     // pass: process.env.SMTP_PASSWORD,
  //     user: "codewithprogrammer7@gmail.com",
  //     pass: "Dhruv1392@",
  //   },

    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "3b6778acc8b768",
        pass: "e6beac3fae8c94",
      },
    });

  const mailOptions = {
    from: "codewithprogrammer7@gmail.com",
    // from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
//	smtp-mail.outlook.com
module.exports = sendEmail;



const { MailtrapClient } = require("mailtrap");

// For this example to work, you need to set up a sending domain,
// and obtain a token that is authorized to send from the domain







