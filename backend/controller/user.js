const bcrypt = require('bcrypt')
const pool = require('../db')


// CONTROLLER CHANGE USER'S PASSWORD
const changePassword = async (req, res) => {
    const { password,  newPassword } = req.body
    const loggedUserId = req.user.id
        try {
            const getPassword = await pool.query('SELECT PASSWORD FROM "users" WHERE user_id = $1', [
            loggedUserId
            ])
            const checkPass = await bcrypt.compare(password, getPassword.rows[0].password)
            if (!checkPass) {
            return res.status(401).json({ message: 'Password does not match. Please try again later' })
            }
            const salt = await bcrypt.genSalt(10)
            const newHashedPassword = await bcrypt.hash(newPassword, salt)
            await pool.query('UPDATE "users" SET PASSWORD = $2 WHERE user_id = $1', [
            loggedUserId,
            newHashedPassword
            ])
            return res.status(200).json({ message: 'Password updated successfully' })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'There was an error. Please try again later' })
        }
    
    
}

// CONTROLLER CHANGE USER'S PROFILE
const changeProfile = async (req, res) => {
    const updatedData = req.body
    const loggedUserId = req.user.id
    const columns = {
        user_name: 'USER_NAME',
        email: 'EMAIL'
    }
    
    try {
        let update = ''
        const values = [loggedUserId]
        Object.keys(updatedData).forEach((field, index) => {
            if (index) update += ', '
            update += `${columns[field]} = $${index + 2}`
            values.push(updatedData[field])
        })
        const query =
            'UPDATE "users" SET ' +
            update +
            ' WHERE user_id = $1 RETURNING USER_NAME, EMAIL, AVATAR'
        
        const result = await pool.query(query, values)
        res.status(200).json({
            id: loggedUserId,
            user_name: result.rows[0].user_name,
            email: result.rows[0].email,
            avatar: result.rows[0].avatar,
            role: result.rows[0].role
        })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'There was an error. Please try again later' })
    }
}


// CONTROLLER CHANGE USER'S AVATAR
const changeAvatar = async (req, res) => {
    const avatar = req.file.path
    const loggedUserId = req.user.id
    try {
        const result = await pool.query('UPDATE "users" SET AVATAR = $2 WHERE USER_ID = $1 RETURNING USER_ID, AVATAR', [loggedUserId, avatar])
        res.status(200).json({
            id: loggedUserId,
            avatar: result.rows[0].avatar
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'There was an error. Please try again later' })
    }   
}


// CONTROLLER GET USER 
const getUser = async (req, res) => {
    const username = req.body
    try {
        result = await pool.query('SELECT user_name avatar FROM users WHERE user_name = $1', [username])
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'There was an error. Please try again later' })
    } 
}
module.exports = {changePassword, changeProfile, changeAvatar, getUser}