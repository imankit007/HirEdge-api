
const express = require('express');
const router = express.Router();
const { companyDBColl, companyColl, alumniColl } = require('../utils/dbConfig');
const { getPrevYearOffers } = require('../common/index');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDriveData, getManageDriveData, getStudentDataForDrive, getRoundData } = require('../utils/dataFetching');

const { getDrives, getProfile, addStudent } = require('../utils/tpo.utils');


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


router.get('/profile', authenticateToken, async (req, res) => {

    try {

        const user_id = req.user.user_id;

        const profile = await getProfile(user_id);

        res.status(200).json(profile);

    } catch (error) {
        res.sendStatus(400);
    }
})

router.post('/students', authenticateToken, async (req, res) => {

    try {


        await addStudent(req.body);

        res.sendStatus(200)

    } catch (error) {
        console.log(error);
        if (error.code == 11000)
            res.status(400).json({ message: 'USN already exists' });
        else
            res.sendStatus(400);
    }

})

router.post('/drives', authenticateToken, async (req, res) => {
    try {
        var job = {
        company_id: new ObjectId(req.body.company_id),
        job_title: req.body.job_title,
        job_description: req.body.job_description,
        tenth_cutoff: req.body.tenth_cutoff,
        twelfth_cutoff: req.body.twelfth_cutoff,
        ug_cutoff: req.body.ug_cutoff,
        job_locations: req.body.job_locations,
        job_ctc: req.body.job_ctc,
        branch: req.body.branch,
        rounds: req.body.rounds,
            students: [],
            company_name: req.body.company_name
    };

        await companyColl.insertOne(job, {});

        res.status(200).json({ message: "Drive Posted Success" });
    }
    catch (err) {

        console.log(err);
        res.sendStatus(400);
    }
})

router.get('/companies', authenticateToken, async (req, res) => {

    const search = req.query.search;

    const companyList = await companyDBColl.find({
        'company_name': {
            $regex: search,
            $options: 'i'
        }
    }, { projection: { 'label': '$company_name', id: '$_id', _id: 0 } }).toArray();

    res.status(200).json(companyList);

})

router.post('/companies', authenticateToken, async (req, res) => {

    var company = {
        company_name: req.body.company_name,
        company_website: req.body.company_website,
        interview_experiences: [],
        queries: []
    }
    try {
        res.status(200).json();
    }
    catch (e) {
        res.sendStatus(404);
    }


})

router.post('/alumnis', authenticateToken, async (req, res) => {

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


router.get('/drives', authenticateToken, async (req, res) => {
    const s = String(req.query.s) || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    try {

        const drives = await getDrives(s, page, limit);

        res.status(200).json(drives);

    } catch (e) {
        console.log(e);
        res.sendStatus(400)
    }

})


router.get('/drive/:drive_id', authenticateToken, async (req, res) => {

    try {
        const drive_id = req.params.drive_id;
        if (!drive_id) {
            res.status(404).json({ message: 'Bad Request' })
        } else {
            const result = await getDriveData(drive_id);
            res.status(200).json(result);
        }
    }
    catch (error) {
        console.log(error);
    }
})

router.put('/drive/:drive_id/', authenticateToken, async (req, res) => {
    try {

        const id = req.query.id;
        if (!id)
            res.status(404).json({ "message": "Bad Request" });
        else {

            const result = await getManageDriveData(id);

            res.status(200).json(result)

        }

    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
})

router.get('/drive/:drive_id/students', authenticateToken, async (req, res) => {
    try {
        const id = req.query.id;
        if (!id)
            res.status(404).json({ "message": "Bad Request" });

        const data = await getStudentDataForDrive(id);

        res.status(200).json(data);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

router.get('/drive/:drive_id/rounds', authenticateToken, async (req, res) => {

    try {

        const id = req.params.drive_id;
        if (!id)
            res.status(404).json({ "message": "Bad Request" });

        const data = await getRoundData(id);

        res.status(200).json(data);

    } catch (error) {
        console.log(error)
        res.sendStatus(400);
    }
})




module.exports = router;