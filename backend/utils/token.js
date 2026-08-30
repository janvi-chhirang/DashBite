import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


const genToken=async(userId)=>{
  try{
   const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'1d'})
   return token;
  }catch(err){
    console.log(err)
  }
}

export default genToken