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

async function getPrevYearOfferCount() {
    try {

        const year = new Date().getFullYear();
        const prevYear = year - 2;

        const data = await getTotalOffersInYear(prevYear);

        return data;
    } catch (error) {
        console.error(error);
    }
}

async function getCurrYearOfferCount() {
    try {
        const currYear = new Date().getFullYear() - 1;

        const data = await getTotalOffersInYear(currYear);

        return data;
    } catch (error) {
        console.log(error)
    }
}


async function getOffersByYear(year, pageNumber = 1, pageSize = 10, sort = 'asc') {

    try {
        const result = await companyDBColl.aggregate([{
            $project: {
                placements: 1,
                company_name: 1
            }
        },
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
                    'no_of_offers': sort == 'desc' ? -1 : 1
                }
            }, {
                $skip: ((pageNumber - 1) * pageSize)
            }, {
                $limit: pageSize
            }
        ]).toArray();

        return result;
    } catch (e) {
        console.log(e);
    }

}


async function getOngoingDrives(page = 1, limit = 10) {

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
            }, {
                $skip: (page - 1) * limit
            }, {
                $limit: limit
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
            },
            {
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
};


async function getCompanyDetails(id) {
    try {

        const data = await companyDBColl.findOne({
            "_id": new ObjectId(id)
        }, {
            projection: {
                'interview_experiences': 0,
            }
        })

        return data;

    } catch (error) {
        console.log(error)
    }
}

async function getInterviewExperiencesOfCompany(id, page, limit) {
    try {
        const toSkip = (page - 1) * limit;

        const data = await companyDBColl
            .aggregate([
                {
                    $match: {
                        _id: new ObjectId(id),
                    },
                },
                {
                    $project: {
                        "metadata.totalCount": {
                            $size: "$interview_experiences",
                        },
                        "metadata.pageCount": {
                            $ceil: {
                                $divide: [
                                    {
                                        $size: "$interview_experiences",
                                    },
                                    limit,
                                ],
                            },
                        },
                        data: {
                            $slice: ["$interview_experiences", toSkip, limit],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "Experiences",
                        localField: "data",
                        foreignField: "_id",
                        as: "data",
            },
                },
            ])
            .toArray();

        return {
            experiences: {
                metadata: {
                    totalCount: data[0].metadata.totalCount,
                    pageCount: data[0].metadata.pageCount,
                    page: page,
                },
                data: data[0].data,
            },
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getCompanies(s, page, limit) {
    try {
        const companies = await companyDBColl
            .aggregate([
                {
                    $match: {
                        company_name: {
                    $regex: s,
                            $options: "i",
                        },
                    },
                },  
        {
            $facet: {
                metadata: [{ $count: "totalCount" }],
                data: [
                    {
                        $sort: {
                            company_name: 1,
                        },
                    },
                    {
                        $skip: (page - 1) * limit,
                    },
                    {
                        $limit: limit,
                    },
                    {
                        $project: {
                            company_name: 1,
                            company_website: 1,
                            placements: {
                                $sum: "$placements.placed_students"
                            }
                                },
                            },
                        ],
                    },
                },
            ])
            .toArray();

        if (companies[0].data.length == 0) {
            return {
                companies: {
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
            companies: {
                metadata: {
                    totalCount: companies[0].metadata[0].totalCount,
                    pageCount: Math.ceil(companies[0].metadata[0].totalCount / limit),
                    page: page,
                },
                data: companies[0].data,
            },
        };
    } catch (error) {
        console.error(error);
    }
}


async function getCompanyListOptions(s, page) {

    try {

        const result = await companyDBColl.aggregate([
            {
                $match: {
                    company_name: {
                        $regex: s,
                        $options: "i"
                    },
                }
            },
            {
                $facet: {
                    metadata: [
                        {
                            $count: 'totalCount'
                        }
                    ],
                    data: [{
                        $skip: (page - 1) * 50
                    }, {
                            $limit: 50
                        }, {
                            $project: {
                                'title': "$company_name",
                                "id": "$_id",
                                "_id": 0
                            }
                        }]
                }
            }
        ]).toArray()

        return {
            companies: {
                metadata: {
                    totalCount: result[0].metadata[0].totalCount,
                    pageCount: Math.ceil(result[0].metadata[0].totalCount / 50),
                    page: page,
                },
                data: result[0].data
            }
        };

    } catch (error) {
        throw error;
    }

}


module.exports = {
    getTotalOffersInYear, getOffersByYear,
    getOngoingDrives, getDriveData, getManageDriveData,
    getStudentDataForDrive, getRoundData, getCompanyDetails,
    getInterviewExperiencesOfCompany, getPrevYearOfferCount, getCurrYearOfferCount, getCompanies,
    getCompanyListOptions
}