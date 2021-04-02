const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const User = require('../models/User')
const Post = require('../models/Post')
const asyncHandler = require('../middlewares/async')
const {registerValidation, loginValidation} = require('../middlewares/validation')
const geocoder = require('../utilities/geocoder')

//@desc creates a user 
//@router POST /api/v1/user/register
//@access public 

exports.createUser = asyncHandler(async(req, res, next) => {
   //register validation
   const {error} = registerValidation(req.body)
   if(error) res.status(400).json({success: false, message: error.details[0].message})

   //hash password
   const salt = await bcrypt.genSalt(10)
   req.body.password = await bcrypt.hash(req.body.password, salt)
   //create new user 
   try{
      const user = await User.create(req.body)
      res.status(200).json({success: true, data: user})
   }catch(err){
      if(err.code == 11000) res.status(400).json({success:false, message:'Username or email are duplicates'}) 
   }
})

//@desc login as a user 
//@router POST /api/v1/user/login
//@access public 

exports.loginUser = asyncHandler(async(req,res,next) => {
   const {error} = loginValidation(req.body)
   if(error) return res.status(400).send(error.details[0].message)

   //check if email or username is duplicate 
   const user = await User.findOne({username: req.body.username})
   if(!user) return res.status(400).json({success: false, message: 'Username or password wrong'})

   //Password correct 
   const validPass = await bcrypt.compare(req.body.password, user.password)
   if(!validPass) return res.status(400).send('Username or password wrong')

   //Create and assign a token
   const token = jwt.sign({_id: user.id}, process.env.SECRET_TOKEN)
   res.header('auth-token', token).send(token)
})

//@desc gets all the posts on a given radius
//@router GET /api/v1/user/getcloseposts
//@access private 

exports.getClosePosts = asyncHandler(async(req,res,next) => {
   const user = await User.findById(req.user._id)
   const distance = req.query.distance
   const loc = await geocoder.geocode(user.location.formattedAddress) 
   const lat = loc[0].latitude
   const lon = loc[0].longitude
   const radius = distance / 6378
   const posts = await Post.find({
      location: {
      $geoWithin:{$centerSphere: [ [lon,lat], radius]}
      }
   })
   res.status(200).json({success: true, count: posts.length, data: posts})
})

//@desc gets all the saved posts
//@router GET /api/v1/user/getsavedposts
//@access private 

exports.getSavedPosts = asyncHandler(async(req,res,next) => {
   const user = await User.findById(req.user._id)
   const posts = user.savedPosts
   res.status(200).json({success: true, count: posts.length, data: posts})
})

//@desc edits the user 
//@router PUT /api/v1/user/edit
//@access private 

exports.editUser = asyncHandler(async(req,res,next) => {
   const salt = await bcrypt.genSalt(10)
   const user = await User.findById(req.user._id)
   //check if password is getting edited
   if(!req.body.password) req.body.password = user.password
   else req.body.password = await bcrypt.hash(req.body.password, salt)
   //username not going to be edited
   req.body.username = user.username
   //check if email is getting edited
   if(!req.body.email) req.body.email = user.email
   //check if location is getting edited 
   if(!req.body.address) req.body.address = user.location.formattedAddress
   //validate sent data 
   const {error} = registerValidation(req.body)
   if(error) res.status(400).json({success: false, message: error.details[0].message})
   
   const loc = await geocoder.geocode(req.body.address);
   req.body.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].contryCode
   }
   req.body.address = undefined

   try{
      await User.findByIdAndUpdate(user._id, req.body)
      res.status(200).json({success: true, message: 'User modified correctly'})
   }catch(err){
      if(err.code == 11000) res.status(400).json({success:false, message:'Username or email are duplicates'}) 
   }
})