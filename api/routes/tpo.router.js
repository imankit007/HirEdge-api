
const express = require('express');
const router = express.Router();
const { companyDBColl, alumniColl, companyColl } = require('../utils/dbConfig');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDriveData, getManageDriveData, getStudentDataForDrive, getRoundData } = require('../utils/dataFetching');

const { getDrives, getProfile, addStudent, addCompany } = require('../utils/tpo.utils');

const upload = require('./../middlewares/multer.config');

const moment = require('moment-timezone');
const multer = require('multer');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)
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


        const student = {
            usn: String(req.body.usn).toLowerCase().trim(),
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            dob: req.body.dob,
            email: req.body.email,
            mobile: req.body.mobile,
            gender: req.body.gender,
            branch: req.body.branch,
            tenth_percentage: parseFloat(req.body.tenth_percentage),
            twelfth_percentage: parseFloat(req.body.twelfth_percentage),
            ug_cgpa: parseFloat(req.body.ug_cgpa),
            password: String(req.body.mobile).substring(6) + String(req.body.dob).substring(6)
        }

        await addStudent(student);

        console.log(student);

        res.sendStatus(200)

    } catch (error) {
        console.log(error);
        if (error.code == 11000)
            res.status(400).json({ message: 'USN already exists' });
        else
            res.sendStatus(400);
    }

})

router.post('/drives/upload', authenticateToken, upload.single('job_description_file'), async (req, res) => {
    try {   

        console.log(req.file)
        res.status(200).json({});
    }
    catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

router.post('/drives/', async (req, res) => {
    try {

        const tempTime = new Date(req.body.registration_end_time);
        const endTime = moment(req.body.registration_end_date)
            .hour(tempTime.getHours())
            .minutes(tempTime.getMinutes()).unix()

        var branches = [];
        Object.entries(req.body.branch).forEach((value) => {
            if (value[1] == true)
                branches.push(value[0]);
        })


        var job = {
            company_id: new ObjectId(req.body.company_id),
            company_name: req.body.company_name,
            job_title: req.body.job_title,
            job_description: req.body.job_description,
            tenth_cutoff: Number(req.body.tenth_cutoff),
            twelfth_cutoff: Number(req.body.twelfth_cutoff),
            ug_cutoff: Number(req.body.ug_cutoff),
            tier: req.body.tier,
            job_locations: req.body.job_locations || [],
            job_ctc: req.body.job_ctc,
            branch: branches,
            // rounds: req.body.rounds.map((round) => ({
            //     round_details: round.round_details,
            // })),
            registration_end: endTime,
            registration_status: 'open',
            current_status: 'Registration',
            registered_students: [],
            updates: []
        };

        const result = await companyColl.insertOne(job, {});


        res.status(200).json(result);

    } catch (error) {
        console.log(error);
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
        placements: []
    }

    await addCompany(company);


    try {
        res.status(200).json({ message: "Company Added Successfully" });
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
            const drive = await getDriveData(drive_id);
            // const studentData = await getStudentDataForDrive(drive_id);
            res.status(200).json({ drive });
        }
    }
    catch (error) {
        console.log(error);
    }
})

router.get('/drive/:drive_id/', authenticateToken, async (req, res) => {
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