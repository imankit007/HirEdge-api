const { hodColl, studentColl, driveColl, companyDBColl } = require('../utils/dbConfig')




async function getDeptPlacementData(dept) {

    try {

        console.log(dept);

        const data = await studentColl.aggregate([
            {
                $match: {
                    "branch": dept
                }
            },
            {
                $facet: {
                    total: [
                        {
                            $count: "count"
                        }
                    ],
                    tier1: [
                        {
                            $match: {
                                "offers.tier": 1
                            }
                        }, {
                            $project: {
                                "_id": 0,
                                "first_name": 1,
                                middle_name: 1,
                                last_name: 1,
                                user_id: 1,
                                "offers": {
                                    $filter: {
                                        input: "$offers",
                                        as: "offer",
                                        cond: {
                                            $eq: ["$$offer.tier", 1]
                                        }
                                    }
                                }
                            }
                        }

                    ],
                    tier2: [
                        {
                            $match: {
                                "offers.tier": 2
                            }
                        }, {
                            $project: {
                                "_id": 0,
                                "first_name": 1,
                                middle_name: 1,
                                last_name: 1,
                                user_id: 1,
                                "offers": {
                                    $filter: {
                                        input: "$offers",
                                        as: "offer",
                                        cond: {
                                            $eq: ["$$offer.tier", 2]
                                        }
                                    }
                                }
                            }
                        }
                    ], tier3: [
                        {
                            $match: {
                                "offers.tier": 3
                            }
                        }, {
                            $project: {
                                "_id": 0,
                                "first_name": 1,
                                middle_name: 1,
                                last_name: 1,
                                user_id: 1,
                                "offers": {
                                    $filter: {
                                        input: "$offers",
                                        as: "offer",
                                        cond: {
                                            $eq: ["$$offer.tier", 3]
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    tier0: [
                        {
                            $match: {
                                "offers.tier": 0
                            }
                        }, {
                            $project: {
                                "_id": 0,
                                "first_name": 1,
                                middle_name: 1,
                                last_name: 1,
                                user_id: 1,
                                "offers": {
                                    $filter: {
                                        input: "$offers",
                                        as: "offer",
                                        cond: {
                                            $eq: ["$$offer.tier", 0]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]).toArray()



        return {
            total: data[0].total.length == 0 ? 0 : data[0].total[0].count,
            tier0: data[0].tier0,
            tier1: data[0].tier1,
            tier2: data[0].tier2,
            tier3: data[0].tier3,
        };


    } catch (error) {
        throw error;
    }

}




module.exports = { getDeptPlacementData }