const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
const morgan = require('morgan');
dotenv.config();
const { studentColl, tpoColl, hodColl, alumniColl, companyColl, con } = require('./utils/dbConfig');

var app = express();
app.use(morgan("dev"))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const { generateAuthToken, authenticateToken } = require('./utils/auth')

//router for student module
const studentRouter = require('./routes/student');

//router for tpo module
const tpoRouter = require('./routes/tpo');

//router for alumni module
const alumniRouter = require('./routes/alumni');

const hodRouter = require('./routes/hod');

const test = require('./routes/test');

app.use(studentRouter);
app.use(tpoRouter);
app.use(alumniRouter);
app.use(hodRouter)

//for development purposes 

app.use(test);

app.get('/', (req, res) => {
    res.send({ "message": "API is working" })
})

app.post('/login', async (req, res) => {

    req.body.user_id = req.body.user_id.toString().toLowerCase();

    let user = null;
    try {
        if (req.body.role == 'student') {
            user = await studentColl.findOne({
                'user_id': req.body.user_id
            })
        }
        if (req.body.role == 'tpo') {
            user = await tpoColl.findOne({
                'user_id': req.body.user_id
            })
        }
        if (req.body.role == 'hod') {
            user = await hodColl.findOne({
                'user_id': req.body.user_id
            })
        }

        if (req.body.role == 'alumni') {
            user = await alumniColl.findOne({
                'user_id': req.body.user_id
            })
        }
        if (user == null) {
            res.status(401).json({
                'message': 'User ID does not exist'
            })
        } else
            if (req.body.password == user.password) {
                const access_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, '1800s')
                const refresh_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, `${7 * 24 * 60 * 60}s`)

                con.execute('INSERT INTO auth (refresh_token, user_id, role )VALUES (?,?,?)', [
                    refresh_token, req.body.user_id, req.body.role
                ], function (err, results) {
                    console.log(err);
                })


                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'none',
                    secure: true,
                    path: '/'
                })
                res.status(200).json({
                    user_id: req.body.user_id,
                    role: req.body.role,
                    access_token,
                    refresh_token
                });
            } else {
                res.status(400).json({ message: "Authentication Failed" })
            }
    } catch (e) {
        console.log(e);
    }
})

app.get('/refresh', async (req, res) => {
    const cookies = req.cookies;
    let refreshToken = cookies.refresh_token;
    if (refreshToken == "undefined" || !refreshToken) {
        res.sendStatus(401);
    } else {
        con.execute('SELECT * from `auth` WHERE `refresh_token` = ?', [refreshToken], function (err, results) {
            if (err) throw err;
            if (results.length == 0) return res.sendStatus(401);
            jwt.verify(
                results[0].refresh_token,
                process.env.TOKEN_SECRET, (err, decoded) => {
                    if (err || results[0].user_id.toLowerCase() !== decoded.user_id.toLowerCase()) {
                        return res.sendStatus(403);
                    }
                    const access_token = jwt.sign({
                        'user_id': decoded.user_id,
                        'role': decoded.role
                    },
                        process.env.TOKEN_SECRET,
                        {
                            expiresIn: '1800s'
                        }
                    );
                    return res.status(200).json({
                        access_token, role: decoded.role
                    })
                }
            )

        })
    }

})

app.get('/logout', async (req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies.refresh_token;

    con.execute('DELETE FROM auth where refresh_token=?', [refreshToken], function (err, results) {
        if (err) throw err;
    })
    res.clearCookie('refresh_token').status(200).send("Logout Successful")
})

const { getOngoingDrives } = require('./utils/dataFetching')

app.get('/getdrives', async (req, res) => {

    try {
        const result = await getOngoingDrives();

        res.status(200).json(result)
    } catch (e) {
        console.log(e)
    }
})



app.listen(5000, async () => {
    console.log("Listening at PORT 5000");
})



