const express = require('express');
const router = express.Router();
const { studentColl } = require('../utils/dbConfig');
const jwt = require('jsonwebtoken');
// const { authenticateToken } = require('../utils/auth')


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403);
        if (user.role != 'tpo') {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user
        next()
    })
}


router.get('/tpo/profile', authenticateToken, (req, res) => {
    res.send("Hello");
})

router.post('/tpo/addstudent', authenticateToken, (req, res) => {

    console.log(req.body);

    var user = {

        user_id: req.body.usn,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        branch: req.body.branch,

    }

    console.log(user);

    res.send("Student Added in Database");
})



module.exports = router;