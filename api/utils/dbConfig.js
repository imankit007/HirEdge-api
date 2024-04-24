const { MongoClient, ServerApiVersion } = require('mongodb');


const client = new MongoClient(process.env.MONGODB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})




client.connect().then(() => {
    console.log("MongoDB Database Connected");
}).catch((e) => {
    console.log(e);
})


const DB = client.db("HirEdge");
const studentColl = DB.collection("Students");
const hodColl = DB.collection("HOD");
const tpoColl = DB.collection("TPO");
const alumniColl = DB.collection("Alumni");
const driveColl = DB.collection("Drives");
const companyDBColl = DB.collection("Companies");
const experienceColl = DB.collection("Experiences");
const updatesColl = DB.collection("Updates");

module.exports = { studentColl, hodColl, tpoColl, alumniColl, driveColl, companyDBColl, experienceColl, updatesColl }