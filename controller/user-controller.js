import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from "../model/user.js";
import Token from "../model/token.js";

dotenv.config();

export const signupUser = async (request,response) =>{
   try{
    //const salt = await bcrypt.genSalt();  aajkal salt likhne ki need nhi ye 10 word ka salt by default le lega
    const hashedPassword = await bcrypt.hash(request.body.password,10);


     const user = {username: request.body.username, name: request.body.name, password: hashedPassword}

     await User.create(user);

     return response.status(200).json({msg: 'signup successful'})
   }catch(error){
    return response.status(500).json({msg : 'error while signup user'})
   }
}

export const loginUser = async (request,response) =>{
  let user = await User.findOne({username: request.body.username})
  if(!user){
    return response.status(400).json({msg : 'Username does not match'});
  }

  try{
    let match = await bcrypt.compare(request.body.password,user.password);
    if(match){
      const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_SECRET_KEY, {expiresIn: '15m'});
      const refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_SECRET_KEY);

      const newToken = new Token({token : refreshToken})
      await newToken.save();

      return response.status(200).json({accessToken: accessToken, refreshToken: refreshToken, name: user.name, username: user.username})

    }else{
      return response.status(400).json({msg : 'Password does not match'});
    }

  }catch(error){
    return response.status(500).json({msg: " Error while login in user "})
  }
}