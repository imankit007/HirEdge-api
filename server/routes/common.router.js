const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const { studentColl, companyColl, companyDBColl, experienceColl } = require('../utils/dbConfig');
const { UUID, ObjectId } = require('mongodb');
const { getDriveData, getCurrYearOfferCount, getPrevYearOfferCount, getCompanies, getCompanyDetails, getInterviewExperiencesOfCompany, getOngoingDrives, getCompanyListOptions } = require('../utils/dataFetching');



router.get('/companies', async (req, res) => {

    try {

        const s = String(req.query.s);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        const data = await getCompanies(s, page, limit);

        res.status(200).json(data);

    } catch (error) {
        console.log(error);
    }

})


router.get('/company', async (req, res) => {

    try {

        // const id = req.query.company_id;

        const data = await getCompanyDetails(id);

        res.send(data);
    } catch (error) {
        console.log(error);
    }
})

router.get('/company/:company_id/interviewexperiences', async (req, res) => {

    try {

        const id = String(req.params.company_id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 4;
        const result = await getInterviewExperiencesOfCompany(id, page, limit)

        res.status(200).send(result);

    } catch (error) {
        console.log(error)
    }
});

router.post(
    "/company/:company_id/experiences",
    async (req, res) => {
        try {
            const company_id = req.params.company_id;


            const inserted = await experienceColl.insertOne({
                experience: req.body.experience,
                difficulty: req.body.difficulty,
                important_topics: req.body.important_topics,
                "posted_on": Date.now()
            })

            await companyDBColl.updateOne({
                _id: new ObjectId(company_id)
            }, {
                $addToSet: {
                    "interview_experiences": inserted.insertedId
                }
            })


            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(400);
        }
    }
);


router.get('/totaloffers', async (req, res) => {

    try {

        const data = await getCurrYearOfferCount();

        res.status(200).json(data);

    } catch (error) {
        console.error(error);
    }

});

router.get('/options/companies', async (req, res)=>{

    try {
        
        const s = String(req.query.s) || '';
        const page = Number(req.query.page) || 1;

        const data = await getCompanyListOptions(s, page);

        res.status(200).json(data);

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }


})


module.exports = router;