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
      subject: "Verification Mail",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
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
