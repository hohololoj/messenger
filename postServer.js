import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
    {   
        pool: true,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'chatmeruofc@gmail.com',
            pass: 'ChatMeRuOfc890'
        }
    },
    {
        from: 'ChatMe <chatmeruofc@gmail.com>'
    }
)

function mailer(message){
    transporter.sendMail(message, (err, info) => {
        if(err){
            console.log(err);
        }
        console.log('Email sent: '+info);
        transporter.close();
    })
}

export {mailer};