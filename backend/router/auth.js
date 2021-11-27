const router = require('express').Router()
const { register, login, logout } = require('../controller/auth')

// REGISTER ROUTE
router.post('/auth/register', register) 

// LOGIN ROUTE
router.post('/auth/login', login)

//LOGOUT ROUTE
router.post('/auth/logout', logout)

module.exports = router