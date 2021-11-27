const router = require('express').Router()

const {imageUpload} = require('../middleware/upload')
const {upload} = require('../controller/upload')

router.post('/upload', imageUpload.single('image'), upload)

module.exports = router