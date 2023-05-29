import jwt from 'jsonwebtoken'
import userModel from '../model/userModel.js';

export const userCheckAuth=async(req,res)=>{
    const token = req.cookies.userToken;
    if(token){
    const verifyJwt= jwt.verify(token,'00f3f20c9fc43a29d4c9b6b3c2a3e18918f0b23a379c152b577ceda3256f3ffa');
    let ID=verifyJwt.id;
    const user=await userModel.find({_id:ID})
    res.json({logged:true,details:user})
    }else{
     res.json({logged:false,err:true,message:'No token'})
    }
 }
 