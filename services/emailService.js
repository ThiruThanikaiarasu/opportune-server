const path = require('path')
const fs = require('fs')

const EmailError = require('../errors/EmailError')
const transporter = require('../configurations/smtpConfig')

const sendOtpThroughMail = (to, otp) => {
    try{
        if (!to || !otp) {
            throw new EmailError("Recipient email and OTP must be provided.",400)
        }

        const templatePath = path.join(__dirname, '../templates/otpTemplate.html')
        let htmlContent = fs.readFileSync(templatePath, 'utf8')

        htmlContent = htmlContent.replace('${otp}', otp)

         const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Your OTP Code',
            html: htmlContent,
            attachments: [
                {
                    filename: 'opportune_logo_png.png',
                    path: path.join(
                        __dirname,
                        '../assets/images/opportune_logo_png.png'
                    ),
                    cid: 'image1',
                },
            ],
        }
          
        return transporter.sendMail(mailOptions)
    }
    catch(error)
    {
        throw error
    }
}

module.exports = {
    sendOtpThroughMail
}