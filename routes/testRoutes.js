const express = require('express')
const router = express.Router()
const testController = require('../controllers/testController')

router.post('/create', testController.createTest)

module.exports = router
