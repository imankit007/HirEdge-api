const express = require('express');
const router = express.Router();

// const { authenticateToken } = require('../utils/auth')


function authenticateToken(req, res, next) {

    // console.log("auth ")

    // console.log(req.headers);

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403);
        if (user.role != 'alumni') {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user
        next()
    })
}


router.get('/tpo/profile', authenticateToken, (req, res) => {
    res.send("Hello");
})



module.exports = router;