const express = require('express');
const router = express.Router();
const { studentColl, tpoColl } = require('../utils/dbConfig');
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


router.get('/tpo/profile', authenticateToken, async (req, res) => {


    var user = await tpoColl.findOne({
        'user_id': req.user.user_id.toString().toLowerCase()
    }, {
        projection: { 'password': 0, '_id': 0 },

    });

    res.status(200).send(user);

})

router.post('/tpo/addstudent', authenticateToken, (req, res) => {

    console.log(req.body);

    var user = {

        user_id: req.body.usn,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        mobile: req.body.mobile,
        email: req.body.email,
        branch: req.body.branch,
        tenth_percentage: req.body.tenth_percentage,
        twelfth_percentage: req.body.twelfth_percentage,
        ug_cgpa: req.body.ug_cgpa
    }

    console.log(user);

    res.send("Student Added in Database");
})

router.post('/tpo/addjob', authenticateToken, (req, res) => {
    console.log(body);


    var job = {
        company_name: req.body.company_name,
        job_role: req.body.job_role,
        tenth_cutoff: req.body.tenth_cutoff,
        twelfth_cutoff: req.body.twelfth_cutoff,
        ug_cutoff: req.body.ug_cutoff,
        job_location: req.body.job_location,
        job_ctc: req.body.job_ctc,
    }
    console.log(job);
    res.send("Job Posted");

})


module.exports = router;