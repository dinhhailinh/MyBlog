const bcrypt = require('bcrypt')
const pool = require('../db')
const {jwtTokens} = require('../middleware/jwtTokens')

// REGISTER CONTROLLER
const register = async(req, res) => {
    const {username, email, password} = req.body;
    try {
            const checkUser = await pool.query(`SELECT * FROM "users" WHERE USER_NAME = $1 OR EMAIL = $2`, [username, email])
            if(checkUser.rowCount > 0 ){
               return res.status(409).json("account has been exist!");
            }
            
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(password, salt)
            const newUser = await pool.query(`INSERT INTO "users"(USER_NAME, EMAIL, PASSWORD) VALUES($1, $2, $3) RETURNING *`, [username, email, hashedPass]);
            
            const resp = {
                //accessToken: '',
                newUser: {
                  id: newUser.rows[0].user_id,
                  username: newUser.rows[0].user_name,
                  email: newUser.rows[0].email,
                  password: newUser.rows[0].password,
                  avatar: newUser.rows[0].avatar,
                  role: newUser.rows[0].role
                }
            }
            resp.accessToken = jwtTokens({id: newUser.rows[0].user_id, user_name: newUser.rows[0].user_name, email: newUser.rows[0].email})
        
            return res.status(200).json(resp);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    
}

//LOGIN CONTROLLER
const login = async(req, res) => {
    const {username, email, password} = req.body
    try {
        const checkUser = await pool.query(`SELECT * FROM "users" WHERE EMAIL = $1 OR USER_NAME = $2`, [email, username])
        if (!checkUser.rowCount) {
            return res.status(401).json({error : "account is not found!"})
        }
        const checkPass = await bcrypt.compare(password, checkUser.rows[0].password)
        if (!checkPass) {
            return res.status(401).json({error: "password incorrect"})
        }
        const resp = {
            accessToken: '',
            user: {
              id: checkUser.rows[0].user_id,
              user_name: checkUser.rows[0].user_name,
              email: checkUser.rows[0].email,
              avatar: checkUser.rows[0].avatar,
              role: checkUser.rows[0].role
            }
        }
        resp.accessToken = jwtTokens({id: checkUser.rows[0].user_id, user_name: checkUser.rows[0].user_name, email: checkUser.rows[0].email})
        return res.status(200).json(resp)
    } catch (error) {
        res.status(401).json({error: "something went wrong!"})
        console.log(error);
    }
}

const logout = async (req, res) => {
    res.clearCookie("accessToken");
    res.status(200).json({
    message: "Logout successfully...!",
  });
}
module.exports = {register, login, logout}