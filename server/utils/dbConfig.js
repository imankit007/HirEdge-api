const { MongoClient, ServerApiVersion } = require('mongodb');


const client = new MongoClient(process.env.MONGODB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

client.connect().then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.log(e);
})


const DB = client.db("HirEdge");

const studentColl = DB.collection("Students");
const hodColl = DB.collection("HOD");
const tpoColl = DB.collection("TPO");
const alumniColl = DB.collection("Alumni");
const companyColl = DB.collection("Company");


module.exports = { studentColl, hodColl, tpoColl, alumniColl, companyColl }