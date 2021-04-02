const express = require('express')
const verify  = require('../middlewares/verifyToken')
const router = express.Router()
const {createPost, getPosts, deletePost, savePost} = require('../controllers/posts')
const upload = require('../middlewares/multer')

router.post('/create', verify, upload.single('image'), createPost)
router.get('/', verify, getPosts)
router.delete('/:id/delete', verify, deletePost)
router.put('/:id/save', verify, savePost)

module.exports = router