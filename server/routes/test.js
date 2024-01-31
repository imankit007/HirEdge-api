const express = require('express');
const router = express.Router();

const { companyDBColl } = require('../utils/dbConfig')

const { getOffersByYear, getPrevYearOfferCount } = require('../utils/dataFetching');
const { ObjectId } = require('mongodb');

router.get('/test', async (req, res) => {
    try {

        const id = req.query.id;

        const result = await companyDBColl.aggregate([
            {
                $match: {
                    _id: new ObjectId(id)
                }
            }, {
                $project: {
                    "interview_experiences": 1,
                    "_id": 0
                }
            }, {
                $lookup: {
                    from: "Experiences",
                    localField: "interview_experiences",
                    foreignField: "_id",
                    as: "interview_experiences"
                }
            }, {
                $unwind: "$interview_experiences"
            }, {
                $skip: 1
            }, {
                $limit: 5
            }
        ]).toArray();

        res.status(200).json({ result, id })
    }
    catch (e) {
        console.log(e)
    }
})


router.get('/test1', async (req, res) => {
    try {

        const pageID = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);
        const year = Number(req.query.year);
        const sort = req.query.sort;


        const data = await getOffersByYear(year, pageID, pageSize, sort);


        res.json(data);

    } catch (error) {
        console.error(error);
    }
})


module.exports = router;