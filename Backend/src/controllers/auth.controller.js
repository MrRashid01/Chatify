import User from "../models/User.js"
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";

export const signup=async(req,res)=>{
    const {fullName,email,password}=req.body;

    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Please provide a valid email address"});
        }

        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User with this email already exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){    
            const savedUser=await newUser.save();
            generateToken(savedUser._id,res);
            

            return res.status(201).json({
                _id:savedUser._id,
                fullName:savedUser.fullName,
                email:savedUser.email,
                profilePic:savedUser.profilePic,
            });
        }
        else{
            return res.status(400).json({message:"Invalid user data"});
        }
    }catch(error){
        console.error("Error during signup:",error);
        return res.status(500).json({message:"Server error"});
    }
}