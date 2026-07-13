// const express=require("express");
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";


dotenv.config();
const app=express();

app.use(express.json());


const __dirname= path.resolve();

const PORT=process.env.PORT ||4000;

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

// if(process.env.NODE_ENV==="production"){
//     app.use(express.static(path.join(__dirname,"/Frontend/dist")));

//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"))
//     })
// }   

app.listen(PORT,()=>{
    console.log("Server running on port "+ PORT)  
    connectDB();
})
