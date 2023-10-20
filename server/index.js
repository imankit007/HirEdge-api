const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const studentRouter = require('./routes/student')
const { studentColl } = require('./utils/dbConfig')

const { generateAuthToken } = require('./utils/auth')

dotenv.config();
var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(studentRouter)
app.get('/', (req, res) => {
    res.send({ "message": "API is working" })
})

app.post('/login', async (req, res) => {

    try {
        const user = await studentColl.findOne({
            'usn': req.body.userid.toString().toLowerCase()
        })
        console.log(req.body);
        const access_token = generateAuthToken({ user: req.body.userid, role: req.body.role })

        if (req.body.password == user.password) {
            res.status(200).send({
                userid: req.body.userid,
                role: req.body.role,
                access_token
            }); 
        } else {
            res.status(400).send("Authentication Failed")
        }
    } catch (e) {
        console.log(e);
    }

})


app.listen(5000, async () => {
    console.log("API is working");
})


module.exports = {
    studentColl
}