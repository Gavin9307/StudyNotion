const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Create a transporter with correct config
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true, 
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS  
      },
    });

    // Send the email
    let info = await transporter.sendMail({
      from: `StudyNotion <${process.env.MAIL_USER}>`, // Sender address
      to: email,      // Receiver's email
      subject: title, // Subject line
      html: body      // HTML body
    });

    console.log(info);
    return info;
  } catch (error) {
    console.log("Error Sending Mail");
    console.error(error);
  }
};

module.exports = mailSender;

