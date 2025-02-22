import nodemailer  from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "devrajlokhande1610@gmail.com",
      pass: process.env.NODEMAILER_APP_PASS
    },
});

export default async function sendEmail(senderEmail: string, centerName: string)  { 
    const info = await transporter.sendMail({
        from: "devrajlokhande1610@gmail.com", 
        to: senderEmail,
        subject: "To inform about Accident", 
        text: `Accident is held near the center : ${centerName}`
    })

    console.log("Message sent : ", info.messageId)  
}

