const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const { studentColl, companyColl } = require('../utils/dbConfig');
const { UUID } = require('mongodb');


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


router.get('/student/jobs', async (req, res) => {
    const cursor = companyColl.find({}, {
        projection: {
            '_id': 0
        }
    })
    let data = [];
    for await (const doc of cursor) {
        data.push(doc);
    }
    res.status(200).send(data);
})

router.post('/student/addquery', (req, res) => {

    const query = {
        query_id: 1,
        company_id: req.query.company_id,
        query_type: req.query.query_type,
        query_title: req.body.query_title,
        query_description: req.body.query_description,
    };

    res.status(200).send({
        "message": "Query Posted Successfully",
        data: query
    })

})



module.exports = router;