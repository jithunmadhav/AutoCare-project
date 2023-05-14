import mongoose from "mongoose";

export function dbconnect(){
    mongoose.connect("mongodb://localhost:27017/AutoCARE").then(()=>{
        console.log("DBconnected");
    }).catch((err)=>{
        console.log(err);
    })
}
