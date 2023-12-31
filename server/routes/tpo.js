const express = require('express');
const router = express.Router();
const { studentColl, tpoColl, companyDBColl, companyColl, alumniColl } = require('../utils/dbConfig');
const { getPrevYearOffers } = require('../common/index');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
// const { authenticateToken } = require('../utils/auth')


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

        if (err) return res.sendStatus(403);
        if (user.role != 'tpo') {
            return res.status(403).send("Unauthorized Access");
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
    console.log("Add Student Called")
    console.log(req.body);

    var user = {
        user_id: req.body.usn.toLowerCase(),
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        mobile: req.body.mobile,
        email: req.body.email,
        branch: req.body.branch,
        tenth_percentage: req.body.tenth_percentage,
        twelfth_percentage: req.body.twelfth_percentage,
        ug_cgpa: req.body.ug_cgpa,
        password: 'abcd1234'
    }

    studentColl.insertOne(user).then(res => { res.status(200).send("Student Added"); }).catch(e => {
        res.sendStatus(400)
    });

})

router.post('/tpo/adddrive', authenticateToken, async (req, res) => {
    // console.log(req.body);
    var job = {
        company_id: new ObjectId(req.body.company_id),
        job_title: req.body.job_title,
        tenth_cutoff: req.body.tenth_cutoff,
        twelfth_cutoff: req.body.twelfth_cutoff,
        ug_cutoff: req.body.ug_cutoff,
        job_location: req.body.job_location,
        job_ctc: req.body.job_ctc,
        branch: req.body.branch,

    };

    // var result = await companyColl.insertOne(job);


    // res.status(200).send(result);

    res.json(job);

})

router.get('/tpo/getcompanylist', authenticateToken, async (req, res) => {

    const search = req.query.search;

    const companyList = await companyDBColl.find({
        'company_name': {
            $regex: search,
            $options: 'i'
        }
    }, { projection: { 'label': '$company_name', id: '$_id', _id: 0 } }).toArray();

    res.status(200).json(companyList);

})

router.post('/tpo/addcompany', authenticateToken, async (req, res) => {

    var company = {
        company_name: req.body.company_name,
        company_website: req.body.company_website,
        interview_experiences: [],
        queries: []
    }
    try {
        const id = await companyDBColl.insertOne(company)
        res.status(200).json();
    }
    catch (e) {
        res.sendStatus(404);
    }


})

router.post('/tpo/addalumni', authenticateToken, async (req, res) => {

    try {

        var user = {
            user_id: req.body.user_id,
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            dob: req.body.dob,
            email: req.body.email,
            password: 'abcd1234'
        }

        await alumniColl.insertOne(user)
        res.status(200).json(user);
    } catch (e) {
        console.log(e);
    }

})


router.get('/tpo/getdrives', authenticateToken, async (req, res) => {


    const name = req.query.name || '';

    try {
        var result = await companyColl.aggregate([
            {
                $lookup: {
                    from: 'CompanyDB',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'companyDetails',
                }
            }, {
                $match: {
                    "companyDetails.company_name": {
                        $regex: name,
                        $options: 'i'
                    }
                }
            }, {
                $unwind: {
                    path: '$companyDetails'
                }
            }, {
                $project: {
                    '_id': 1,
                    'company_id': 1,
                    'job_title': 1,
                    'job_ctc': 1,
                    'company_name': '$companyDetails.company_name',
                    'company_website': '$companyDetails.company_website'

                }
            }
        ]).toArray();

        res.status(200).json(result);

    } catch (e) {
        console.log(e);
        res.sendStatus(400)
    }

})


router.get('/tpo/home', authenticateToken, async (req, res) => {

    const data = await getPrevYearOffers();
    res.status(200).json(data);


})

module.exports = router;