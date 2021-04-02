const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async function (req,res,next){
   const token = req.header('auth-token')
   if(!token) return res.status(401).json({success: false, message:'Access Denied'})
   try{
      const verified = jwt.verify(token, process.env.SECRET_TOKEN)
      req.user = await User.findById(verified._id)
      next()
   }catch(err){
      res.status(400).send({success: false, message: 'Invalid Token'})
   }
}