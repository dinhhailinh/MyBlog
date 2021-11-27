const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

const pool = require('./db')
const userAuth = require('./router/auth')
const user = require('./router/user')
const categories = require('./router/categories')
const posts = require('./router/posts')
const uploadImage = require('./router/upload')

const app = express()

dotenv.config()

app.use(express.json())
app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

pool.connect().then(console.log("success!")).catch(err => {
    console.log(err)
})

app.use('/api', userAuth)
app.use('/api', user)
app.use('/api', categories)
app.use('/api', posts)
app.use('/api', uploadImage)

app.listen(process.env.PORT,()=>{
    console.log(`Server running port ${process.env.PORT}`)
})