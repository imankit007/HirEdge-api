const express = require('express');
const { alumniColl, companyDBColl, experienceColl } = require('../utils/dbConfig');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getInterviewExperiencesOfCompany, getCompanyListOptions, getCompanies } = require('../utils/dataFetching');
const { ObjectId } = require('mongodb');
// const { authenticateToken } = require('../utils/auth')
const { } = require('../utils/dataFetching')

const { getCompanyDetails } = require('../utils/alumni.utils')

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


router.get('/profile', authenticateToken, (req, res) => {

    alumniColl.findOne({
        'email': req.user.user_id
    }, {
        projection: {
            'password': false
        }
    }).then((user) => {
        res.status(200).send(user);
    }).catch((e) => {
        return res.sendStatus(404);
    })
});

router.get('/companies', async (req, res) => {
    try {
        const search = String(req.query.s) || '';
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        const data = await getCompanies(search, page, limit);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
    }

})

router.get('/company/:company_id', authenticateToken, async (req, res) => {

    try {
        const company_id = req.params.company_id;

        const data = await getCompanyDetails(company_id);
        res.status(200).json(data);

    } catch (error) {   
        console.log(error)
    }

});

router.post('/company/:company_id/experience', authenticateToken, async (req, res) => {

    try {

        const company_id = req.params.company_id;

        const experience = {
            experience: req.body.experience,
            difficulty: req.body.difficulty,
            important_topics: String(req.body.important_topics).split(',').map((item) => (item.trim())),
            postedOn: Date.now(),
            postedBy: {
                role: 'alumni',
                user_id: req.user.user_id
            }
        }

        const exp = await experienceColl.insertOne(experience);

        await companyDBColl.updateOne({
            "_id": new ObjectId(company_id)
        }, {
            $push: {
                "interview_experiences": exp.insertedId,
            }
        })


        res.status(200).send({ message: "Experience posted successfully" });

    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }

});

router.get('/experiences', authenticateToken, async (req, res) => {

    try {

        const id = req.query.id;

        const data = await getInterviewExperiencesOfCompany(id);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
    }

})


module.exports = router;