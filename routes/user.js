const express = require('express')
const verify  = require('../middlewares/verifyToken')
const router = express.Router()
const {createUser, loginUser, getClosePosts, getSavedPosts, editUser} = require('../controllers/user')
const { route } = require('./posts')
 
router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/getcloseposts', verify, getClosePosts)
router.get('/getsavedposts', verify, getSavedPosts)
router.put('/edit', verify, editUser)

module.exports = router