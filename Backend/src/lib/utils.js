import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken=(userId,res)=>{
     const token=jwt.sign({userId},ENV.JWT_SECRET,{
         expiresIn:"7d"
     });
     res.cookie("jwt",token,{
         httpOnly:true,
         maxAge:7*24*60*60*1000, // 7 days
         sameSite:"strict",
         secure:ENV.NODE_ENV==="production"
     });
     return token;
}