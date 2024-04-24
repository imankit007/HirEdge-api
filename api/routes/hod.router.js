const express = require('express');
const jwt = require("jsonwebtoken");

const { getDeptPlacementData } = require('../utils/hod.utils');
const router = express.Router();


function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403);
        if (user.role != 'hod') {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user
        next()
    })
}


router.get('/placementdata', authenticateToken, async (req, res) => {

    const branch = String(req.user.user_id).toUpperCase();

    const data = await getDeptPlacementData(branch)

    res.status(200).json(data);

})






module.exports = router;