const config = require('../config');
const nodemailer = require("nodemailer");
let aws = require('../config/email-conf');
let sesTransport = require('nodemailer-ses-transport');
let awsSDK = require('aws-sdk');
let s3 = new awsSDK.S3();

console.log("TRANSPORTER_EMAIL", process.env.TRANSPORTER_EMAIL)
console.log("TRANSPORTER_PASSWORD", process.env.TRANSPORTER_PASSWORD)

const sendEmail = async (email, subject, content, attachment) => {
    // create reusable transporter object using the default SMTP transport
    try {
        let transporter = nodemailer.createTransport({
            // host: "smtp.ethereal.email",
            // port: 587,
            // secure: false, // true for 465, false for other ports
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
                user: process.env.TRANSPORTER_EMAIL, // generated ethereal user
                pass: process.env.TRANSPORTER_PASSWORD // generated ethereal password
            }

        });
        let obj = {
            from: 'no reply support@myvendors.com', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            // text: "Hello world?", // plain text body
            html: content // html body
        }

        if(attachment){
            obj.attachments = attachment
        }

        // send mail with defined transport object
        let info = await transporter.sendMail(obj);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (e) {
        console.log("eeeeeeeeeeeeeeee", e)
        throw e
    }

}


// const sendEmail = async (email, subject, content)=> {
//
//     let transporter = nodemailer.createTransport(sesTransport({
//         accessKeyId : aws.AWS_SES.accessKeyId,
//         secretAccessKey: aws.AWS_SES.secretAccessKey,
//         region:aws.AWS_SES.region
//     }));
//
//     return new Promise((resolve, reject) => {
//         transporter.sendMail({
//             from: process.env.SES_EMAIL, // sender address
//             bcc: email, // list of receivers
//             subject: subject, // Subject line
//             html: content
//         },(err,res)=>{
//             console.log('send mail',err,res);
//             resolve()
//         });
//     })
//
// };

module.exports = {
    sendEmail: sendEmail
};
