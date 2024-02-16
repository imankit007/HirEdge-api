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
                    pageCount: Math.ceil(drives[0].metadata[0].totalCount / limit),
                    page: page
                },
                data: drives[0].data
            }
        }

    } catch (error) {
        throw new Error(error.message);
    }

}

async function getDriveData(id, usn, qualification) {
    try {
        const data = await companyColl.aggregate([
            {
                $match: {
                    '_id': new ObjectId(id)
                }
            }, {
                $lookup: {
                    from: 'CompanyDB',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_details',
                }
            }, {
                $unwind: "$company_details"
            },
            {
                $project: {
                    'company_details.interview_experiences': 0,
                    'company_details.placements': 0,
                }
            },
            {
                $addFields: {
                    'eligible': {
                        $and: [
                            { $lte: ['$tenth_cutoff', qualification.tenth_percentage] }
                            ,
                            { $lte: ['$twelfth_cutoff', qualification.twelfth_percentage] },
                            { $lte: ['$ug_cutoff', qualification.ug_cgpa] }
                        ]
                    },
                    "registered": {
                        $in: [usn, "$students.usn"]
                    },

                }
            }, {
                $unset: ["students"]
            }
        ]).toArray()
        return data[0];
    } catch (error) {
        console.log(error);
    }
}

async function getParticipatingDrives(usn) {
    try {

        const data = await companyColl.aggregate([
            {
                $match: {
                    'students.usn': usn
                }
            }, {
                $limit: 5
            }, {
                $project: {
                    "company_id": 1,
                    "company_name": 1,
                    "job_title": 1,
                    'current_status': 1,
                    'status': {
                        $filter: {
                            input: '$students',
                            cond: {
                                $eq: ['$$this.usn', usn]
                            }
                        }
                    }
                }
            }
        ]).toArray();

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = { getProfile, getDrives, getQualification, getDriveData, getParticipatingDrives }




