const multer = require('multer')

//multer storage 
const storage = multer.diskStorage({
   destination: function(req, file, callback){
      callback(null, './uploads/images')
   },

   //add back the extension
   filename:function(req, file, callback){
      callback(null, req.user.username + Date.now() + file.originalname)
   }
})

//upload parameters for multer
const upload = multer({
   storage:storage,
   limits:{
      fileSize:1024*1024*3
   }
})

module.exports = upload