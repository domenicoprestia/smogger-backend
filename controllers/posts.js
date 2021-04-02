const Post = require('../models/Post')
const User = require('../models/User')
const asyncHandler = require('../middlewares/async')
const {postValidation} = require('../middlewares/validation')
const { post } = require('../routes/posts')

//@desc creates a post  
//@router POST /api/v1/posts/create
//@access private 

exports.createPost = asyncHandler(async (req, res, next) => {
   req.body.creator = req.user.username

   const {error} = postValidation(req.body)
   if(error) res.status(400).json({success: false, message: error.details[0].message})

   req.body.image = './uploads/images/' + req.file.filename
   const post = await Post.create(req.body)
   res.status(200).json({success: true, post: post})
})

//@desc gets all the posts 
//@router GET /api/v1/posts/
//@access public 

exports.getPosts = asyncHandler(async (req, res, next) => {
   let query
   const reqQuery = {...req.query}
   if(reqQuery.creator) if(reqQuery.creator.includes(',')){
      let creators = reqQuery.creator.split(',')
      reqQuery.creator = creators
   } 
   
   query = Post.find(reqQuery)

   posts = await query
   res.status(200).json({success: true, count: posts.length, posts: posts})
})

//@desc saves a post 
//@router PUT /api/v1/posts/:id/save
//@access private 

exports.savePost = asyncHandler(async (req,res,next) => {
   const post = await Post.findById(req.params.id)
   const user = await User.findById(req.user._id)
   let check = false
   let message = "saved"
   for(let i = 0; i < user.savedPosts.length; i++){
      console.log(i)
      if(String(user.savedPosts[i]._id) == String(post._id)){
         user.savedPosts.splice(i,1)
         message = "unsaved"
         check = true
     }
   }
   if(!check){
   user.savedPosts.push(post)}

   await User.findByIdAndUpdate(req.user._id, user)
   res.status(200).json({success: true, message: 'Post with id of: ' + post._id + " " + message})
})

//@desc deletes a post 
//@router DELETE /api/v1/posts/:id/delete
//@access private

exports.deletePost = asyncHandler(async (req, res, next) => {
   const post = await Post.findById(req.params.id)
   const user = await User.findById(req.user._id)
   try{
   if(post.creator != user.username) return res.status(200).json({success: false, message: 'You can delete only your own posts'})}
   catch(err){
      return res.status(400).json({success: false, message: 'This post do not exist'})
   }
   const postToDelete = await Post.findById(req.params.id)
   await postToDelete.remove()
   res.status(200).json({success: true, message: 'Post with id of: ' + post._id + ' deleted'})
})

