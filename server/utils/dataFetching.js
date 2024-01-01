const { companyDBColl, companyColl } = require("./dbConfig");

async function getTotalOffersInYear(year) {
    try {
        const result = await companyDBColl.aggregate([{
            $match: {
                "placements.year": year
            }
        }, {
            $unwind: "$placements"
        },
        {
            $match: {
                'placements.year': year
            }
        }, {
            $project: {
                'no_of_offers': {
                    $size: "$placements.placed_students"
                },
                'company_name': 1,
                'placements.year': 1,
            }
        },
        {
            $group: {
                _id: "$placements.year",
                total: {
                    $sum: '$no_of_offers'
                }
            }
        }
        ]).toArray();
        return result[0];
    }
    catch (e) {
        console.log(e)
    }
}


async function getOffersByYear(year, pageNumber, pageSize) {

    try {
        const result = await companyDBColl.aggregate([
            {
                $match: {
                    "placements.year": year
                }
            }, {
                $unwind: "$placements"
            },
            {
                $match: {
                    'placements.year': year
                }
            }, {
                $project: {
                    'no_of_offers': {
                        $size: "$placements.placed_students"
                    },
                    'company_name': 1,
                }
            }, {
                $sort: {
                    'no_of_offers': 1
                }
            }, {
                $limit: 10
            }
        ]).toArray();

        return result;
    } catch (e) {
        console.log(e);
    }

}


async function getOngoingDrives() {

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
                        $regex: '',
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

        return result;

    } catch (e) {
        console.log(e);
    }
}


module.exports = { getTotalOffersInYear, getOffersByYear, getOngoingDrives }