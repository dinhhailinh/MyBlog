const jwt = require('jsonwebtoken')

// REQUIRE LOGIN MIDDLEWARE
exports.requireLogin = async (req, res, next) => {
    const authHeader = req.headers['authorization']; //Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({error:"Null token"});
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
        if (error) return res.status(403).json({error : error.message});
        req.user = {
            id: data.id,
            user_name: data.user_name,
            email: data.email
        };
        next();
    });

};

// CHECK ADMIN MIDDLEWARE
exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "true") {

        return res.status(400).json({
            message: "Admin access denied"
        });
    }
    next();
};