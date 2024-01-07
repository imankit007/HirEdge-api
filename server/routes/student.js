const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const { studentColl, companyColl, companyDBColl } = require('../utils/dbConfig');
const { UUID, ObjectId } = require('mongodb');
const morgan = require('morgan');
const { getDriveData } = require('../utils/dataFetching');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403);
        if (user.role != 'student') {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user
        next()
    })
}

router.get('/student/profile', authenticateToken, async (req, res) => {

    const user = await studentColl.findOne({
        'user_id': req.user.user_id.toString().toLowerCase()
    }, {
        projection: {
            '_id': 0, 'password': 0,
        }
    })

    res.status(200).send(user);
});


router.get('/student/jobs', async (req, res) => {
    const cursor = companyColl.find({}, {
        projection: {
            '_id': 0
        }
    })
    let data = [];
    for await (const doc of cursor) {
        data.push(doc);
    }
    res.status(200).send(data);
});

router.post('/student/addquery', (req, res) => {

    const query = {
        query_id: 1,
        company_id: req.query.company_id,
        query_type: req.query.query_type,
        query_title: req.body.query_title,
        query_description: req.body.query_description,
    };

    res.status(200).send({
        "message": "Query Posted Successfully",
        data: query
    })

});



router.get('/student/getdrives', authenticateToken, async (req, res) => {

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

        res.status(200).json(result);

    } catch (e) {
        console.log(e);
        res.sendStatus(400)
    }

})

router.get('/student/drive', authenticateToken, async (req, res) => {

    const id = req.query.id;

    try {
        let result = await getDriveData(id);

        if (result.registered.includes(req.user.user_id)) {
            result['applied'] = true;
        } else {
            result['applied'] = false;
        }
        delete result['registered'];
        res.status(200).json(result)

    }
    catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
})

router.get('/student/companies', authenticateToken, async (req, res) => {

    const page = Number(req.query.page);
    const filter = req.query.filter;

    if (filter == 'year') {
        const year = Number(req.query.year);

        // var result = await companyDBColl.find({
        //     'placements': { $elemMatch: { 'year': year } }
        // }, {
        //     projection: {
        //         company_name: 1,
        //         'placements.year': 1,
        //         'placements.no_of_offers': 1
        //     }
        // }).toArray();

        var result = await companyDBColl.aggregate([
            {
                $match: {
                    'placements.year': year
                }
            }, {
                $unwind: "$placements"
            }, {
                $match: {
                    'placements.year': year
                }
            }, {
                $project: {
                    'company_name': 1,
                    'offers': '$placements.no_of_offers',
                    '_id': 0
                }
            }
        ]).toArray();

        res.status(200).json(result);
    }


    // var result = await companyDBColl.find({}).skip((page - 1) * 10).limit(10).toArray();


    // res.status(200).json(result);

})


/*
      $group : {
  _id: "$placements.year",
  companies: {
    $push: { name: "$company_name", offers: "$placements.no_of_offers" }
  },
  total: {
    $sum: '$placements.no_of_offers'
  }
}
*/

router.get('/student/home', authenticateToken, async (req, res) => {

    const curr = new Date();
    const year = 2018;

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

    const currYearOffers = await companyDBColl.aggregate([
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

    const currentStatus = await companyColl.aggregate([
        {
            $limit:  3
        },{
            $lookup: {
                from: 'CompanyDB',
                localField: 'company_id',
                foreignField: '_id',
                as: 'companyDetails',
            }
        },
        {
            $unwind: {
                path: '$companyDetails'
            }
        },{
            $project: {
                'company_id': 1,
                'companyDetails.company_name': 1,
                'job_title' :1 
            }
        }
    ]).toArray();

    res.status(200).json({ "prevYearOffers": prevYearOffers[0], "currYearOffers": currYearOffers[0], 'currentStatus': currentStatus });
})



router.get('/student/apply', authenticateToken, async (req, res) => {

    const drive_id = req.query.drive_id;
    const student_id = req.user.user_id;
    // console.log(drive_id, student_id);

    const result = companyColl.findOneAndUpdate({
        '_id': new ObjectId(drive_id)
    }, {
        '$addToSet': {
            "registered": student_id,
        }
    })


    res.status(200).json(result);

})


module.exports = router;