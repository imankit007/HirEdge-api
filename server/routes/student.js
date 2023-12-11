const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const { studentColl } = require('../utils/dbConfig');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403);
        if (user.role != 'student') {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user
        next()
    })
}


router.get('/student/profile', authenticateToken, async (req, res) => {

    const user = await studentColl.findOne({
        'user_id': req.user.user_id.toString().toLowerCase()
    }, {
        projection: {
            '_id': 0, 'password': 0,
        }
    })

    res.status(200).send(user);
})



module.exports = router;