import adminModel from '../model/adminModel.js'
import mechanicModel from '../model/mechanicModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import {approvedMail, rejectMail} from '../helper/mail.js' 
   export const  adminLogin=async(req,res)=>{
        try {
            let {email,password}=req.body;
            let account=await adminModel.findOne({email:email})
            if(account){
                let status= await bcrypt.compare(password,account.password)
                if(status){
                    const token=jwt.sign({
                        id:account._id
                    },"00f3f20c9fc43a29d4c9b6b3c2a3e18918f0b23a379c152b577ceda3256f3ffa");
                    return res.cookie("token", token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 1000 * 60 * 60 * 24 * 7,
                        sameSite: "none",
                    }).json({ err: false ,message:'login success'}); 
                }else{
                    res.json({err:true,message:"Invalid email or password"})
                }
            }else{
                res.json({err:true,message:'No admin found'})
            }
          } catch (error) {
            console.log(error);                   
          }     
        
    }
   export const getMechanic=async(req,res)=>{
        try {
            let result=await mechanicModel.find()
            res.json({err:false,result})
        } catch (error) {
            console.log(error);
        }
    }
   export const appliedMechanics=async(req,res)=>{
        try {
            let result=await mechanicModel.find({applicationStatus:'applied'})
            res.json({err:false,result})
        } catch (error) {
            console.log(error);
        }
    }
    export const approveApplication=async(req,res)=>{
        try {
        let result= await mechanicModel.findByIdAndUpdate({_id:req.params.id},{$set:{applicationStatus:'approved'}})
        approvedMail(result.email,result.name)
        res.json({err:false,result})
        } catch (error) {
            console.log(error);
        }
    }
    export const rejectApplication=async(req,res)=>{
        try {
           let result= await mechanicModel.findByIdAndUpdate({_id:req.params.id},{$set:{applicationStatus:'rejected'}})
           if(result){
            rejectMail(result.email,result.name)
               res.json({err:false,result})
           }
        } catch (error) {
            console.log(error);
        }
    }
      