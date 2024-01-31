const express = require('express');
const { alumniColl, companyDBColl, experienceColl } = require('../utils/dbConfig');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getCompanyDetails, getInterviewExperiencesOfCompany } = require('../utils/dataFetching');
const { ObjectId } = require('mongodb');
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

router.get('/alumni/companies', authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || '';
        const limit = Number(req.query.limit) || 0;
        const page = Number(req.query.page) - 1 || 0;
        const skip = page * limit;

    const companyList = await companyDBColl.find({
        'company_name': {
            $regex: search,
            $options: 'i'
        }
    }, { projection: { 'label': '$company_name', id: '$_id', _id: 0 } }).skip(skip).limit(limit).toArray();

    res.status(200).json(companyList);
    } catch (error) {
        console.error(error);
    }

})

router.get('/alumni/company', authenticateToken, async (req, res) => {

    try {
        const company_id = req.query.id;

        const data = await getCompanyDetails(company_id);
        res.status(200).json(data);

    } catch (error) {
        console.log(error)
    }

});

router.post('/alumni/experience', authenticateToken, async (req, res) => {

    try {

        console.log(req.body);

        const id = req.query.id;



        const exp = await experienceColl.insertOne(req.body);

        await companyDBColl.updateOne({
            "_id": new ObjectId(id)
        }, {
            $push: {
                "interview_experiences": exp.insertedId,
            }
        })

        res.status(200).send(exp);

    } catch (error) {
        console.error(error);
    }

});

router.get('/alumni/experiences', authenticateToken, async (req, res) => {

    try {

        const id = req.query.id;

        const data = await getInterviewExperiencesOfCompany(id);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
    }

})


module.exports = router;