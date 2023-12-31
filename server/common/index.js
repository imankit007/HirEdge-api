
const { companyColl, companyDBColl } = require('../utils/dbConfig');

async function getPrevYearOffers() {

    const prevYearOffers = await companyDBColl.aggregate([
        {
            $match: {
                "placements.year": 2017
            }
        }, {
            $unwind: "$placements"
        }, {
            $match: {
                'placements.year': 2017
            }
        }, {
            $group: {
                _id: "$placements.year",
                total: {
                    $sum: '$placements.no_of_offers'
                }
            }
        }
    ]).toArray();


    return { 'prevYearOffers': prevYearOffers[0] }

}

async function getCurrentYearOffers() {

}

module.exports = { getPrevYearOffers }