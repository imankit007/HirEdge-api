
require('dotenv').config();

const jwt = require('jsonwebtoken')

function generateAuthToken(username, expiresIn) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: expiresIn });
}


function authenticateToken(req, res, next) {

    console.log("auth ")

    console.log(req.headers);

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        req.user = user
        next()
    })
}


module.exports = {
    generateAuthToken,
    authenticateToken
}