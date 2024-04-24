const { ObjectId } = require("mongodb");
const { companyDBColl, driveColl } = require("./dbConfig");



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


module.exports = { getCompanyDetails }