import  jwt  from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();


const isAuth=async(req,res,next)=>{
try{
const token=req.cookies.token;
if(!token){
    return res.status(400).json({
        message: "Token not fount"
    })
}
const decodeToken=await jwt.verify(token,process.env.JWT_SECRET);
if(!decodeToken){
      return res.status(400).json({
        message: "Token not Verify"
    })  
}
req.userId=decodeToken.userId;
next();
}catch(error){
      return res.status(500).json({
        message: "isAuth middleware error",
        error
    })  
}
}

export {isAuth}