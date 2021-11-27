const router = require('express').Router()
const { createPost, getAllPost, updatePost, getPostByUser, deletePost, likePost, createComment, getComment, deleteComment, editComment } = require('../controller/posts')
const { requireLogin } = require('../middleware/checkAuth')
const { imageUpload } = require('../middleware/upload')

// ROUTE GET ALL POST
router.get('/post',getAllPost)

// ROUTE GET POST BY USER
router.get('/post/:user_id',getPostByUser)

// ROUTE GET POST
router.get('/post/getComment/:post_id', getComment)

// ROUTE CREATE POST
router.post('/createPost', requireLogin, imageUpload.single('post_image'),createPost) 

//ROUTE LIKE POST
router.post('/like',requireLogin, likePost)

//ROUTE CREATE COMMENT
router.post('/comment/:post_id',requireLogin, createComment)

// ROUTE UPDATE POST
router.put('/updatePost/:id', requireLogin, updatePost) 

//ROUTE EDIT COMMENT
router.put('/editComment/:id', requireLogin, editComment) 

// ROUTE DELETE POST
router.delete('/post/:id',requireLogin, deletePost)

//ROUTE DELETE COMMENT
router.delete('/comment/:id',requireLogin, deleteComment)

module.exports = router