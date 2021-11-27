
const upload = async (req, res) => {
    try {
        await res.status(200).json(`upload success: ${req.file.path}`)
          
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {upload}