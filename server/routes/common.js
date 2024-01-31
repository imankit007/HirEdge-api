const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const { studentColl, companyColl, companyDBColl } = require('../utils/dbConfig');
const { UUID, ObjectId } = require('mongodb');
const { getDriveData, getCurrYearOfferCount, getPrevYearOfferCount, getCompanies, getCompanyDetails, getInterviewExperiencesOfCompany, getOngoingDrives } = require('../utils/dataFetching');



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

router.get('/interviewexperiences', async (req, res) => {

    try {

        const id = req.query.company_id;
        const page = req.query.page;

        const result = await getInterviewExperiencesOfCompany(id, undefined, page)

        res.status(200).send(result);

    } catch (error) {
        console.log(error)
    }
})


router.get('/totaloffers', async (req, res) => {

    try {

        const data = await getCurrYearOfferCount();

        res.status(200).json(data);

    } catch (error) {
        console.error(error);
    }

});


module.exports = router;