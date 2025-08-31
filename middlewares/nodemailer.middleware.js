const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SUPER_ADMIN_EMAIL_USER,
    pass: process.env.PASSWORD_NODEMAILER
  },
  tls: {
    rejectUnauthorized: false, 
  }
});

  const sendEmail = async (req , res , next  ) => {
  try {
    const {sentEmail : to, email , password , role} = req.body;

    if (!to || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required to send the email.' });
    }

const text = `
🌟 مرحبًا بك في Clothify 👋

تم إنشاء حساب جديد لك على لوحة التحكم Clothify.

📧 البريد الإلكتروني: ${email}
🔐 كلمة المرور: ${password}
🛡️ صلاحيتك: ${role}

يمكنك الآن تسجيل الدخول وبدء استخدام النظام.

🔗 رابط تسجيل الدخول: https://clothify.com/login
🔗 رابط لوحة المعلومات: https://clothify.com/dashboard

تحياتنا،
فريق Clothify

--------------------------------------------

🌟 Welcome to Clothify 👋

A new account has been created for you in the Clothify admin dashboard.

📧 Email: ${email}
🔐 Password: ${password}
🛡️ Role: ${role}

You can now log in and start using the system.

🔗 Login link: https://clothify.com/login
🔗 Dashboard link: https://clothify.com/dashboard

Regards,  
Clothify Team
`.trim();

      const mailOptions = {
        from: `"Clothify 👕" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🎉 Welcome to Clothify!',
        text,
      }

    if(!mailOptions){
    return res.status(400).json({ message: 'Failed send Email' });
    }

    await transporter.sendMail(mailOptions);
    return next();
    } catch (err) {
    next(err)
    }
}

module.exports = { sendEmail };
