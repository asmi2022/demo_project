const nodemailer = require("nodemailer");

exports.sendMail = async(to, sub, body)=>{
    try {
        let transport = nodemailer.createTransport({
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
            service: "gmail"
        });
        return await transport.sendMail({
            from: process.env.MAIL_USERNAME,
            to: to,
            subject: sub,
            html: body
        });
    } catch (error) {
        throw error;
    }
}