const express = require('express')
const  middlewares = require('../middleware/validator.middleware')
const authController = require('../controller/auth.controller')
const authMiddleware = require('../middleware/auth.middlware')
const router = express.Router()


router.post('/register',middlewares.IsvalidInput, authController.Register) 
router.post('/login',middlewares.CheckLoginInput,authController.Login)
router.get('/me',authMiddleware,authController.GetInfo)
router.post('/logout',authController.Logout)
router.get('/address',authMiddleware,authController.GetAddress)
router.post('/address',authMiddleware,middlewares.ValidateAddressInput,authController.CreateUserAddress)
router.delete('/address',authMiddleware,authController.DeleteUserAddress)

module.exports = router