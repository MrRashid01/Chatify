import User from "../models/User.js"
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js"; 
import {ENV} from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

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
            
            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
                console.log("Welcome email sent successfully");
            }catch(error){
                console.error("Error sending welcome email:",error);    
            }
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

export const login=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Please provide both email and password"});
    }

    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid email or password"});
        }
        generateToken(user._id,res);
        return res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        });
    }catch(error){
        console.error("Error during login:",error);
        return res.status(500).json({message:"Server error"});
    }
}

export const logout=(_,res)=>{
     res.cookie("jwt","",{maxAge:0});
     return res.status(200).json({message:"Logged out successfully"});
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email, profilePic } = req.body;

    const updateData = {
      fullName,
      email,
    };

    // Upload image only if one is provided
    if (profilePic) {
      const uploadedImage = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
        width: 150,
        crop: "scale",
      });

      updateData.profilePic = uploadedImage.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during profile update:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};