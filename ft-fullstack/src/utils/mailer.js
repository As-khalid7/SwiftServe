const nodemailer = require("nodemailer");

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

/**
 * Sends the password-reset email. If SMTP isn't configured (local/dev),
 * it simply logs the reset link to the console so the flow still works
 * end-to-end without needing a real mail provider.
 */
async function sendPasswordResetEmail(toEmail, resetLink) {
  if (!smtpConfigured) {
    console.log("──────────────────────────────────────────────");
    console.log("✉  SMTP غير مُعد — رابط إعادة تعيين كلمة المرور:");
    console.log(`   إلى: ${toEmail}`);
    console.log(`   الرابط: ${resetLink}`);
    console.log("──────────────────────────────────────────────");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Future Technology <no-reply@futuretech.sa>",
    to: toEmail,
    subject: "إعادة تعيين كلمة المرور — Future Technology",
    html: `
      <div style="font-family:sans-serif;direction:rtl;text-align:right;line-height:1.8;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>وصلنا طلب لإعادة تعيين كلمة المرور لحسابك. اضغط على الرابط التالي لإنشاء كلمة مرور جديدة:</p>
        <p><a href="${resetLink}" style="background:#14B8A6;color:#0D1B2A;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">إعادة تعيين كلمة المرور</a></p>
        <p>إذا ما طلبت هذا، تجاهل الرسالة ولن يتغير شيء بحسابك.</p>
        <p style="color:#888;font-size:12px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
      </div>
    `
  });
}

module.exports = { sendPasswordResetEmail };
