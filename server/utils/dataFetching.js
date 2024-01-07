const { ObjectId } = require("mongodb");
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


async function getDriveData(id) {

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
            }, {
                $project: {
                    'company_details.interview_experiences': 0,
                    'company_details.placements': 0,
                }
            }
        ]).toArray()
        return data[0];
    } catch (error) {
        console.log(error);
    }
}

async function getManageDriveData(id) {
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
            }, {
                $project: {
                    '_id': 1,
                    'job_title': 1,
                    'tenth_cutoff': 1,
                    'twelfth_cutoff': 1,
                    'ug_cutoff': 1,
                    'job_location': 1,
                    'job_ctc': 1,
                    'branch': 1,
                    'rounds': 1,
                    'job_description': 1,
                    'company_details.company_name': 1,
                    'company_details.company_website': 1,
                }
            }
        ]).toArray()
        return data[0];
    } catch (e) {
        console.log(e)
    }
}

async function getStudentDataForDrive(id) {
    try {

        const data = await companyColl.aggregate([
            {
                $match: {
                    '_id': new ObjectId(id)
                }
            }, {
                $project: {
                    'registered': 1
                }
            }, {
                $unwind: "$registered"
            }, {
                $lookup: {
                    from: 'Students',
                    localField: 'registered.id',
                    foreignField: 'user_id',
                    as: 'student_data'
                }
            }, {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ $arrayElemAt: ["$student_data", 0] }, "$$ROOT"]

                    }
                }
            }, {
                $addFields: {
                    "status": '$registered.status'
                }
            }, {
                $project: {
                    "student_data": 0,
                    "password": 0,
                    "registered": 0,

                }
            }
        ]
        ).toArray();

        return data;

    } catch (error) {
        console.log(error)
    }
}


async function getRoundData(id) {
    try {

        const data = await companyColl.findOne({
            "_id": new ObjectId(id)
        }, {
            projection: {
                "rounds": 1
            }
        })
        return data['rounds']
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getTotalOffersInYear, getOffersByYear, getOngoingDrives, getDriveData, getManageDriveData, getStudentDataForDrive, getRoundData }