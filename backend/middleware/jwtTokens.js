const jwt = require('jsonwebtoken')

// SIGN JWT MIDDLEWARE
function jwtTokens({ id, user_name, email }) {
    const dataUser = { id, user_name, email }; 
    const accessToken = jwt.sign(dataUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20d' });
    // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '5m' });
    return  accessToken;
}

module.exports = {jwtTokens}