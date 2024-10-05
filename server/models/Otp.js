const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true
  },
  otp:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now,
    expires:'5m'
  }
});

async function sendVerificationEmail(email,otp){
    try {
        const mailResponse = await mailSender(email,"Verification Email from StudyNotion",otp)
        console.log("Email sent Successfully ",mailResponse);
    } catch (error) {
        console.log("Error occured while sending mail");
        throw error;
    }
}

otpSchema.pre("pre",async function (next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("Otp", otpSchema);
