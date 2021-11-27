const { Pool } = require('pg')
const dotenv = require ('dotenv')
dotenv.config();

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATA_BASE,
    password: process.env.PASSWORD,
    port: process.env.PORT_DATA_BASE
})

module.exports = pool