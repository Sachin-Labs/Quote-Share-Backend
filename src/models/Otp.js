
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
    emailId:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true,
        default:0
    },
    expires:{
        type:Date,
        required:true,
        default:() => new Date(Date.now() + 3 * 60 * 1000),
    },
    verified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema)
export default Otp;