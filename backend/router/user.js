const router = require('express').Router()

const { changePassword, changeProfile, changeAvatar } = require('../controller/user')
const { imageUpload } = require('../middleware/upload')
const { requireLogin } = require('../middleware/checkAuth')

// ROUTE CHANGE PASSWORD
router.put('/user/changePassword/:id', requireLogin, changePassword) 

// ROUTE CHANGE PROFILE
router.patch('/user/changeProfile/:id', requireLogin, changeProfile)

// ROUTE CHANGE AVATAR
router.put('/user/changeAvatar/:id', requireLogin, imageUpload.single('avatar'), changeAvatar)

module.exports = router