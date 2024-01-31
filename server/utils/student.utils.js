const { ObjectId } = require("mongodb");
const { companyDBColl, companyColl, studentColl } = require("./dbConfig");


async function getProfile(user_id) {

    try {

        const user = await studentColl.findOne({
            'user_id': user_id.toString().toLowerCase()
        }, {
            projection: {
                '_id': 0, 'password': 0,
            }
        })

        return user;

    } catch (error) {
        console.log(error);
    }

}

async function getQualification(user_id) {
    try {

        const student = studentColl.findOne({ 'user_id': user_id },
            {
                projection: {
                    "_id": 0,
                    'tenth_percentage': 1,
                    'twelfth_percentage': 1,
                    'ug_cgpa': 1
                }
            })

        return student;

    } catch (error) {
        throw error;
    }
}

async function getDrives(s = '', page = 1, limit = 10, qualification) {
    try {

        var drives = await companyColl.aggregate([
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
                $facet: {
                    metadata: [{ $count: 'totalCount' }],
                    data: [{
                        $unwind: {
                            path: '$companyDetails'
                        }
                    }, {
                        $skip: (page - 1) * limit
                    }, {
                        $limit: limit
                    }, {
                        $project: {
                            'company_id': 1,
                            'job_title': 1,
                            'job_ctc': 1,
                            'company_name': '$companyDetails.company_name',
                            'company_website': '$companyDetails.company_website',
                            'tenth_cutoff': 1,
                            'twelfth_cutoff': 1,
                            'ug_cutoff': 1,
                            'eligible': {
                                $and: [
                                    { $lte: ['$tenth_cutoff', qualification.tenth_percentage] }
                                    ,
                                    { $lte: ['$twelfth_cutoff', qualification.twelfth_percentage] },
                                    { $lte: ['$ug_cutoff', qualification.ug_cgpa] }
                                ]
                            }
                        }
                    }]
                }
            }
        ]).toArray();
        return {
            drives: {
                metadata: {
                    totalCount: drives[0].metadata[0].totalCount,
                    pageCount: Math.ceil(drives[0].metadata[0].totalCount / limit)
                },
                data: drives[0].data
            }
        }

    } catch (error) {
        throw new Error(error.message);
    }

}

module.exports = { getProfile, getDrives, getQualification }




/* 

[
            {
                $unwind: {
                    path: '$companyDetails'
                }
            }, {
                $project: {
                    'company_id': 1,
                    'job_title': 1,
                    'job_ctc': 1,
                    'company_name': '$companyDetails.company_name',
                    'company_website': '$companyDetails.company_website',
                    'tenth_cutoff': 1,
                    'twelfth_cutoff': 1,
                    'ug_cutoff': 1,
                    'eligible': {
                        $and: [
                            { $lte: ['$tenth_cutoff', qualification.tenth_percentage] }
                            ,
                            { $lte: ['$twelfth_cutoff', qualification.twelfth_percentage] },
                            { $lte: ['$ug_cutoff', qualification.ug_cgpa] }
                        ]
                    }
                }
            }
            , {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    drives: { $push: "$$ROOT" }
                }
            },
            {
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
        ]

*/