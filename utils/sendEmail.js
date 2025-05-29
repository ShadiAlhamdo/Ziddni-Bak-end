const nodemailer = require("nodemailer");

module.exports = async (userEmail, subject, htmlTemplate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS,
            to: userEmail,
            subject: subject,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("NodeMailer Error:", error);
        throw new Error("Internal Server Error (NodeMailer)");
    }
};
