const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join("uploads"))
    },
    filename(req, file, cb) {
      cb(
        null,
        `${Date.now()}-${path.extname(file.originalname)}`
      )
    },
})


const fileFilter = (req, file, callback) => {
    const filetypes = ['*.jpg','*.jpeg','*.png']
    //const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.includes(file.mimetype)

    if (!mimetype) {
        return callback(null, true)
    } else {
        callback('Images only!')
    }
}

// UPLOAD FILE MIDDLEWARE
const imageUpload = multer({ storage: storage, fileFilter: fileFilter })

module.exports = { imageUpload }