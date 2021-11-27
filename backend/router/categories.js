const router = require('express').Router()
const { createCategory } = require('../controller/categories')

// CREATE CATEGORY ROUTE
router.post('/createCategory', createCategory) 

module.exports = router