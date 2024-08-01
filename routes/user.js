const express = require('express')
const User = require("../models/user")
const {handleUserSignup, handleUserlogin} = require('../controllers/user')
const router = express.Router()

router.post('/', handleUserSignup)
router.post("/login", handleUserlogin)

module.exports = router