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


module.exports = { studentColl }