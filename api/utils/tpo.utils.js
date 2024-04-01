const { ObjectId } = require("mongodb");
const { companyDBColl, companyColl, tpoColl, studentColl } = require("./dbConfig");



async function getDrives(s, page, limit) {

    try {
        var result = await companyColl.aggregate([
            {

                $match: {
                    company_name: {
                        $regex: s,
                        $options: "i"
                    }
                }
            }, {
                $facet: {
                    metadata: [{ $count: "totalCount" }],
                    data: [{
                        $skip: (page - 1) * limit
                    }, {
                            $limit: limit
                        },
                        {
                            $project: {
                                company_name: 1,
                                company_id: 1,
                                job_title: 1,
                                job_ctc: 1,
                                registered_students: {
                                    $size: "$registered_students"
                                },
                                registration_status: 1
                            }
                        }
                    ]
                }
            }
        ]).toArray();

        return {
            drives: {
                metadata: {
                    totalCount: result[0].metadata[0].totalCount,
                    pageCount: Math.ceil(result[0].metadata[0].totalCount / limit),
                    page: page
                },
                data: result[0].data
            }
        };

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


async function addStudent(student) {

    try {

        var student = {
            user_id: String(student.usn).trim().toLowerCase(),
            first_name: String(student.first_name).trim(),
            middle_name: String(student.middle_name).trim(),
            last_name: String(student.last_name).trim(),
            dob: student.dob,
            email: String(student.email).trim(),
            mobile: String(student.mobile).trim(),
            gender: student.gender,
            branch: student.branch,
            tenth_percentage: parseFloat(student.tenth_percentage),
            twelfth_percentage: parseFloat(student.twelfth_percentage),
            ug_cgpa: parseFloat(student.ug_cgpa)

        }

        await studentColl.insertOne(student)

        console.log(student);

    } catch (error) {
        throw error;
    }
}


module.exports = { getDrives, getProfile, addStudent }