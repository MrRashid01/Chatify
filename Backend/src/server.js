// const express=require("express");
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app=express();

app.use(express.json());


const __dirname= path.resolve();

const PORT=ENV.PORT ||4000;

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

// if(ENV.NODE_ENV==="production"){
//     app.use(express.static(path.join(__dirname,"/Frontend/dist")));

//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"))
//     })
// }   

app.listen(PORT,()=>{
    console.log("Server running on port "+ PORT)  
    connectDB();
})
