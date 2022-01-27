const router = require('express').Router()
const { register, login, logout } = require('../controller/auth')
const { validateRegisterRequest, validateLoginRequest, isRequestValidated } = require('../middleware/validator')

// REGISTER ROUTE
router.post('/auth/register', validateRegisterRequest, isRequestValidated,register) 

// LOGIN ROUTE
router.post('/auth/login', validateLoginRequest, isRequestValidated,login)

//LOGOUT ROUTE
router.post('/auth/logout', logout)

module.exports = router