const router = require('express').Router()
const { createCategory } = require('../controller/categories')
const { requireLogin, adminMiddleware } = require('../middleware/checkAuth')

// CREATE CATEGORY ROUTE
router.post('/createCategory', requireLogin, adminMiddleware,createCategory) 

module.exports = router