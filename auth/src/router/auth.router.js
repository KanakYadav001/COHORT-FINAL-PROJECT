const express = require('express')
const  middlewares = require('../middleware/validator.middleware')
const authController = require('../controller/auth.controller')
const authMiddleware = require('../middleware/auth.middlware')
const router = express.Router()


router.post('/register',middlewares.IsvalidInput, authController.Register) 
router.post('/login',middlewares.CheckLoginInput,authController.Login)
router.get('/me',authMiddleware,authController.GetInfo)
router.post('/logout',authController.Logout)

module.exports = router