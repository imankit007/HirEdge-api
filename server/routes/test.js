const express = require('express');
const router = express.Router();

const { companyDBColl } = require('../utils/dbConfig')

const { getOffersByYear } = require('../utils/dataFetching');

router.get('/test', async (req, res) => {
    try {

        const result = await getOffersByYear(2018);

        res.status(200).json(result)
    }
    catch (e) {
        console.log(e)
    }
})



module.exports = router;