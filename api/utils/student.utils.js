const { ObjectId } = require("mongodb");
const { companyDBColl, companyColl, studentColl } = require("./dbConfig");

const moment = require("moment-timezone");
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

        const student = studentColl.findOne({ 'user_id': String(user_id).toLowerCase().trim() },
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
        const current_time = moment().unix();

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
                            'tier': 1,
                            'ug_cutoff': 1,
                            'eligible': {
                                $and: [
                                    { $lte: ['$tenth_cutoff', qualification.tenth_percentage] }
                                    ,
                                    { $lte: ['$twelfth_cutoff', qualification.twelfth_percentage] },
                                    { $lte: ['$ug_cutoff', qualification.ug_cgpa] }
                                ]
                            },
                            registration_open: {
                                $gte: ['$registration_end', current_time]
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
                        $in: [usn, "$registered_students"]
                    },

                }
            }, {
                $unset: ["registered_students"]
            }
        ]).toArray()
        return data[0];
    } catch (error) {
        console.log(error);
    }
}

async function getParticipatingDrives(usn, page, limit) {
    try {
        const data = await companyColl.aggregate([
            {
                $match: {
                    'students.usn': usn
                }
            },
            {
                $facet: {
                    metadata: [{
                        $count: "totalCount"
                    }],
                    data: [{
                        $skip: (page - 1) * limit
                    }, {
                            $limit: limit
                        }, {
                            $project: {
                                "company_id": 1,
                                "company_name": 1,
                                "job_title": 1,
                                'current_status': 1,
                                'job_ctc': 1,
                                "tier": 1,
                                'status': {
                                    $filter: {
                                        input: '$students',
                                        cond: {
                                            $eq: ['$$this.usn', usn]
                                        }
                                    }
                                }
                            }
                        }]
                }
            }
        ]).toArray();

        if (data[0].data.length == 0) {

            return {
                drives: {
                    metadata: {
                        totalCount: 0,
                        pageCount: 1,
                        page: 1,
                    },
                    data: []
                }
            }

        }

        return {
            drives: {
                metadata: {
                    totalCount: data[0].metadata[0].totalCount,
                    pageCount: Math.ceil(data[0].metadata[0].totalCount / limit),
                    page: page
                },
                data: data[0].data
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getProfile, getDrives, getQualification, getDriveData, getParticipatingDrives }
