import jwt from "jsonwebtoken";
import {ENV} from "../lib/env.js";
import User from "../models/User.js";

export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:"Not authorized, token missing"});
        }

        const decoded=jwt.verify(token,ENV.JWT_SECRET);
        if(!decoded || !decoded.userId){
            return res.status(401).json({message:"Not authorized, invalid token"});
        }
        const user=await User.findById(decoded.userId).select("-password");
        // Check if the user exists in the database
        if(!user){
            return res.status(401).json({message:"Not authorized, user not found"});
        }
        req.user=user;// Attach the user object to the request for further use in the route handler
        
        next(); 
    }catch(error){
        console.error("Error in protectRoute middleware:",error);
        return res.status(500).json({message:"Server error"});
    }
}