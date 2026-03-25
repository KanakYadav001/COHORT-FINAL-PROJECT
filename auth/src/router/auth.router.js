const express = require('express')
const  middlewares = require('../middleware/validator.middleware')
const authController = require('../controller/auth.controller')
const router = express.Router()


router.post('/register',middlewares.IsvalidInput, authController.Register) 
router.post('/login',middlewares.CheckLoginInput,authController.Login)

module.exports = router