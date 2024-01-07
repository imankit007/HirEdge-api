const express = require('express');
const { alumniColl, companyDBColl } = require('../utils/dbConfig');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const { authenticateToken } = require('../utils/auth')


function authenticateToken(req, res, next) {
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


router.get('/alumni/profile', authenticateToken, (req, res) => {

    alumniColl.findOne({
        'user_id': req.user.user_id
    }, {
        $projection: {

        }
    }).then((user) => {
        res.status(200).send(user);
    }).catch((e) => {
        return res.sendStatus(404);
    })
});

router.get('/alumni/getcompanylist', authenticateToken, async (req, res) => {

    const search = req.query.search;

    const companyList = await companyDBColl.find({
        'company_name': {
            $regex: search,
            $options: 'i'
        }
    }, { projection: { 'label': '$company_name', id: '$_id', _id: 0 } }).toArray();

    res.status(200).json(companyList);

})



module.exports = router;