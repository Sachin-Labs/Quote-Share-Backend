import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_URI,
  port: process.env.BREVO_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

export const sendOtp = async ({ emailId, otp }) => {
  try {
    const mailOptions = {
      from: "noreply@quoteshare.work.gd",
      to: emailId,
      subject: "Your One-Time Password (OTP) for QuoteShare",
      text: `Hello,

Thank you for using QuoteShare! To verify your email address and continue, please use the One-Time Password (OTP) below:

OTP: ${otp}

This OTP is valid for the next 3 minutes. Please do not share it with anyone.

If you did not request this OTP, you can safely ignore this message. Your account remains secure.

Need help or have questions? Reach out to us anytime at balagamsachin337@gmail.com

Best wishes,  
Team QuoteShare

—

QuoteShare is a platform where creativity meets daily inspiration. Thank you for being part of our journey!
`,
    };
    await transporter.sendMail(mailOptions);
    // console.log(mailOptions)
    // transporter.verify((err,success)=>{
    //   if(err){
    //     console.log(err.message)
    //   }else{
    //     console.log("Connected Successfully")
    //   }
    // })
  } catch (e) {
    // console.log("Error sending Mail");
    throw new Error(e.message);
  }
};
