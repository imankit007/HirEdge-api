const { MongoClient, ServerApiVersion } = require('mongodb');

const mysql = require('mysql2');

const client = new MongoClient(process.env.MONGODB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

var con = mysql.createConnection({
    host: process.env.SQL_URL,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB
})


con.connect(function (err) {
    if (err) throw err;
    console.log("SQL Connected");
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
const companyColl = DB.collection("Company");
const companyDBColl = DB.collection("CompanyDB");
const experienceColl = DB.collection("Experiences");

module.exports = { studentColl, hodColl, tpoColl, alumniColl, companyColl, companyDBColl, con, experienceColl }