const { ObjectId } = require("mongodb");
const { companyDBColl, companyColl, tpoColl } = require("./dbConfig");



async function getDrives(s = '', page = 1, limit = 10) {

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
                        $regex: s,
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
            }, {
                $sort: {
                    'company_name': 1
                }
            }, {
                $group: { _id: null, count: { $sum: 1 }, drives: { $push: "$$ROOT" } }
            }, {
                $project: {
                    count: 1,
                    drives: {
                        $slice: ["$drives", (page - 1) * limit, limit]
                    },
                    no_of_pages: {
                        $ceil: {
                            $divide: ["$count", limit]
                        }

                    }
                }
            }
        ]).toArray();

        return result[0];

    } catch (e) {
        console.log(e);
    }
}


async function getProfile(user_id) {
    try {
        const user = await tpoColl.findOne({
            'user_id': user_id.toString().toLowerCase()
        }, {
            projection: { 'password': 0, '_id': 0 },

        });

        return user;

    } catch (error) {
        throw error;
    }
}


module.exports = { getDrives, getProfile }